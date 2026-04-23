import os
from google import genai

# THE NEW KEY YOU GAVE ME
key = "AIzaSyCiBzKxhIF90KJ2uq28n7mVbYrhVunR-7Q"

def test_key():
    print(f"Testing key: {key[:8]}...{key[-4:]}")
    try:
        client = genai.Client(api_key=key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents="Say 'Key is working!'"
        )
        print(f"SUCCESS: {response.text.strip()}")
    except Exception as e:
        print(f"FAILED: {str(e)}")

if __name__ == "__main__":
    test_key()
