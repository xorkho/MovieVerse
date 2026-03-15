import os
import pandas as pd
import numpy as np
import ast
from sentence_transformers import SentenceTransformer

os.makedirs("embeddings", exist_ok=True)

# load datasets
movies = pd.read_csv("dataset/tmdb_5000_movies.csv")
credits = pd.read_csv("dataset/tmdb_5000_credits.csv")

# merge
df = movies.merge(credits, on="title")

df = df[['title','overview','genres','keywords','cast']].dropna()


def extract_names(json_str, key="name", top_n=5):
    try:
        data = ast.literal_eval(json_str)
        names = [item[key] for item in data[:top_n]]
        return " ".join(names)
    except:
        return ""


# clean columns
df["genre_names"] = df["genres"].apply(extract_names)
df["keyword_names"] = df["keywords"].apply(extract_names)
df["cast_names"] = df["cast"].apply(extract_names)

# combine text
df["text"] = (
    "Overview: " + df["overview"] +
    " Genres: " + df["genre_names"] +
    " Keywords: " + df["keyword_names"] +
    " Cast: " + df["cast_names"]
)

print("Movies loaded:", len(df))

# embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

embeddings = model.encode(df["text"].tolist(), show_progress_bar=True)

print("Embedding shape:", embeddings.shape)

# save files
np.save("embeddings/movie_embeddings.npy", embeddings)
df[['title','text','genre_names','keyword_names','cast_names']].to_pickle("embeddings/movies.pkl")

print("Embeddings created successfully!")