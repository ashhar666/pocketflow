import os
from google import genai

# THE NEW KEY YOU GAVE ME
key = "AIzaSyBYrPU15yAtIjoH-L4dBsawvymoaM5njxQ"

def test_key():
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
