from google import genai

key = "AIzaSyBYrPU15yAtIjoH-L4dBsawvymoaM5njxQ"

def list_models():
    try:
        client = genai.Client(api_key=key)
        for model in client.models.list():
            print(f"AVAILABLE: {model.name}")
    except Exception as e:
        print(f"FAILED: {str(e)}")

if __name__ == "__main__":
    list_models()
