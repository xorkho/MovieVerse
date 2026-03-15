import json
import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, StreamingHttpResponse
from .rag_utils import retrieve_movies 
MODEL_NAME = "gemma2:2b"
OLLAMA_URL = "http://localhost:11434/api/chat"

@csrf_exempt
def chat_rag(request):
    try:
        body = json.loads(request.body)
        query = body.get("prompt", "")
        if not query:
            return JsonResponse({"error": "Prompt missing"}, status=400)

        # ✅ RAG: retrieve relevant movies from saved embeddings
        top_movies = retrieve_movies(query, top_k=3)

        # ✅ Use full combined context from embeddings
        context = "\n".join([f"{row['title']}: {row['text']}" for _, row in top_movies.iterrows()])

        prompt = f"""
            You are a friendly movie assistant.
            Answer the user's query based ONLY on the following movies data.
            Do not invent information not present here.

            Movie Data:
            {context}

            User question: {query}

            ✅ Provide at least 3 movie recommendations similar to the user's query.
            ✅ For each movie, give a short explanation (1–2 sentences) why it's similar.
            ✅ Format it clearly like a numbered list.
            """

        # Streaming response from Gemma
        def generate():
            response = requests.post(
                OLLAMA_URL,
                json={"model": MODEL_NAME, "messages": [{"role": "user", "content": prompt}], "stream": True},
                stream=True
            )
            for line in response.iter_lines():
                if line:
                    try:
                        data = json.loads(line.decode())
                        if "message" in data and "content" in data["message"]:
                            yield json.dumps({"delta": data["message"]["content"]}) + "\n"
                    except:
                        continue

        return StreamingHttpResponse(generate(), content_type="application/json")

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


from django.http import JsonResponse
from .rag_utils import retrieve_movies  

def similar_movies(request):
    # 1️⃣ Get query from frontend
    movie_title = request.GET.get("q", "").strip()
    if not movie_title or len(movie_title) < 3:  # minimum 3 chars
        return JsonResponse({"similar_movies": []})

    try:
        # 2️⃣ Retrieve similar movies using embeddings
        top_movies = retrieve_movies(movie_title, top_k=10)  
        movies_list = []
        seen_titles = set()  # duplicate check

        for _, row in top_movies.iterrows():
            if row["title"] not in seen_titles:
                movies_list.append({
                    "title": row["title"],
                    "poster_path": row.get("poster_path", ""),
                    "overview": row.get("overview", ""),
                    "genres": row.get("genre_names", "")
                })
                seen_titles.add(row["title"])
            if len(movies_list) >= 5:  # top 5 unique movies
                break

        return JsonResponse({"similar_movies": movies_list})

    except Exception as e:
        # 3️⃣ Safe fallback
        return JsonResponse({"similar_movies": [], "error": str(e)}, status=500)