import os
from huggingface_hub import HfApi

token = os.getenv("HF_TOKEN")
if not token:
    print("ERROR: HF_TOKEN not set")
    exit(1)

api = HfApi(token=token)
repo_id = "ashharshahan/pocketflow"

print(f"Restarting space {repo_id}...")
try:
    api.restart_space(repo_id=repo_id)
    print("Restart request sent successfully!")
except Exception as e:
    print(f"Failed to restart: {e}")
