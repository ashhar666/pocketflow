"""
PDF generation service module.

Centralizes PDF generation logic to reduce duplication across views.
"""

from io import BytesIO
from datetime import datetime
from django.utils.html import escape

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


def create_pdf_buffer():
    """Create a BytesIO buffer configured for PDF generation."""
    buffer = BytesIO()
    return buffer


def get_pdf_styles():
    """Return a dict of shared ParagraphStyles for PDF reports."""
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
    heading_st = ParagraphStyle(
        'H', parent=styles['Heading2'], fontSize=16,
        textColor=colors.HexColor('#111827'),
        spaceBefore=25, spaceAfter=12, fontName='Helvetica-Bold'
    )
    normal_st = ParagraphStyle(
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

    return {
        'title': title_st,
        'subtitle': sub_st,
        'heading': heading_st,
        'normal': normal_st,
        'label': label_st,
        'value': value_st,
    }


def get_pdf_doc(buffer, title="Report"):
    """Return a configured SimpleDocTemplate."""
    return SimpleDocTemplate(
        buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch,
        leftMargin=0.5*inch, rightMargin=0.5*inch, title=title
    )


def create_summary_table(data, col_widths=None):
    """Create a styled Table for summary data."""
    if col_widths is None:
        col_widths = [200, 200]
    table = Table(data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    return table


def create_data_table(data, col_widths=None):
    """Create a styled Table for detailed transaction data."""
    if col_widths is None:
        col_widths = [80, 180, 150, 120]
    table = Table(data, colWidths=col_widths, repeatRows=1)
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
    return table


def create_comparison_table(data, col_widths=None):
    """Create a styled table for comparison reports."""
    if col_widths is None:
        col_widths = [2*inch, 1.6*inch, 1.6*inch, 1.4*inch]
    table = Table(data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafafa')]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    return table


def format_currency(amount):
    """Format a number as INR currency string."""
    return f"Rs. {float(amount):,.2f}"


def build_pdf_response(buffer, filename_prefix="Report"):
    """
    Build PDF from buffer and return HttpResponse.
    Caller must have already called doc.build(elements) on the buffer.
    """
    buffer.seek(0)
    from django.http import HttpResponse
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    filename = f"{filename_prefix}_{datetime.now().strftime('%Y_%m_%d')}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    buffer.close()
    return response
