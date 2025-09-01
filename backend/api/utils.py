# views.py
import json, requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, StreamingHttpResponse, HttpResponseBadRequest
from .utils import detect_intent, classify_intent_llm

OLLAMA_URL = "http://localhost:11434/v1/chat/completions"
MODEL_NAME = "gemma2:2b"   # change if needed

# prompt templates
MOOD_PROMPT_TEMPLATE = """You are a friendly movie chatbot.
The user is feeling {mood}.
Reply in a friendly ChatGPT-style tone and suggest 3-4 movies appropriate for this mood.
Keep it short, conversational, and show the list like:
Got it! Since you're feeling {mood}, here are some picks:

1. Movie Name
2. Movie Name
3. Movie Name

Add one casual closing line (emoji ok). Do NOT include extra explanation.
"""

MOVIE_INFO_PROMPT_TEMPLATE = """You are a helpful movie assistant.
The user asked: "{user_message}"
Provide concise factual info. If they ask about cast, release date, summary, or director, reply clearly.
If you don't know a fact, say "I don't know" rather than guessing.
Keep response short and friendly.
"""

GENERAL_PROMPT_TEMPLATE = """You are a friendly movie assistant.
User: "{user_message}"
Reply helpfully — if it looks like a mood request, suggest 3-4 movies; if it's a factual question, answer concisely.
"""

@csrf_exempt
def chat_with_ollama(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Invalid request method, use POST.")

    try:
        body = json.loads(request.body.decode("utf-8"))
        user_message = body.get("prompt", "").strip()
        if not user_message:
            return JsonResponse({"error": "Missing 'prompt' in request body"}, status=400)

        # 1) rule-based intent detection
        intent, value = detect_intent(user_message)

        # 2) optional: if 'general' and you want higher recall, run LLM-based classifier
        if intent == "general" and body.get("use_llm_intent_fallback", False):
            label = classify_intent_llm(user_message, ollama_url=OLLAMA_URL, model=MODEL_NAME)
            if label:
                if label in ["bored","sad","heartbroken"]:
                    intent = "mood"
                    value = label
                elif label == "movie_info":
                    intent = "movie_info"
                    value = None

        # 3) build prompt based on intent
        if intent == "mood":
            mood = value or "bored"
            prompt = MOOD_PROMPT_TEMPLATE.format(mood=mood)
        elif intent == "movie_info":
            prompt = MOVIE_INFO_PROMPT_TEMPLATE.format(user_message=user_message)
        else:
            prompt = GENERAL_PROMPT_TEMPLATE.format(user_message=user_message)

        messages = [
            {"role":"system", "content": "You are a helpful, concise movie assistant."},
            {"role":"user", "content": prompt}
        ]

        # 4) Stream from Ollama and forward JSONL lines for React
        def stream_generator():
            with requests.post(
                OLLAMA_URL,
                json={"model": MODEL_NAME, "messages": messages, "stream": True},
                stream=True,
            ) as r:
                for line in r.iter_lines():
                    if not line:
                        continue
                    try:
                        text = line.decode("utf-8").strip()
                        if text.startswith("data: "):
                            text = text[len("data: "):]
                        data = json.loads(text)
                        delta = data["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield json.dumps({"delta": delta}) + "\n"
                    except Exception:
                        continue

        resp = StreamingHttpResponse(stream_generator(), content_type="application/json")
        resp["Cache-Control"] = "no-cache"
        resp["X-Accel-Buffering"] = "no"
        resp["Access-Control-Allow-Origin"] = "*"
        return resp

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
