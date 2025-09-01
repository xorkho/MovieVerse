from django.urls import path
from .views import chat_with_ollama

urlpatterns = [
    path("chat/", chat_with_ollama, name="chat"),
]