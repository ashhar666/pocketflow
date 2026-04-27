from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from io import BytesIO
from django.http import HttpResponse
from django.utils.html import escape
import calendar

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from expenses.models import Expense
from budgets.models import Budget
from income.models import Income
from savings.models import SavingsGoal
from categories.models import Category

class DownloadReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch,
                                leftMargin=0.5*inch, rightMargin=0.5*inch, title="Financial Report")
        styles = getSampleStyleSheet()

        # Custom Styles
        title_st = ParagraphStyle('Title', parent=styles['Title'], fontSize=28,
                                  textColor=colors.HexColor('#111827'), spaceAfter=5, alignment=TA_LEFT, fontName='Helvetica-Bold')
        sub_st = ParagraphStyle('Sub', parent=styles['Normal'], fontSize=10,
                                textColor=colors.HexColor('#6b7280'), spaceAfter=20, alignment=TA_LEFT)
        h_st = ParagraphStyle('H', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor('#111827'),
                              spaceBefore=25, spaceAfter=12, fontName='Helvetica-Bold')
        n_st = ParagraphStyle('N', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#374151'), spaceAfter=6)
        label_st = ParagraphStyle('Label', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#6b7280'), 
                                  alignment=TA_CENTER, fontName='Helvetica-Bold')
        value_st = ParagraphStyle('Value', parent=styles['Normal'], fontSize=16, textColor=colors.HexColor('#059669'), 
                                  alignment=TA_CENTER, fontName='Helvetica-Bold')
        
        story = []
        today = timezone.now().date()
        
        # Header
        story.append(Paragraph('Financial Statement', title_st))
        story.append(Paragraph(f'Generated on {today.strftime("%B %d, %Y")} • {request.user.email}', sub_st))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb'), spaceAfter=20))

        # Data Collection
        start_of_month = today.replace(day=1)
        _, last_day = calendar.monthrange(today.year, today.month)
        end_of_month = today.replace(day=last_day)
        end_of_prev = start_of_month - timedelta(days=1)
        start_of_prev = end_of_prev.replace(day=1)

        cur_exp = Expense.objects.filter(user=request.user, date__gte=start_of_month, date__lte=end_of_month)
        prev_exp = Expense.objects.filter(user=request.user, date__gte=start_of_prev, date__lte=end_of_prev)
        cur_inc = Income.objects.filter(user=request.user, date__gte=start_of_month, date__lte=end_of_month)
        prev_inc = Income.objects.filter(user=request.user, date__gte=start_of_prev, date__lte=end_of_prev)

        cur_total = float(cur_exp.aggregate(total=Sum('amount'))['total'] or 0)
        prev_total = float(prev_exp.aggregate(total=Sum('amount'))['total'] or 0)
        cur_inc_total = float(cur_inc.aggregate(total=Sum('amount'))['total'] or 0)
        prev_inc_total = float(prev_inc.aggregate(total=Sum('amount'))['total'] or 0)
        
        savings_qs = SavingsGoal.objects.filter(user=request.user)
        total_savings = float(savings_qs.aggregate(total=Sum('current_amount'))['total'] or 0)
        
        all_income = float(Income.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0)
        all_expenses = float(Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0)
        total_balance = all_income - all_expenses

        # Summary Highlights Cards
        summary_data = [
            [Paragraph('NET BALANCE', label_st), Paragraph('CURRENT INCOME', label_st), Paragraph('CURRENT EXPENSES', label_st)],
            [Paragraph(f'Rs. {total_balance:,.2f}', value_st), 
             Paragraph(f'Rs. {cur_inc_total:,.2f}', value_st), 
             Paragraph(f'Rs. {cur_total:,.2f}', value_st.clone(name='Vred', textColor=colors.HexColor('#dc2626')))]
        ]
        summary_table = Table(summary_data, colWidths=[2.3*inch, 2.3*inch, 2.3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f9fafb')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('ROUNDEDCORNERS', [10, 10, 10, 10]),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 20))

        # Monthly Comparison
        story.append(Paragraph('Monthly Performance', h_st))
        exp_chg = ((cur_total - prev_total) / prev_total) * 100 if prev_total > 0 else (100 if cur_total > 0 else 0)
        inc_chg = ((cur_inc_total - prev_inc_total) / prev_inc_total) * 100 if prev_inc_total > 0 else (100 if cur_inc_total > 0 else 0)

        perf_rows = [
            [Paragraph('<b>Metric</b>', n_st), Paragraph('<b>This Month</b>', n_st), Paragraph('<b>Last Month</b>', n_st), Paragraph('<b>Change (%)</b>', n_st)],
            ['Expenses', f'Rs. {cur_total:,.2f}', f'Rs. {prev_total:,.2f}', f'{exp_chg:+.1f}%'],
            ['Income', f'Rs. {cur_inc_total:,.2f}', f'Rs. {prev_inc_total:,.2f}', f'{inc_chg:+.1f}%']
        ]
        perf_t = Table(perf_rows, colWidths=[2*inch, 1.6*inch, 1.6*inch, 1.4*inch])
        perf_t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafafa')]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(perf_t)

        # Expense Breakdown
        story.append(Paragraph('Expenses by Category', h_st))
        cats = cur_exp.values('category__name').annotate(amount=Sum('amount')).order_by('-amount')
        if cats:
            cat_rows = [[Paragraph('<b>Category</b>', n_st), Paragraph('<b>Amount</b>', n_st), Paragraph('<b>Portion (%)</b>', n_st)]]
            for c in cats:
                amt = float(c['amount'])
                pct = (amt / cur_total * 100) if cur_total > 0 else 0
                cat_rows.append([str(c['category__name']), f'Rs. {amt:,.2f}', f'{pct:.1f}%'])
            cat_t = Table(cat_rows, colWidths=[3*inch, 2*inch, 1.6*inch])
            cat_t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
                ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafafa')]),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(cat_t)
        else:
            story.append(Paragraph('No expenses registered for this period.', n_st))

        # Budget Performance
        story.append(Paragraph('Budget Adherence', h_st))
        budgets = Budget.objects.filter(user=request.user, month=today.month, year=today.year)
        if budgets:
            bud_rows = [[Paragraph('<b>Category</b>', n_st), Paragraph('<b>Limit</b>', n_st), Paragraph('<b>Spent</b>', n_st), Paragraph('<b>Utilization</b>', n_st)]]
            for b in budgets:
                spent = float(Expense.objects.filter(user=request.user, category=b.category, date__gte=start_of_month, date__lte=end_of_month).aggregate(total=Sum('amount'))['total'] or 0)
                limit = float(b.monthly_limit)
                util = (spent / limit * 100) if limit > 0 else 0
                status_color = colors.HexColor('#dc2626') if util > 95 else (colors.HexColor('#ea580c') if util > 80 else colors.HexColor('#059669'))
                bud_rows.append([str(b.category.name), f'Rs. {limit:,.2f}', f'Rs. {spent:,.2f}', Paragraph(f'<b>{util:.1f}%</b>', n_st.clone(name='U', textColor=status_color, alignment=TA_RIGHT))])
            bud_t = Table(bud_rows, colWidths=[2.3*inch, 1.5*inch, 1.5*inch, 1.3*inch])
            bud_t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
                ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafafa')]),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(bud_t)
        else:
            story.append(Paragraph('No active budgets for this month.', n_st))

        # Recent Transactions
        story.append(Paragraph('Recent Transactions (Last 10)', h_st))
        recent_incomes = Income.objects.filter(user=request.user).order_by('-date', '-created_at')[:5]
        recent_expenses = Expense.objects.filter(user=request.user).order_by('-date', '-created_at')[:5]
        txns = []
        for inc in recent_incomes:
            txns.append({'date': inc.date, 'type': 'Income', 'cat': inc.source, 'amt': float(inc.amount), 'desc': inc.description or ''})
        for exp in recent_expenses:
            txns.append({'date': exp.date, 'type': 'Expense', 'cat': exp.category.name if exp.category else 'N/A', 'amt': float(exp.amount), 'desc': exp.notes or ''})
        txns.sort(key=lambda x: x['date'], reverse=True)
        txns = txns[:10]
        
        if txns:
            txn_rows = [[Paragraph('<b>Date</b>', n_st), Paragraph('<b>Category</b>', n_st), Paragraph('<b>Description</b>', n_st), Paragraph('<b>Amount</b>', n_st)]]
            for txn in txns:
                t_color = colors.HexColor('#059669') if txn['type'] == 'Income' else colors.HexColor('#dc2626')
                prefix = '+' if txn['type'] == 'Income' else '-'
                txn_rows.append([
                    txn['date'].strftime('%Y-%m-%d'),
                    txn['cat'],
                    Paragraph(txn['desc'][:40] + ('...' if len(txn['desc']) > 40 else '') if txn['desc'] else '-', n_st),
                    Paragraph(f'<b>{prefix}Rs. {txn["amt"]:,.2f}</b>', n_st.clone(name='T', textColor=t_color, alignment=TA_RIGHT))
                ])
            txn_t = Table(txn_rows, colWidths=[1*inch, 1.5*inch, 2.6*inch, 1.5*inch])
            txn_t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafafa')]),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(txn_t)
        else:
            story.append(Paragraph('No recent transactions found.', n_st))

        # Savings Progress
        if savings_qs.exists():
            story.append(Paragraph('Savings Goals Progress', h_st))
            sav_rows = [[Paragraph('<b>Goal</b>', n_st), Paragraph('<b>Target</b>', n_st), Paragraph('<b>Current</b>', n_st), Paragraph('<b>Remaining</b>', n_st)]]
            for s in savings_qs:
                target = float(s.target_amount)
                current = float(s.current_amount)
                sav_rows.append([s.title, f'Rs. {target:,.2f}', f'Rs. {current:,.2f}', f'Rs. {max(0, target-current):,.2f}'])
            sav_t = Table(sav_rows, colWidths=[2.3*inch, 1.4*inch, 1.4*inch, 1.5*inch])
            sav_t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
                ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafafa')]),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(sav_t)

        doc.build(story)
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        filename = f"Expense_Report_{today.strftime('%Y_%m_%d')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        buffer.close()
        return response

class ComparisonReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            today = timezone.now().date()
            start_cur = today.replace(day=1)
            _, last_day_cur = calendar.monthrange(today.year, today.month)
            end_cur = today.replace(day=last_day_cur)

            first_of_cur = today.replace(day=1)
            end_prev = first_of_cur - timedelta(days=1)
            start_prev = end_prev.replace(day=1)

            cur_total = Expense.objects.filter(user=request.user, date__gte=start_cur, date__lte=end_cur).aggregate(total=Sum('amount'))['total'] or 0
            prev_total = Expense.objects.filter(user=request.user, date__gte=start_prev, date__lte=end_prev).aggregate(total=Sum('amount'))['total'] or 0

            user_categories = Category.objects.filter(user=request.user)
            comparison_list = []
            for cat in user_categories:
                cur_cat_total = Expense.objects.filter(user=request.user, category=cat, date__gte=start_cur, date__lte=end_cur).aggregate(total=Sum('amount'))['total'] or 0
                prev_cat_total = Expense.objects.filter(user=request.user, category=cat, date__gte=start_prev, date__lte=end_prev).aggregate(total=Sum('amount'))['total'] or 0
                if cur_cat_total > 0 or prev_cat_total > 0:
                    diff = float(cur_cat_total) - float(prev_cat_total)
                    diff_percent = (diff / float(prev_cat_total) * 100) if prev_cat_total > 0 else 100
                    comparison_list.append({
                        "category": cat.name,
                        "this_month": float(cur_cat_total),
                        "last_month": float(prev_cat_total),
                        "diff": diff,
                        "diff_percent": round(diff_percent, 1),
                    })
            
            comparison_list.sort(key=lambda x: abs(x['diff']), reverse=True)
            total_diff = float(cur_total) - float(prev_total)
            total_diff_percent = (total_diff / float(prev_total) * 100) if prev_total > 0 else 100
            
            # Insights
            biggest_win = None
            if comparison_list:
                sorted_by_best = sorted(comparison_list, key=lambda x: x['diff'])
                if sorted_by_best[0]['diff'] < 0:
                    biggest_win = sorted_by_best[0]
            
            high_increase = None
            if comparison_list:
                sorted_by_worst_pct = sorted(comparison_list, key=lambda x: x['diff_percent'], reverse=True)
                if sorted_by_worst_pct[0]['diff_percent'] > 0:
                    high_increase = sorted_by_worst_pct[0]

            # PDF Generation
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch,
                                    leftMargin=0.5*inch, rightMargin=0.5*inch, title="Monthly Intelligence")
            styles = getSampleStyleSheet()

            title_st = ParagraphStyle('Title', parent=styles['Title'], fontSize=28, textColor=colors.HexColor('#111827'), alignment=TA_LEFT, fontName='Helvetica-Bold')
            sub_st = ParagraphStyle('Sub', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#6b7280'), spaceAfter=20, alignment=TA_LEFT)
            h_st = ParagraphStyle('H', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor('#111827'), spaceBefore=25, spaceAfter=12, fontName='Helvetica-Bold')
            n_st = ParagraphStyle('N', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#374151'), spaceAfter=6)
            
            label_st = ParagraphStyle('Label', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#6b7280'), alignment=TA_CENTER, fontName='Helvetica-Bold')
            value_st = ParagraphStyle('Value', parent=styles['Normal'], fontSize=18, textColor=colors.HexColor('#111827'), alignment=TA_CENTER, fontName='Helvetica-Bold')
            
            story = []
            story.append(Paragraph('Monthly Intelligence Report', title_st))
            email_esc = escape(request.user.email)
            story.append(Paragraph(f'Comparison: {start_prev.strftime("%b %Y")} vs {start_cur.strftime("%b %Y")} • User: {email_esc}', sub_st))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb'), spaceAfter=20))

            # Executive Summary Cards
            net_color = colors.HexColor('#059669') if total_diff <= 0 else colors.HexColor('#dc2626')
            summary_data = [
                [Paragraph('THIS MONTH', label_st), Paragraph('LAST MONTH', label_st), Paragraph('NET VARIANCE', label_st)],
                [Paragraph(f'Rs. {float(cur_total):,.2f}', value_st), 
                Paragraph(f'Rs. {float(prev_total):,.2f}', value_st), 
                Paragraph(f'Rs. {total_diff:+,.2f} ({total_diff_percent:+.1f}%)', value_st.clone('NetVar', textColor=net_color))]
            ]
            summary_table = Table(summary_data, colWidths=[2.3*inch, 2.3*inch, 2.3*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f9fafb')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ]))
            story.append(summary_table)

            # Smart Insights Section
            story.append(Paragraph('Smart Intelligence', h_st))
            insight_data = []
            if biggest_win:
                cat_name = escape(str(biggest_win["category"]))
                insight_data.append([Paragraph(f'<b>Efficiency Breakthrough:</b> Spent Rs. {abs(biggest_win["diff"]):,.2f} less in {cat_name}', n_st.clone('I1', textColor=colors.HexColor('#059669')))])
            if high_increase:
                cat_name = escape(str(high_increase["category"]))
                insight_data.append([Paragraph(f'<b>Vulnerability Alert:</b> {cat_name} spending increased by {high_increase["diff_percent"]}%', n_st.clone('I2', textColor=colors.HexColor('#b45309')))])
            
            if insight_data:
                it = Table(insight_data, colWidths=[7*inch])
                it.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
                    ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                    ('TOPPADDING', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                    ('LEFTPADDING', (0, 0), (-1, -1), 15),
                ]))
                story.append(it)
            else:
                story.append(Paragraph('No significant spending shifts detected.', n_st))

            # Comparative Table
            story.append(Paragraph('Comprehensive Comparative Breakdown', h_st))
            comp_rows = [[
                Paragraph('<b>Category</b>', n_st), 
                Paragraph('<b>Last Month</b>', n_st.clone('H1', alignment=TA_RIGHT)), 
                Paragraph('<b>This Month</b>', n_st.clone('H2', alignment=TA_RIGHT)), 
                Paragraph('<b>Variance</b>', n_st.clone('H3', alignment=TA_RIGHT)), 
                Paragraph('<b>%</b>', n_st.clone('H4', alignment=TA_RIGHT))
            ]]
            
            for item in comparison_list:
                v_color = colors.HexColor('#059669') if item['diff'] <= 0 else colors.HexColor('#dc2626')
                comp_rows.append([
                    Paragraph(escape(str(item['category'])), n_st),
                    Paragraph(f'Rs. {float(item["last_month"]):,.2f}', n_st.clone('C1', alignment=TA_RIGHT)),
                    Paragraph(f'Rs. {float(item["this_month"]):,.2f}', n_st.clone('C2', alignment=TA_RIGHT)),
                    Paragraph(f'<b>{float(item["diff"]):+,.2f}</b>', n_st.clone('C3', textColor=v_color, alignment=TA_RIGHT)),
                    Paragraph(f'<b>{float(item["diff_percent"]):+,.1f}%</b>', n_st.clone('C4', textColor=v_color, alignment=TA_RIGHT))
                ])
                
            ct = Table(comp_rows, colWidths=[2.2*inch, 1.4*inch, 1.4*inch, 1.1*inch, 0.8*inch])
            ct.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(ct)

            doc.build(story)
            buffer.seek(0)
            pdf_data = buffer.getvalue()
            buffer.close()

            response = HttpResponse(pdf_data, content_type='application/pdf')
            filename = f"PocketFlow_Intelligence_{today.strftime('%b_%Y')}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            import traceback
            err_msg = traceback.format_exc()
            print("ComparisonReportView Error:", err_msg)
            return HttpResponse(f"Error generating report: {str(e)}", status=500)
