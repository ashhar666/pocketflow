import os
import django
from dotenv import load_dotenv

load_dotenv('.env')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

print(">>> Testing DB connection...")
try:
    with connection.cursor() as cursor:
        cursor.execute('SELECT version();')
        row = cursor.fetchone()
        print(f"    DB Version : {row[0]}")
        cursor.execute('SELECT current_database();')
        print(f"    Database   : {cursor.fetchone()[0]}")
        cursor.execute('SELECT current_user;')
        print(f"    User       : {cursor.fetchone()[0]}")
    print("    Connection : SUCCESS\n")
except Exception as e:
    print(f"    Connection FAILED: {e}\n")
    exit(1)

print(">>> Checking tables...")
table_names = connection.introspection.table_names()
print(f"    Total tables found: {len(table_names)}")

key_tables = [
    'users_user',
    'expenses_expense',
    'budgets_budget',
    'income_income',
    'categories_category',
    'savings_savingsgoal',
]
all_ok = True
for t in key_tables:
    status = "OK     " if t in table_names else "MISSING"
    if t not in table_names:
        all_ok = False
    print(f"    [{status}] {t}")

print()
print(">>> Row counts...")
with connection.cursor() as cursor:
    for t in [x for x in key_tables if x in table_names]:
        cursor.execute(f'SELECT COUNT(*) FROM "{t}";')
        print(f"    {t}: {cursor.fetchone()[0]} rows")

print()
if all_ok:
    print("All checks PASSED - PostgreSQL/Supabase is connected and tables are present.")
else:
    print("Some tables are MISSING - you may need to run: python manage.py migrate")
