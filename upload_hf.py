import os
from huggingface_hub import HfApi

api = HfApi(token=os.getenv("HF_TOKEN"))
if not api.token:
    print("ERROR: HF_TOKEN environment variable not set.")
    exit(1)

print("Starting clean Hugging Face upload (ignoring junk)...")
api.upload_folder(
    folder_path="c:/expense tracker/backend",
    repo_id="ashharshahan/pocketflow",
    repo_type="space",
    ignore_patterns=[
        "venv/**",
        "staticfiles/**",
        "__pycache__/**",
        "logs/**",
        "scratch/**",
        "*.sqlite3*",
        "*.pdf",
        "*.exe",
        "*.zip",
        ".git/**",
        "node_modules/**",
        "frontend/**" # Assuming this is legacy or redundant
    ]
)
print("Upload Complete!")
