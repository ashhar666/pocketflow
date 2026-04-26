import os
from google import genai

# Testing the key found in .env
key = "AIzaSyCvnOSrzVH2Nr11qURU23rBvz1fiXIn5GA"

def test_key():
    print(f"Testing key: {key[:8]}...{key[-4:]}")
    try:
        client = genai.Client(api_key=key)
        # Try a simple list models to see if key works
        models = client.models.list()
        print("SUCCESS: Key is valid!")
        for m in models:
            print(f" - {m.name}")
            break
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == '__main__':
    test_key()
