import json
import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, StreamingHttpResponse, HttpResponseBadRequest


@csrf_exempt
def chat_with_ollama(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Invalid request method, use POST.")

    try:
        body = json.loads(request.body.decode("utf-8"))
        user_message = body.get("prompt")
        if not user_message:
            return JsonResponse({"error": "Missing 'prompt' in request body"}, status=400)

        # 🔹 Streaming generator (JSONL style)
        def stream_generator():
            with requests.post(
                "http://localhost:11434/v1/chat/completions",
                json={
                    "model": "gemma:2b", 
                    "messages": [{"role": "user", "content": user_message}],
                    "stream": True
                },
                stream=True,
            ) as r:
                for line in r.iter_lines():
                    if line:
                        try:
                            data = json.loads(line.decode("utf-8").replace("data: ", ""))
                            delta = data["choices"][0]["delta"].get("content", "")
                            if delta:
                                # 👇 Plain JSON line (React compatible)
                                yield json.dumps({"delta": delta}) + "\n"
                        except Exception:
                            continue

        response = StreamingHttpResponse(stream_generator(), content_type="application/json")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        response["Access-Control-Allow-Origin"] = "*"
        return response

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
