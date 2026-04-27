import os
from google import genai

# Testing the key found in .kilo/.env
key = "AIzaSyBc-PHhf_Ow35IGgmw1T2dmWhS1V41Qw4Y"

def test_key():
    print(f"Testing key: {key[:8]}...{key[-4:]}")
    try:
        client = genai.Client(api_key=key)
        # Try a simple generation
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents="Hello, are you working?"
        )
        print("SUCCESS: Key is valid!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == '__main__':
    test_key()
