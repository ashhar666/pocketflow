import os
from huggingface_hub import HfApi

# Using the token from the user's previous command
token = os.getenv("HF_TOKEN", "")
repo_id = "ashharshahan/pocketflow"
gemini_key = os.getenv("GEMINI_API_KEY", "")

api = HfApi(token=token)

print(f"Updating GEMINI_API_KEY secret in {repo_id}...")
try:
    api.add_space_secret(repo_id=repo_id, key="GEMINI_API_KEY", value=gemini_key)
    print("Secret updated successfully!")
except Exception as e:
    print(f"Failed to update secret: {e}")

print(f"Restarting space {repo_id}...")
try:
    api.restart_space(repo_id=repo_id)
    print("Restart request sent successfully!")
except Exception as e:
    print(f"Failed to restart: {e}")

print("\nDeployment finalized! Wait a minute for the space to rebuild.")
