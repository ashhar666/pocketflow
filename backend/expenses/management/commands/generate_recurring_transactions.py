"""
Django management command to auto-generate recurring transactions.

Usage:
    python manage.py generate_recurring_transactions

This command:
1. Finds all expenses and income with is_recurring=True
2. Determines the next occurrence date based on recurrence_type (daily/weekly/monthly)
3. Creates a new entry if one doesn't already exist for that period
4. Should be run daily via cron job or task scheduler
"""

from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.db import IntegrityError
from expenses.models import Expense
from income.models import Income


class Command(BaseCommand):
    help = 'Generate recurring transactions for the current period'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating it',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        today = timezone.now().date()
        created_count = 0

        self.stdout.write(self.style.SUCCESS(f'Processing recurring transactions for {today}'))
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN — no changes will be made'))

        # ── Process Recurring Expenses ──────────────────────────────────────
        recurring_expenses = Expense.objects.filter(is_recurring=True).exclude(recurrence_type='none')

        for expense in recurring_expenses:
            next_date = self._get_next_occurrence(expense.date, expense.recurrence_type, today)

            if next_date and not self._exists(expense.user, expense.title, expense.amount, next_date, expense):
                if dry_run:
                    self.stdout.write(f'  Would create: {expense.title} ({expense.amount}) for {next_date}')
                else:
                    try:
                        Expense.objects.create(
                            user=expense.user,
                            category=expense.category,
                            title=expense.title,
                            amount=expense.amount,
                            date=next_date,
                            notes=expense.notes,
                            is_recurring=False,  # Generated entries are one-off
                            recurrence_type='none',
                        )
                        created_count += 1
                        self.stdout.write(f'  Created: {expense.title} ({expense.amount}) for {next_date}')
                    except IntegrityError:
                        self.stdout.write(self.style.WARNING(f'  Skipped (duplicate): {expense.title}'))

        # ── Process Recurring Income ────────────────────────────────────────
        recurring_income = Income.objects.filter(is_recurring=True).exclude(recurrence_type='none')

        for inc in recurring_income:
            next_date = self._get_next_occurrence(inc.date, inc.recurrence_type, today)

            if next_date and not self._income_exists(inc.user, inc.source, inc.amount, next_date, inc):
                if dry_run:
                    self.stdout.write(f'  Would create income: {inc.source} ({inc.amount}) for {next_date}')
                else:
                    try:
                        Income.objects.create(
                            user=inc.user,
                            category=inc.category,
                            source=inc.source,
                            amount=inc.amount,
                            date=next_date,
                            description=inc.description,
                            is_recurring=False,
                            recurrence_type='none',
                        )
                        created_count += 1
                        self.stdout.write(f'  Created income: {inc.source} ({inc.amount}) for {next_date}')
                    except IntegrityError:
                        self.stdout.write(self.style.WARNING(f'  Skipped (duplicate): {inc.source}'))

        self.stdout.write(self.style.SUCCESS(f'\nDone. Created {created_count} transactions.'))

    def _get_next_occurrence(self, last_date, recurrence_type, today):
        """Calculate the next occurrence date based on recurrence type."""
        if recurrence_type == 'daily':
            next_date = last_date + timedelta(days=1)
            if next_date <= today:
                return next_date
        elif recurrence_type == 'weekly':
            next_date = last_date + timedelta(weeks=1)
            if next_date <= today:
                return next_date
        elif recurrence_type == 'monthly':
            # Advance month, handle year rollover
            month = last_date.month + 1
            year = last_date.year
            if month > 12:
                month = 1
                year += 1
            try:
                next_date = last_date.replace(month=month, year=year)
            except ValueError:
                # Handle end-of-month edge cases (e.g., Jan 31 → Feb 28)
                import calendar
                last_day = calendar.monthrange(year, month)[1]
                from datetime import date
                next_date = date(year, month, min(last_date.day, last_day))

            if next_date <= today:
                return next_date

        return None

    def _exists(self, user, title, amount, date, original):
        """Check if a generated entry already exists for this date."""
        return Expense.objects.filter(
            user=user,
            title=title,
            amount=amount,
            date=date,
        ).exclude(pk=original.pk).exists()

    def _income_exists(self, user, source, amount, date, original):
        """Check if a generated income entry already exists for this date."""
        return Income.objects.filter(
            user=user,
            source=source,
            amount=amount,
            date=date,
        ).exclude(pk=original.pk).exists()
