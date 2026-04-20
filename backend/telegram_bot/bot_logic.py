"""
bot_logic.py — Parse natural-language expense messages from Telegram.

Supported formats (case-insensitive, any token order):
    "150 Food Dinner"   → amount=150, category=Food,  title=Dinner
    "150 food dinner"   → amount=150, category=food,  title=dinner
    "food 150 dinner"   → amount=150, category=food,  title=dinner
    "150 dinner"        → amount=150, category=Other, title=dinner
    "150"               → amount=150, category=Other, title=expense

Returns a dict:
    {
        "amount":   Decimal or None,
        "category": str (name),
        "title":    str,
        "error":    str or None   # set when amount is missing
    }
"""

from decimal import Decimal, InvalidOperation
from typing import Optional

# These must match the default Category names created by users/signals.py
EXPENSE_CATEGORIES = {
    'bills', 'education', 'entertainment',
    'food', 'health', 'shopping', 'transport', 'other',
}
INCOME_CATEGORIES = {
    'salary', 'freelance', 'income',
}
VALID_CATEGORIES = EXPENSE_CATEGORIES | INCOME_CATEGORIES

# Words that strongly hint the entry is an income 
INCOME_HINTS = {'from', 'payment', 'received', 'credited', 'bonus'}


def _try_parse_number(token: str) -> Optional[Decimal]:
    """Return a Decimal if token is a valid positive number, else None."""
    try:
        value = Decimal(token)
        if value > 0:
            return value
    except InvalidOperation:
        pass
    return None


def parse_expense_message(text: str) -> dict:
    """
    Parse a Telegram message into expense/income components.
    Always returns a dict with keys: amount, category, title, error.
    """
    tokens = text.strip().split()

    amount: Optional[Decimal] = None
    category_name: Optional[str] = None
    title_words: list[str] = []

    for token in tokens:
        if amount is None:
            parsed = _try_parse_number(token)
            if parsed is not None:
                amount = parsed
                continue

        # Check if the exact token matches a known category
        # Replace underscores or dashes with space for multi-word comparison if added later
        clean_token = token.lower()
        if clean_token in VALID_CATEGORIES:
            if category_name is None:
                category_name = clean_token.capitalize()
            else:
                title_words.append(token)
        else:
            # Skip if it looks like a number we already captured
            if _try_parse_number(token) is not None and amount is not None:
                # duplicate number — treat as title word
                title_words.append(token)
            else:
                title_words.append(token)

    if amount is None:
        return {
            "amount": None,
            "category": None,
            "title": None,
            "error": (
                "Amount required.\n"
                "Example: `150 Food Lunch` or `5000 from Babu`"
            ),
        }

    # If no category explicitly matched, try to guess based on hints
    if category_name is None:
        title_text_lower = " ".join(title_words).lower()
        
        # If the user used income hints like "from" or "payment"
        if any(hint in title_text_lower.split() for hint in INCOME_HINTS):
            category_name = "Other Income"
        else:
            category_name = "Other"

    # Default titles
    final_title = " ".join(title_words)
    if not final_title:
        final_title = category_name

    return {
        "amount": amount,
        "category": category_name,
        "title": final_title,
        "error": None,
    }
