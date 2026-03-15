from django.urls import path
from .views import chat_rag, similar_movies  # ✅ direct import

urlpatterns = [
    path("chat_rag/", chat_rag, name="chat_rag"),
    path("similar_movies/", similar_movies, name="similar_movies"),  # ✅ use function directly
]