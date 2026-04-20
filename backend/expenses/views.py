import xml.sax.saxutils as saxutils
from django.http import FileResponse, JsonResponse, HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import UserRateThrottle
from .models import Expense
from .serializers import ExpenseSerializer
from .ocr_service import scan_receipt_image
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from datetime import datetime
from django.db.models import Sum

from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework import status

class ExpensePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100  # Cap to prevent abuse


class ReceiptScanRateThrottle(UserRateThrottle):
    """Rate limit receipt scans to prevent AI API abuse."""
    scope = 'receipt_scan'

class ExpenseFilter(filters.FilterSet):
    min_amount = filters.NumberFilter(field_name="amount", lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name="amount", lookup_expr='lte')
    start_date = filters.DateFilter(field_name="date", lookup_expr='gte')
    end_date = filters.DateFilter(field_name="date", lookup_expr='lte')

    class Meta:
        model = Expense
        fields = ['category', 'is_recurring', 'recurrence_type']

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ExpensePagination
    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    filterset_class = ExpenseFilter
    search_fields = ['title', 'notes']
    ordering_fields = ['date', 'amount', 'title']
    ordering = ['-date']

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).select_related('category')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['GET'])
    def export(self, request):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
            elements = []
            
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.black,
                alignment=0,
                spaceAfter=20,
                fontName='Helvetica-Bold'
            )
            
            # Header
            elements.append(Paragraph("Expense Statement", title_style))
            elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%d %B %Y, %H:%M')}", styles['Normal']))
            elements.append(Spacer(1, 20))
            
            # Summary
            total_expense = queryset.aggregate(Sum('amount'))['amount__sum'] or 0
            elements.append(Paragraph("Expense Summary", styles['Heading2']))
            summary_data = [
                ["Total Spending", f"INR {total_expense:,.2f}"],
                ["Total Transactions", f"{queryset.count()}"],
            ]
            summary_table = Table(summary_data, colWidths=[150, 200])
            summary_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ]))
            elements.append(summary_table)
            elements.append(Spacer(1, 30))
            
            # Data Table
            elements.append(Paragraph("Transaction Detail", styles['Heading2']))
            data = [["Date", "Title", "Category", "Amount"]]
            
            for expense in queryset:
                data.append([
                    expense.date.strftime('%Y-%m-%d'),
                    saxutils.escape(expense.title),
                    saxutils.escape(expense.category.name) if expense.category else 'UNCATEGORIZED',
                    f"{expense.amount:,.2f}"
                ])
                
            table = Table(data, colWidths=[80, 180, 150, 120], repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.black),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            elements.append(table)
            doc.build(elements)
            
            pdf = buffer.getvalue()
            buffer.close()
            
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Expense_Report_{datetime.now().strftime("%Y%m%d")}.pdf"'
            response['Content-Length'] = len(pdf)
            return response
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    @action(detail=False, methods=['POST'], throttle_classes=[ReceiptScanRateThrottle])
    def scan_receipt(self, request):
        if 'image' not in request.FILES:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        result = scan_receipt_image(image_file)
        
        if "error" in result:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response(result)
