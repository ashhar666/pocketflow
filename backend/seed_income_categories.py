import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from categories.models import Category
from income.models import Income
from users.models import User

def seed_income_data():
    users = User.objects.all()
    if not users.exists():
        print("No users found. Please create a user first.")
        return

    # 1. Define Default Income Categories with Emojis for better dropdown visibility
    income_categories = [
        {'name': 'Salary / Wage', 'icon': '💰', 'color': '#10b981'},
        {'name': 'Freelance / Gigs', 'icon': '💻', 'color': '#6366f1'},
        {'name': 'Investments', 'icon': '📈', 'color': '#f59e0b'},
        {'name': 'Business Profits', 'icon': '🏢', 'color': '#8b5cf6'},
        {'name': 'Gifts / Bonus', 'icon': '🎁', 'color': '#ec4899'},
        {'name': 'Advance Payments', 'icon': '💸', 'color': '#06b6d4'},
        {'name': 'Other Income', 'icon': '🏷️', 'color': '#64748b'},
    ]

    # 0. Transition mapping for old/misspelled categories
    transition_mapping = {
        'Salary': 'Salary / Wage',
        'Freelance': 'Freelance / Gigs',
        'Business': 'Business Profits',
        'Gifts': 'Gifts / Bonus',
        'Other': 'Other Income',
        'Salary Advance': 'Advance Payments',
        'Salary Adwance': 'Advance Payments',
        'Advance paymentes': 'Advance Payments',
        'Adwance paymentes': 'Advance Payments',
        'Advance': 'Advance Payments'
    }

    for user in users:
        print(f"\n--- Seeding Income Categories for user: {user.email} ---")
        
        for old_name, new_name in transition_mapping.items():
            Category.objects.filter(name=old_name, user=user).update(name=new_name)

        category_objs = {}
        for cat_data in income_categories:
            # Check if it should be BOTH or INCOME
            existing = Category.objects.filter(user=user, name=cat_data['name']).first()
            target_type = 'INCOME'
            if existing and existing.category_type == 'BOTH':
                target_type = 'BOTH'
            
            obj, created = Category.objects.update_or_create(
                user=user,
                name=cat_data['name'],
                defaults={
                    'icon': cat_data['icon'],
                    'color': cat_data['color'],
                    'category_type': target_type
                }
            )
            category_objs[cat_data['name'].lower()] = obj
            print(f"  - {'Created' if created else 'Updated'} category: {obj.name}")

        # 2. Auto-categorize existing Income entries for this user
        print(f"Auto-categorizing existing income entries for {user.email}...")
        uncategorized_incomes = Income.objects.filter(category__isnull=True, user=user)
        categorized_count = 0

        for income in uncategorized_incomes:
            source_lower = income.source.lower()
            matched_cat = None

            if any(kw in source_lower for kw in ['salary', 'paycheck', 'wage', 'company', 'job']):
                matched_cat = category_objs['salary / wage']
            elif any(kw in source_lower for kw in ['freelance', 'project', 'gig', 'upwork', 'fiverr', 'side']):
                matched_cat = category_objs['freelance / gigs']
            elif any(kw in source_lower for kw in ['dividend', 'interest', 'stock', 'crypto', 'invest', 'divden']):
                matched_cat = category_objs['investments']
            elif any(kw in source_lower for kw in ['business', 'sale', 'revenue', 'profit']):
                matched_cat = category_objs['business profits']
            elif any(kw in source_lower for kw in ['gift', 'birthday', 'reward', 'bonus']):
                matched_cat = category_objs['gifts / bonus']
            elif any(kw in source_lower for kw in ['advance', 'loan', 'prepaid']):
                matched_cat = category_objs['advance payments']
            else:
                matched_cat = category_objs['other income']

            if matched_cat:
                income.category = matched_cat
                # If the income is from a previous month, move it to the current month for visibility
                from datetime import date
                today = date.today()
                if income.date.month != today.month:
                    income.date = income.date.replace(month=today.month, year=today.year)
                income.save()
                categorized_count += 1
                print(f"  - Categorized '{income.source}' as {matched_cat.name} and updated date to {income.date}")

        print(f"Done for {user.email}! Categorized {categorized_count} entries.")

    print("\nGlobal Seeding Complete!")

    print(f"\nDone! Categorized {categorized_count} income entries.")

if __name__ == "__main__":
    seed_income_data()
