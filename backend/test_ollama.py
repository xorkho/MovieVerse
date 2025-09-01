import requests

try:
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "mistral", "prompt": "Hello from Django!"}
    )

    print("STATUS:", response.status_code)
    print("RAW RESPONSE:", response.text) 
    data = response.json()
    print("PARSED RESPONSE:", data)

except Exception as e:
    print("Error:", e)
