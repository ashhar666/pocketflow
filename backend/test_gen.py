import os
from google import genai

# Testing the key found in .env with a generation request
key = "AIzaSyCvnOSrzVH2Nr11qURU23rBvz1fiXIn5GA"

def test_generation():
    print(f"Testing generation with key: {key[:8]}...{key[-4:]}")
    try:
        client = genai.Client(api_key=key)
        response = client.models.generate_content(
            model='gemini-flash-lite-latest',
            contents="Hello, are you working?"
        )
        print("SUCCESS: Generation worked!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == '__main__':
    test_generation()
