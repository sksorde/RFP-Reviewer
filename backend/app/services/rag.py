from sentence_transformers import SentenceTransformer
from app.db import search_chunks

model = None


def get_model():
    global model

    if model is None:
        print("Loading embedding model...")
        model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Model loaded successfully")

    return model


def embed(text):
    model = get_model()
    vector = model.encode(text).tolist()
    return str(vector)


def retrieve(query, chunk_size_tokens, overlap_tokens):
    query_embedding = embed(query)

    rows = search_chunks(query_embedding, k=10)

    return [
        {
            "content": row[0],
            "source": row[1],
            "category": row[2]
        }
        for row in rows
    ]
