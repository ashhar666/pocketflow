
import os
from google import genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
image_path = r"C:\Users\Fineland\Downloads\ChatGPT Image Apr 24, 2026, 11_19_02 PM.png"

print(f"Testing generation with image and key: {key[:8]}...{key[-4:]}")

try:
    client = genai.Client(api_key=key)
    img = Image.open(image_path)
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=["What is in this image?", img]
    )
    print("SUCCESS: Image generation worked!")
    print(f"Response: {response.text[:100]}...")
except Exception as e:
    print(f"FAILED: {str(e)}")
