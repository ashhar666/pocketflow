import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

key = os.getenv("GEMINI_API_KEY", "")

def test_key():
    if not key:
        print("FAILED: GEMINI_API_KEY is not set in the environment.")
        return

    print(f"Testing key: {key[:8]}...{key[-4:]}")
    try:
        client = genai.Client(api_key=key)
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents="Say 'Key is working!'"
        )
        print(f"SUCCESS: {response.text.strip()}")
    except Exception as e:
        print(f"FAILED: {str(e)}")

if __name__ == "__main__":
    test_key()
