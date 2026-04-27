import os
from huggingface_hub import HfApi

token = os.getenv("HF_TOKEN")
api = HfApi(token=token)
repo_id = "ashharshahan/pocketflow"

print(f"Listing files in {repo_id}:")
files = api.list_repo_files(repo_id=repo_id, repo_type="space")
for f in files:
    if "telegram_bot" in f:
        print(f" - {f}")
