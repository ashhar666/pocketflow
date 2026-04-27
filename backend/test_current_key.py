import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GEMINI_API_KEY")

def test_key():
    print(f"Testing key from .env: {key[:8]}...{key[-4:] if key else 'NONE'}")
    if not key:
        print("ERROR: No key found in .env")
        return
    try:
        client = genai.Client(api_key=key)
        models = client.models.list()
        print("SUCCESS: Key is valid!")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == '__main__':
    test_key()
