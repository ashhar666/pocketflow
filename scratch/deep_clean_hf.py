import os
from huggingface_hub import HfApi

token = os.getenv("HF_TOKEN")
api = HfApi(token=token)
repo_id = "ashharshahan/pocketflow"

# Detailed list of files to clean
files_to_delete = [
    "telegram_bot/views.py",
    "telegram_bot/urls.py",
    "telegram_bot/debug_views.py",
    "telegram_bot/__pycache__/views.cpython-314.pyc",
    "telegram_bot/__pycache__/urls.cpython-314.pyc",
    "telegram_bot/__pycache__/debug_views.cpython-314.pyc",
    "telegram_bot/__pycache__/utils.cpython-314.pyc",
    "telegram_bot/__pycache__/bot_logic.cpython-314.pyc",
]

print(f"Cleaning up {repo_id}...")
for f in files_to_delete:
    try:
        api.delete_file(path_in_repo=f, repo_id=repo_id, repo_type="space")
        print(f"Deleted {f}")
    except Exception as e:
        print(f"Skipped {f}: {e}")

print("Cleanup complete.")
