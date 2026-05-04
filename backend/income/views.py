import xml.sax.saxutils as saxutils
from django.http import FileResponse, JsonResponse, HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from .models import Income
from .serializers import IncomeSerializer
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from datetime import datetime
from django.db.models import Sum

class IncomePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = IncomePagination

    def get_queryset(self):
        queryset = Income.objects.filter(user=self.request.user).select_related('category').order_by('-date', '-created_at')
        
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        
        if month and year:
            try:
                queryset = queryset.filter(date__month=int(month), date__year=int(year))
            except ValueError:
                pass
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['GET'])
    def export(self, request):
        try:
            queryset = self.get_queryset()
            
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
            elements.append(Paragraph("Income Statement", title_style))
            elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%d %B %Y, %H:%M')}", styles['Normal']))
            elements.append(Spacer(1, 20))
            
            # Summary
            total_income = queryset.aggregate(Sum('amount'))['amount__sum'] or 0
            elements.append(Paragraph("Financial Summary", styles['Heading2']))
            summary_data = [
                ["Total Volume", f"INR {total_income:,.2f}"],
                ["Total Records", f"{queryset.count()}"],
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
            data = [["Date", "Source", "Category", "Amount"]]
            
            for income in queryset:
                data.append([
                    income.date.strftime('%Y-%m-%d'),
                    saxutils.escape(income.source),
                    saxutils.escape(income.category.name) if income.category else 'UNCATEGORIZED',
                    f"{income.amount:,.2f}"
                ])
                
            table = Table(data, colWidths=[80, 200, 150, 100], repeatRows=1)
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
            response['Content-Disposition'] = f'attachment; filename="Income_Report_{datetime.now().strftime("%Y%m%d")}.pdf"'
            response['Content-Length'] = len(pdf)
            return response
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
