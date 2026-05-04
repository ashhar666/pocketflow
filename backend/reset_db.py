import os
import glob

base_dir = os.path.dirname(os.path.abspath(__file__))

# 1. Delete SQLite database
db_path = os.path.join(base_dir, 'db.sqlite3')
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"Deleted {db_path}")

# 2. Delete all migration files except __init__.py
migration_files = glob.glob(os.path.join(base_dir, '*', 'migrations', '*.py'))
count = 0
for f in migration_files:
    if not f.endswith('__init__.py'):
        os.remove(f)
        count += 1
print(f"Deleted {count} migration files.")
