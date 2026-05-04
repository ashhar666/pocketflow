from huggingface_hub import HfApi
import os

token = os.getenv("HF_TOKEN")
if not token:
    print("MISSING HF_TOKEN")
    exit(1)

api = HfApi(token=token)
repo_id = "ashharshahan/pocketflow"

try:
    print(f"Deleting telegram_bot/views.py from {repo_id}...")
    api.delete_file("telegram_bot/views.py", repo_id=repo_id, repo_type="space")
    print("Deleted!")
except Exception as e:
    print(f"Error: {e}")

try:
    print(f"Deleting telegram_bot/urls.py from {repo_id}...")
    api.delete_file("telegram_bot/urls.py", repo_id=repo_id, repo_type="space")
    print("Deleted!")
except Exception as e:
    print(f"Error: {e}")
