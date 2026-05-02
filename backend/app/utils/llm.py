import requests


def call_llm(prompt):
    try:
        res = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            },
            timeout=600
        )

        print("Ollama Status Code:", res.status_code)
        print("Raw Ollama Response:", res.text)

        res.raise_for_status()

        data = res.json()

        if "response" not in data:
            raise Exception("No 'response' field returned from Ollama")

        return data["response"]

    except Exception as e:
        raise Exception(f"Ollama failed: {str(e)}")
