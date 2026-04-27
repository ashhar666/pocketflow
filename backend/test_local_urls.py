import requests

# Try various combinations
urls = [
    'http://localhost:8000/api/summary/activity/',
    'http://localhost:8000/api/summary/activity',
    'http://localhost:8000/api/summary/monthly/',
]

for url in urls:
    try:
        r = requests.get(url)
        print(f"URL: {url} -> Status: {r.status_code}")
    except Exception as e:
        print(f"URL: {url} -> Failed: {e}")
