import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

# Load saved files
df = pd.read_pickle("embeddings/movies.pkl")
embeddings = np.load("embeddings/movie_embeddings.npy")


def retrieve_movies(query, top_k=5):

    # query embedding
    query_vec = model.encode([query])[0]

    # cosine similarity
    sims = np.dot(embeddings, query_vec) / (
        np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_vec)
    )

    # top results
    top_idx = sims.argsort()[::-1][:top_k]

    return df.iloc[top_idx]