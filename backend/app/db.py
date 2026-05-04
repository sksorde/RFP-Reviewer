import psycopg2
import json


def get_conn():
    return psycopg2.connect(
        dbname="bid",
        user="postgres",
        password="admin",
        host="localhost",
        port="5432"
    )


# =========================
# KB CHUNKS
# =========================

def insert_chunk(text, embedding, source_file, category, chunk_size_tokens, overlap_tokens):
    conn = get_conn()
    cur = conn.cursor()

    # Split the text based on chunk size and overlap
    chunks = split_into_chunks_with_overlap(text, chunk_size_tokens, overlap_tokens)
    
    for chunk in chunks:
        cur.execute(
            """
            INSERT INTO kb_chunks
            (content, embedding, source_file, category)
            VALUES (%s, %s, %s, %s)
            """,
            (chunk, embedding, source_file, category)
        )

    conn.commit()
    cur.close()
    conn.close()


def search_chunks(query_embedding, k=5):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT content, source_file, category
        FROM kb_chunks
        ORDER BY embedding <-> %s::vector
        LIMIT %s
        """,
        (query_embedding, k)
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows


# =========================
# CACHE FUNCTIONS
# =========================

def get_cached_result(requirement_hash):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT result
        FROM compliance_cache
        WHERE requirement_hash = %s
        """,
        (requirement_hash,)
    )

    row = cur.fetchone()

    cur.close()
    conn.close()

    if row:
        return row[0]

    return None


def save_cached_result(requirement_hash, requirement, result):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO compliance_cache
        (
            requirement_hash,
            requirement,
            result
        )
        VALUES (%s, %s, %s)
        ON CONFLICT (requirement_hash)
        DO NOTHING
        """,
        (
            requirement_hash,
            requirement,
            json.dumps(result)   # FIXED HERE
        )
    )

    conn.commit()

    cur.close()
    conn.close()

# =========================
# CHUNKING FUNCTIONS
# =========================

def split_into_chunks_with_overlap(text, chunk_size_tokens, overlap_tokens):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size_tokens - overlap_tokens):
        chunk = words[i:i + chunk_size_tokens]
        chunks.append(" ".join(chunk))
    return chunks
