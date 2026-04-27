"""
Shared date-range utilities for summary and analytics views.

Eliminates duplicated date computation logic across summary endpoints.
"""

import calendar
from datetime import timedelta, date
from django.utils import timezone


def get_current_month_range(today=None):
    """
    Returns (start_date, end_date) for the current month.
    """
    if today is None:
        today = timezone.now().date()
    start = today.replace(day=1)
    _, last_day = calendar.monthrange(today.year, today.month)
    end = today.replace(day=last_day)
    return start, end


def get_previous_month_range(today=None):
    """
    Returns (start_date, end_date) for the previous month.
    """
    if today is None:
        today = timezone.now().date()
    first_of_current = today.replace(day=1)
    end_of_prev = first_of_current - timedelta(days=1)
    start_of_prev = end_of_prev.replace(day=1)
    return start_of_prev, end_of_prev


def get_month_range_for_date(target_date):
    """
    Returns (start_date, end_date) for the month containing target_date.
    """
    start = target_date.replace(day=1)
    _, last_day = calendar.monthrange(target_date.year, target_date.month)
    end = target_date.replace(day=last_day)
    return start, end


def get_custom_month_range(start_date_str, end_date_str, today=None):
    """
    Parse start_date and end_date strings, return (start, end, prev_start, prev_end).
    Falls back to current month if parsing fails.
    """
    if today is None:
        today = timezone.now().date()

    if start_date_str and end_date_str:
        try:
            from datetime import datetime
            start = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            delta = (end - start).days + 1
            prev_start = start - timedelta(days=delta)
            prev_end = start - timedelta(days=1)
            return start, end, prev_start, prev_end
        except ValueError:
            pass

    # Fallback
    curr_start, curr_end = get_current_month_range(today)
    prev_start, prev_end = get_previous_month_range(today)
    return curr_start, curr_end, prev_start, prev_end


def get_last_n_months(n=6, today=None):
    """
    Returns a list of (month_name, year, start_date, end_date) for the last N months.
    """
    if today is None:
        today = timezone.now().date()

    result = []
    for i in range(n - 1, -1, -1):
        y = today.year
        m = today.month - i
        while m <= 0:
            m += 12
            y -= 1

        last_day = calendar.monthrange(y, m)[1]
        start = date(y, m, 1)
        end = date(y, m, last_day)
        month_name = calendar.month_abbr[m]
        result.append((f"{month_name} {y}", start, end))

    return result


def get_week_range(start_date_str=None, end_date_str=None, today=None):
    """
    Returns (start_date, end_date) for a week range.
    Defaults to Monday → today if not provided.
    """
    if today is None:
        today = timezone.now().date()

    if start_date_str and end_date_str:
        try:
            from datetime import datetime
            start = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            return start, end
        except ValueError:
            pass

    # Default: Monday of current week → today
    start = today - timedelta(days=today.weekday())
    return start, today
