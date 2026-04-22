import calendar
import logging
import secrets
from datetime import timedelta
from io import BytesIO

from django.conf import settings

logger = logging.getLogger(__name__)
from django.db.models import Sum
from django.utils import timezone
from django.utils.html import escape
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
import requests
import socket
import urllib3.util.connection as urllib3_cn

def allowed_gai_family():
    return socket.AF_INET
urllib3_cn.allowed_gai_family = allowed_gai_family

from expenses.models import Expense
from budgets.models import Budget
from income.models import Income
from savings.models import SavingsGoal
from categories.models import Category
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from .bot_logic import parse_expense_message
from .utils import send_message, get_telegram_file_path, download_telegram_file, send_document
from expenses.ocr_service import scan_receipt_image

import django.contrib.auth
User = django.contrib.auth.get_user_model()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def send_type_selection(chat_id):
    """
    Sends the initial selection between Income and Expense.
    """
    keyboard = {
        "inline_keyboard": [
            [
                {"text": "📉 Expense", "callback_data": "type:expense"},
                {"text": "📈 Income", "callback_data": "type:income"}
            ]
        ]
    }
    prompt = (
        "🌟 <b>Log a New Entry</b>\n\n"
        "What type of entry would you like to log?\n\n"
        "💡 <i>Tip: You can also type <code>150 Food Lunch</code> directly anytime.</i>"
    )
    send_message(chat_id, prompt, reply_markup=keyboard)

def _get_or_create_category(user, name: str) -> Category:
    """
    Return the user's category matching name (case-insensitive).
    Creates it with sensible defaults if it doesn't exist.
    """
    try:
        return Category.objects.get(user=user, name__iexact=name)
    except Category.DoesNotExist:
        return Category.objects.create(
            user=user,
            name=name.capitalize(),
            icon="📦",
            color="#6B7280",
        )

def _build_telegram_report_pdf(user):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        title="Financial Report",
    )
    styles = getSampleStyleSheet()
    title_st = ParagraphStyle(
        'Title', parent=styles['Title'], fontSize=28,
        textColor=colors.HexColor('#111827'), spaceAfter=5,
        alignment=TA_LEFT, fontName='Helvetica-Bold'
    )
    sub_st = ParagraphStyle(
        'Sub', parent=styles['Normal'], fontSize=10,
        textColor=colors.HexColor('#6b7280'), spaceAfter=20,
        alignment=TA_LEFT
    )
    h_st = ParagraphStyle(
        'H', parent=styles['Heading2'], fontSize=16,
        textColor=colors.HexColor('#111827'), spaceBefore=25,
        spaceAfter=12, fontName='Helvetica-Bold'
    )
    n_st = ParagraphStyle(
        'N', parent=styles['Normal'], fontSize=10,
        textColor=colors.HexColor('#374151'), spaceAfter=6
    )
    label_st = ParagraphStyle(
        'Label', parent=styles['Normal'], fontSize=9,
        textColor=colors.HexColor('#6b7280'),
        alignment=TA_CENTER, fontName='Helvetica-Bold'
    )
    value_st = ParagraphStyle(
        'Value', parent=styles['Normal'], fontSize=16,
        textColor=colors.HexColor('#059669'),
        alignment=TA_CENTER, fontName='Helvetica-Bold'
    )

    today = timezone.now().date()
    start_of_month = today.replace(day=1)
    _, last_day = calendar.monthrange(today.year, today.month)
    end_of_month = today.replace(day=last_day)
    end_of_prev = start_of_month - timedelta(days=1)
    start_of_prev = end_of_prev.replace(day=1)

    cur_exp = Expense.objects.filter(user=user, date__gte=start_of_month, date__lte=end_of_month)
    prev_exp = Expense.objects.filter(user=user, date__gte=start_of_prev, date__lte=end_of_prev)
    cur_inc = Income.objects.filter(user=user, date__gte=start_of_month, date__lte=end_of_month)
    prev_inc = Income.objects.filter(user=user, date__gte=start_of_prev, date__lte=end_of_prev)

    cur_total = float(cur_exp.aggregate(total=Sum('amount'))['total'] or 0)
    prev_total = float(prev_exp.aggregate(total=Sum('amount'))['total'] or 0)
    cur_inc_total = float(cur_inc.aggregate(total=Sum('amount'))['total'] or 0)
    prev_inc_total = float(prev_inc.aggregate(total=Sum('amount'))['total'] or 0)
    savings_qs = SavingsGoal.objects.filter(user=user)
    all_income = float(Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0)
    all_expenses = float(Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0)
    total_balance = all_income - all_expenses

    story = []
    story.append(Paragraph('Financial Statement', title_st))
    story.append(Paragraph(f'Generated on {today.strftime("%B %d, %Y")} | {user.email}', sub_st))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb'), spaceAfter=20))

    summary_data = [
        [Paragraph('NET BALANCE', label_st), Paragraph('CURRENT INCOME', label_st), Paragraph('CURRENT EXPENSES', label_st)],
        [Paragraph(f'Rs. {total_balance:,.2f}', value_st),
         Paragraph(f'Rs. {cur_inc_total:,.2f}', value_st),
         Paragraph(f'Rs. {cur_total:,.2f}', value_st.clone(name='Vred', textColor=colors.HexColor('#dc2626')))]
    ]
    summary_table = Table(summary_data, colWidths=[2.3 * inch, 2.3 * inch, 2.3 * inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f9fafb')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 20))

    story.append(Paragraph('Monthly Performance', h_st))
    exp_chg = ((cur_total - prev_total) / prev_total) * 100 if prev_total > 0 else (100 if cur_total > 0 else 0)
    inc_chg = ((cur_inc_total - prev_inc_total) / prev_inc_total) * 100 if prev_inc_total > 0 else (100 if cur_inc_total > 0 else 0)
    perf_rows = [
        [Paragraph('<b>Metric</b>', n_st), Paragraph('<b>This Month</b>', n_st), Paragraph('<b>Last Month</b>', n_st), Paragraph('<b>Change (%)</b>', n_st)],
        ['Expenses', f'Rs. {cur_total:,.2f}', f'Rs. {prev_total:,.2f}', f'{exp_chg:+.1f}%'],
        ['Income', f'Rs. {cur_inc_total:,.2f}', f'Rs. {prev_inc_total:,.2f}', f'{inc_chg:+.1f}%']
    ]
    perf_t = Table(perf_rows, colWidths=[2 * inch, 1.6 * inch, 1.6 * inch, 1.4 * inch])
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

    story.append(Paragraph('Expenses by Category', h_st))
    cats = cur_exp.values('category__name').annotate(amount=Sum('amount')).order_by('-amount')
    if cats:
        cat_rows = [[Paragraph('<b>Category</b>', n_st), Paragraph('<b>Amount</b>', n_st), Paragraph('<b>Portion (%)</b>', n_st)]]
        for c in cats:
            amt = float(c['amount'])
            pct = (amt / cur_total * 100) if cur_total > 0 else 0
            cat_rows.append([str(c['category__name'] or 'Other'), f'Rs. {amt:,.2f}', f'{pct:.1f}%'])
        cat_t = Table(cat_rows, colWidths=[3 * inch, 2 * inch, 1.6 * inch])
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

    story.append(Paragraph('Budget Adherence', h_st))
    budgets = Budget.objects.filter(user=user, month=today.month, year=today.year)
    if budgets:
        bud_rows = [[Paragraph('<b>Category</b>', n_st), Paragraph('<b>Limit</b>', n_st), Paragraph('<b>Spent</b>', n_st), Paragraph('<b>Utilization</b>', n_st)]]
        for b in budgets:
            spent = float(Expense.objects.filter(user=user, category=b.category, date__gte=start_of_month, date__lte=end_of_month).aggregate(total=Sum('amount'))['total'] or 0)
            limit = float(b.monthly_limit)
            util = (spent / limit * 100) if limit > 0 else 0
            status_color = colors.HexColor('#dc2626') if util > 95 else (colors.HexColor('#ea580c') if util > 80 else colors.HexColor('#059669'))
            bud_rows.append([str(b.category.name), f'Rs. {limit:,.2f}', f'Rs. {spent:,.2f}', Paragraph(f'<b>{util:.1f}%</b>', n_st.clone(name='U', textColor=status_color, alignment=TA_RIGHT))])
        bud_t = Table(bud_rows, colWidths=[2.3 * inch, 1.5 * inch, 1.5 * inch, 1.3 * inch])
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

    story.append(Paragraph('Recent Transactions (Last 10)', h_st))
    recent_incomes = Income.objects.filter(user=user).order_by('-date', '-created_at')[:5]
    recent_expenses = Expense.objects.filter(user=user).order_by('-date', '-created_at')[:5]
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
            desc = escape(txn['desc'][:40] + ('...' if len(txn['desc']) > 40 else '')) if txn['desc'] else '-'
            txn_rows.append([
                txn['date'].strftime('%Y-%m-%d'),
                txn['cat'],
                Paragraph(desc, n_st),
                Paragraph(f'<b>{prefix}Rs. {txn["amt"]:,.2f}</b>', n_st.clone(name='T', textColor=t_color, alignment=TA_RIGHT))
            ])
        txn_t = Table(txn_rows, colWidths=[1 * inch, 1.5 * inch, 2.6 * inch, 1.5 * inch])
        txn_t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafafa')]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(txn_t)
    else:
        story.append(Paragraph('No recent transactions found.', n_st))

    if savings_qs.exists():
        story.append(Paragraph('Savings Goals Progress', h_st))
        sav_rows = [[Paragraph('<b>Goal</b>', n_st), Paragraph('<b>Target</b>', n_st), Paragraph('<b>Current</b>', n_st), Paragraph('<b>Remaining</b>', n_st)]]
        for s in savings_qs:
            target = float(s.target_amount)
            current = float(s.current_amount)
            sav_rows.append([s.title, f'Rs. {target:,.2f}', f'Rs. {current:,.2f}', f'Rs. {max(0, target-current):,.2f}'])
        sav_t = Table(sav_rows, colWidths=[2.3 * inch, 1.4 * inch, 1.4 * inch, 1.5 * inch])
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
    filename = f"Expense_Report_{today.strftime('%Y_%m_%d')}.pdf"
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return filename, pdf_bytes


# ---------------------------------------------------------------------------
# Endpoint 1: Generate link token (authenticated users only)
# ---------------------------------------------------------------------------

class GenerateLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        token = secrets.token_urlsafe(32)
        expiry = timezone.now() + timedelta(minutes=10)

        user = request.user
        user.telegram_link_token = token
        user.telegram_link_expiry = expiry
        user.save(update_fields=['telegram_link_token', 'telegram_link_expiry'])

        bot_username = settings.TELEGRAM_BOT_USERNAME
        if not bot_username:
            return Response(
                {"detail": "Telegram bot is not configured yet. Set TELEGRAM_BOT_USERNAME in .env."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        link = f"https://t.me/{bot_username}?start={token}"
        return Response({"link": link, "expires_in": 600})


# ---------------------------------------------------------------------------
# Endpoint 2: Webhook (called by Telegram — no JWT auth)
# ---------------------------------------------------------------------------

@method_decorator(csrf_exempt, name='dispatch')
class WebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        # ── Verify Telegram Secret Header ─────────────────────────────────────
        secret_token = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
        if settings.TELEGRAM_WEBHOOK_SECRET and secret_token != settings.TELEGRAM_WEBHOOK_SECRET:
            logger.warning("Telegram webhook: invalid secret header from %s", request.get_host())
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            data = request.data
            
            # ── Handle Callback Query (Inline Button Click) ───────────────
            if 'callback_query' in data:
                from .utils import answer_callback_query
                callback_query = data['callback_query']
                callback_query_id = callback_query['id']
                chat_id = str(callback_query['message']['chat']['id'])
                callback_data = callback_query.get('data', '')
                
                # Acknowledge immediately
                answer_callback_query(callback_query_id)
                
                # Get user
                try:
                    user = User.objects.get(telegram_chat_id=chat_id)
                except User.DoesNotExist:
                    logger.debug("Callback for unlinked chat_id: %s", chat_id)
                    return Response({"ok": True})

                if callback_data.startswith('type:'):
                    entry_type = callback_data.split(':', 1)[1].upper() # INCOME or EXPENSE
                    from categories.models import Category
                    user_categories = Category.objects.filter(user=user, category_type=entry_type).order_by('name')

                    if not user_categories.exists():
                        keyboard = {
                            "inline_keyboard": [
                                [{"text": "➕ Create Categories", "url": f"{settings.FRONTEND_URL}/categories"}]
                            ]
                        }
                        send_message(
                            chat_id, 
                            f"📁 <b>No {entry_type.title()} Categories Found</b>\n\nYou haven't created any {entry_type.lower()} categories yet. Visit your dashboard to set them up.",
                            reply_markup=keyboard
                        )
                    else:
                        rows = []
                        current_row = []
                        for cat in user_categories:
                            current_row.append({
                                "text": f"{cat.icon} {cat.name}", 
                                "callback_data": f"cat:{cat.name}"
                            })
                            if len(current_row) == 2:
                                rows.append(current_row)
                                current_row = []
                        if current_row:
                            rows.append(current_row)
                        
                        rows.append([{"text": "⬅️ Back", "callback_data": "cmd:add"}])
                        
                        keyboard = {"inline_keyboard": rows}
                        type_label = "Income 📈" if entry_type == 'INCOME' else "Expense 📉"
                        send_message(chat_id, f"Select a <b>{type_label}</b> category:", reply_markup=keyboard)
                    return Response({"ok": True})

                if callback_data.startswith('cat:'):
                    category_name = callback_data.split(':', 1)[1]
                    reply_markup = {
                        "force_reply": True,
                        "input_field_placeholder": "e.g. 150 Lunch"
                    }
                    send_message(
                        chat_id,
                        f"Category selected: {category_name}\n\nReply to this message with the amount (and optionally add a title):",
                        reply_markup=reply_markup
                    )
                    return Response({"ok": True})

                if callback_data == 'cmd:add':
                    # Recursive call to the /add logic but as callback
                    send_type_selection(chat_id)
                    return Response({"ok": True})

            # ── Handle Standard Messages ────────────────────────────────
            message = data.get('message') or data.get('edited_message')
            if not message:
                return Response({"ok": True})

            chat_id = str(message['chat']['id'])
            text = (message.get('text') or '').strip()
            photo = message.get('photo')
            document = message.get('document')

            logger.info("Incoming message from %s: text='%s', has_photo=%s, has_doc=%s", chat_id, text, bool(photo), bool(document))

            if not text and not photo and not document:
                logger.debug("Empty message received")
                return Response({"ok": True})

            # ── /start {token} ──────────────────────────────────────────
            if text.startswith('/start'):
                parts = text.split(maxsplit=1)
                token = parts[1].strip() if len(parts) > 1 else ''

                if not token:
                    send_message(
                        chat_id,
                        "👋 Welcome!\n\nTo link your account, go to <b>Settings → Integrations</b> "
                        "in the PocketFlow app and click <b>Connect Telegram</b>.",
                    )
                    return Response({"ok": True})

                try:
                    user = User.objects.get(telegram_link_token=token)
                except User.DoesNotExist:
                    send_message(chat_id, "❌ Invalid or expired link.\n\nGenerate a new one from the app settings.")
                    return Response({"ok": True})

                if user.telegram_link_expiry and timezone.now() > user.telegram_link_expiry:
                    user.telegram_link_token = None
                    user.telegram_link_expiry = None
                    user.save(update_fields=['telegram_link_token', 'telegram_link_expiry'])
                    send_message(chat_id, "⏰ Link expired.\n\nGenerate a new one from Settings → Integrations.")
                    return Response({"ok": True})

                # Link the account
                user.telegram_chat_id = chat_id
                user.telegram_link_token = None
                user.telegram_link_expiry = None
                user.save(update_fields=['telegram_chat_id', 'telegram_link_token', 'telegram_link_expiry'])

                send_message(
                    chat_id,
                    "✅ <b>Account linked successfully!</b>\n\n"
                    "Tap /add to use the interactive menu, or type expenses directly:\n"
                    "<code>150 Food Lunch</code>\n\n"
                    "<b>Commands:</b>\n"
                    "/add — interactive entry\n"
                    "/help — usage guide\n"
                    "/status — this month's summary\n"
                    "/recent — last 5 expenses\n"
                    "/report — download full PDF report\n"
                    "/disconnect — unlink account",
                )
                return Response({"ok": True})

            # ── All other messages: user must be linked ─────────────────
            try:
                user = User.objects.get(telegram_chat_id=chat_id)
            except User.DoesNotExist:
                send_message(
                    chat_id,
                    "⚠️ Account not linked.\n\n"
                    "Go to <b>Settings → Integrations</b> in the PocketFlow app "
                    "and click <b>Connect Telegram</b>.",
                )
                return Response({"ok": True})

            # ── Handle Photo/Document (AI Receipt Scanning) ─────────────────────
            file_id = None
            if photo:
                # Pick the largest version of the photo (compressed)
                file_id = photo[-1]['file_id']
            elif document and document.get('mime_type', '').startswith('image/'):
                # Uncompressed image sent as document
                file_id = document['file_id']

            if file_id:
                logger.info("Processing scan for file_id: %s", file_id)
                # Feedback
                send_message(chat_id, "<i>🔍 Scanning your receipt with AI...</i>")
                
                # Download
                file_path = get_telegram_file_path(file_id)
                if not file_path:
                    send_message(chat_id, "❌ Sorry, I couldn't retrieve that image from Telegram.")
                    return Response({"ok": True})
                
                image_bytes = download_telegram_file(file_path)
                if not image_bytes:
                    send_message(chat_id, "❌ Failed to download the receipt image.")
                    return Response({"ok": True})
                
                # Scan
                import io
                scan_result = scan_receipt_image(io.BytesIO(image_bytes))
                
                if not scan_result or scan_result.get('error'):
                    send_message(chat_id, f"❌ AI failed to read this receipt.\n\nError: {scan_result.get('error') or 'Unknown extraction error'}")
                    return Response({"ok": True})
                
                # Map results
                amount = scan_result.get('amount') or 0
                title = scan_result.get('title') or 'Telegram Upload'
                cat_name = scan_result.get('category_suggestion') or 'Other'
                trans_type = scan_result.get('type') or 'EXPENSE'
                
                if trans_type.upper() == 'INCOME':
                    # For income, 'title' becomes 'source' and 'cat_name' becomes 'description'
                    obj = Income.objects.create(
                        user=user,
                        source=title,
                        amount=amount,
                        date=timezone.now().date(),
                        description=f"AI_TELEGRAM_SCAN: {cat_name}"
                    )
                    type_label = "Income 📈"
                    final_cat = cat_name
                else:
                    category = _get_or_create_category(user, cat_name)
                    obj = Expense.objects.create(
                        user=user,
                        category=category,
                        title=title,
                        amount=amount,
                        date=timezone.now().date(),
                        notes="AI_TELEGRAM_SCAN"
                    )
                    type_label = "Expense 📉"
                    final_cat = category.name
                
                send_message(
                    chat_id,
                    f"✅ <b>{type_label} Scanned & Logged!</b>\n\n"
                    f"💰 Amount: ₹{float(amount):,.2f}\n"
                    f"📁 Category: {final_cat}\n"
                    f"📝 Source: {title}\n\n"
                    f"The entry has been added to your dashboard."
                )
                return Response({"ok": True})

            # ── /help ───────────────────────────────────────────────────
            if text == '/help':
                send_message(
                    chat_id,
                    "📖 <b>How to log entries:</b>\n\n"
                    "<b>Method 1: Interactive</b>\n"
                    "Type /add to use handy category buttons.\n\n"
                    "<b>Method 2: Direct text</b>\n"
                    "<b>Format:</b> <code>Amount Category Title</code>\n"
                    "<b>Examples:</b>\n"
                    "• <code>150 Food Lunch</code>\n"
                    "• <code>5000 Salary</code>\n\n"
                    "<b>Commands:</b>\n"
                    "/add — step-by-step entry\n"
                    "/status — this month's summary\n"
                    "/recent — last 5 expenses\n"
                    "/report — download full PDF report\n"
                    "/disconnect — unlink account",
                )
                return Response({"ok": True})

            # ── /status ─────────────────────────────────────────────────
            if text == '/status':
                now = timezone.now()
                expenses = Expense.objects.filter(
                    user=user,
                    date__year=now.year,
                    date__month=now.month,
                )
                incomes = Income.objects.filter(
                    user=user,
                    date__year=now.year,
                    date__month=now.month,
                )
                
                total_exp = sum(e.amount for e in expenses)
                total_inc = sum(i.amount for i in incomes)

                lines = [f"📊 <b>Summary for {now.strftime('%B %Y')}:</b>\n"]
                
                if incomes.exists():
                    lines.append(f"🟢 <b>Total Income: ₹{float(total_inc):,.2f}</b>")
                
                if expenses.exists():
                    # Group by category name
                    by_cat = {}
                    for e in expenses:
                        cat_name = e.category.name if e.category else 'Other'
                        by_cat[cat_name] = by_cat.get(cat_name, 0) + float(e.amount)
                    
                    lines.append(f"🔴 <b>Total Expenses: ₹{float(total_exp):,.2f}</b>")
                    for cat, amt in sorted(by_cat.items()):
                        lines.append(f"  • {cat}: ₹{amt:,.2f}")
                
                balance = float(total_inc) - float(total_exp)
                lines.append(f"\n💰 <b>Net Balance: ₹{balance:,.2f}</b>")
                
                if not expenses.exists() and not incomes.exists():
                    send_message(chat_id, "📊 No activity logged this month yet.")
                else:
                    send_message(chat_id, "\n".join(lines))
                return Response({"ok": True})

            # ── /recent ─────────────────────────────────────────────────
            if text == '/recent':
                recent_exp = list(Expense.objects.filter(user=user).select_related('category').order_by('-date', '-created_at')[:5])
                recent_inc = list(Income.objects.filter(user=user).order_by('-date', '-created_at')[:5])
                
                # Combine and sort
                combined = []
                for e in recent_exp:
                    combined.append({'type': 'EXPENSE', 'obj': e, 'ts': e.created_at})
                for i in recent_inc:
                    combined.append({'type': 'INCOME', 'obj': i, 'ts': i.created_at})
                
                combined.sort(key=lambda x: x['ts'], reverse=True)
                final_recent = combined[:5]

                if not final_recent:
                    send_message(chat_id, "🕐 No transactions logged yet.")
                    return Response({"ok": True})

                lines = ["🕐 <b>Recent Activity:</b>\n"]
                for item in final_recent:
                    if item['type'] == 'EXPENSE':
                        e = item['obj']
                        cat = e.category.name if e.category else 'Other'
                        lines.append(f"🔴 ₹{float(e.amount):,.2f} - {e.title} ({cat})")
                    else:
                        inc = item['obj']
                        lines.append(f"🟢 ₹{float(inc.amount):,.2f} - {inc.source} (Income)")
                
                send_message(chat_id, "\n".join(lines))
                return Response({"ok": True})

            # ── /report ─────────────────────────────────────────────────
            if text == '/report':
                now = timezone.now()
                expenses = Expense.objects.filter(
                    user=user,
                    date__year=now.year,
                    date__month=now.month,
                )
                incomes = Income.objects.filter(
                    user=user,
                    date__year=now.year,
                    date__month=now.month,
                )

                if not expenses.exists() and not incomes.exists():
                    send_message(chat_id, "ðŸ“„ No data to generate a report for this month.")
                    return Response({"ok": True})

                filename, pdf_bytes = _build_telegram_report_pdf(user)
                sent = send_document(
                    chat_id,
                    pdf_bytes,
                    filename,
                    caption=f"ðŸ“„ Here is your financial report for <b>{now.strftime('%B %Y')}</b>."
                )
                if not sent:
                    send_message(chat_id, "âŒ I couldn't send the PDF report right now. Please try again in a moment.")

                return Response({"ok": True})

            # ── /disconnect ─────────────────────────────────────────────
            if text == '/disconnect':
                user.telegram_chat_id = None
                user.save(update_fields=['telegram_chat_id'])
                send_message(chat_id, "✅ Account disconnected.\n\nYou can reconnect anytime from Settings → Integrations.")
                return Response({"ok": True})

            # ── /add command (Interactive flow) ─────────────────────────
            if text == '/add':
                send_type_selection(chat_id)
                return Response({"ok": True})

            # ── Log Entry (Check for ForceReply or Old Method) ───────────
            reply_to = message.get('reply_to_message')
            
            category_name = None
            amount = None
            title = ""
            
            if reply_to and reply_to.get('text', '').startswith("Category selected:"):
                # New guided method
                cat_line = reply_to['text'].split('\n')[0] 
                # e.g., "Category selected: Food"
                category_name = cat_line.split(':', 1)[1].strip()
                
                parts = text.split(maxsplit=1)
                try:
                    amount = float(parts[0])
                    title = parts[1] if len(parts) > 1 else ""
                except ValueError:
                    try:
                        amount = float(parts[-1])
                        title = ' '.join(parts[:-1])
                    except ValueError:
                        send_message(chat_id, "❌ Please reply with a valid number for the amount (e.g., `150`).")
                        return Response({"ok": True})
                        
                if not title:
                    title = category_name
                    
            else:
                # Old power-user method
                parsed = parse_expense_message(text)
                if parsed['error']:
                    send_message(chat_id, f"❌ <b>Could not parse entry.</b>\n\n{parsed['error']}\n\nYou can also use /add to be guided step-by-step.")
                    return Response({"ok": True})
                    
                category_name = parsed['category']
                amount = parsed['amount']
                title = parsed['title']

            # Now we decide whether to log as Income or Expense based on category settings in DB
            category = _get_or_create_category(user, category_name)
            is_income = (category.category_type == 'INCOME')
            
            # Fallback for common keywords if category is newly created as 'EXPENSE' 
            # but name strongly suggests income (e.g., user typed a new income source)
            if not is_income and category_name.lower() in ['salary', 'freelance', 'other income', 'advance payment']:
                is_income = True
            
            if is_income:
                # Log as Income
                income = Income.objects.create(
                    user=user,
                    source=title if title and title.lower() != category_name.lower() else category_name,
                    amount=amount,
                    date=timezone.now().date(),
                )
                type_label = "Income 📈"
                display_cat = category_name
                display_title = income.source
            else:
                # Log as Expense
                expense = Expense.objects.create(
                    user=user,
                    category=category,
                    title=title,
                    amount=amount,
                    date=timezone.now().date(),
                )
                type_label = "Expense 📉"
                display_cat = category.name
                display_title = expense.title

            send_message(
                chat_id,
                f"✅ <b>Logged {type_label}!</b>\n\n"
                f"💰 Amount: ₹{float(amount):,.2f}\n"
                f"📁 Category: {display_cat}\n"
                f"📝 Title: {display_title}\n\n"
                f"Send /recent to see your last entries.",
            )
            return Response({"ok": True})

        except Exception as exc:
            import traceback
            error_detail = traceback.format_exc()
            logger.exception("Telegram Webhook error: %s", error_detail)
            # Still return 200 to Telegram so it doesn't retry indefinitely,
            # but log the full error for debugging.
            return Response({"ok": True})


# ---------------------------------------------------------------------------
# Endpoint 3: Disconnect (authenticated user clears their chat_id)
# ---------------------------------------------------------------------------

class DisconnectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.telegram_chat_id = None
        user.save(update_fields=['telegram_chat_id'])
        return Response({"message": "Disconnected successfully."})


# ---------------------------------------------------------------------------
# Endpoint 4: Status check
# ---------------------------------------------------------------------------

class StatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "connected": user.telegram_chat_id is not None,
            "chat_id": user.telegram_chat_id,
        })

# ---------------------------------------------------------------------------
# Endpoint: Sync Webhook (Fix bot connection)
# ---------------------------------------------------------------------------

class SyncWebhookView(APIView):
    """
    Dynamically sets the Telegram webhook based on the current host.
    This fixes the bot connection when ngrok link changes.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = settings.TELEGRAM_BOT_TOKEN
        if not token:
            return Response({"error": "Bot token not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if getattr(settings, 'TELEGRAM_WEBHOOK_URL', ''):
            webhook_url = settings.TELEGRAM_WEBHOOK_URL
            if not webhook_url.endswith('/'):
                webhook_url += '/'
            if 'api/telegram/webhook/' not in webhook_url:
                webhook_url += 'api/telegram/webhook/'
        else:
            host = request.get_host()
            
            # Detect localhost and provide helpful error
            if any(local in host for local in ['localhost', '127.0.0.1', '0.0.0.0']):
                return Response({
                    "error": "Cannot sync while on localhost. Telegram requires a public HTTPS URL.",
                    "suggestion": "Please access your dashboard via your tunnel URL (e.g., ngrok) or set TELEGRAM_WEBHOOK_URL in your .env file."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Strip port if present (Telegram only allows 80, 88, 443, 8443)
            # Most tunnels map public 443 to internal 8000.
            if ":" in host:
                host = host.split(":")[0]
                
            webhook_url = f"https://{host}/api/telegram/webhook/"

        telegram_api_url = f"https://api.telegram.org/bot{token}/setWebhook"
        
        try:
            # Include secret_token if configured in settings
            sync_data = {"url": webhook_url}
            if settings.TELEGRAM_WEBHOOK_SECRET:
                sync_data["secret_token"] = settings.TELEGRAM_WEBHOOK_SECRET

            res = requests.post(telegram_api_url, data=sync_data)
            res_data = res.json()
            
            if res_data.get("ok"):
                return Response({
                    "message": "Bot connection synced successfully!",
                    "url": webhook_url,
                    "telegram_response": res_data.get("description")
                })
            else:
                error_desc = res_data.get("description", "Failed to sync webhook")
                return Response({
                    "error": f"Telegram Error: {error_desc}",
                    "attempted_url": webhook_url
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
