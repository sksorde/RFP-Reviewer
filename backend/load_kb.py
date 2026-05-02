import os
from app.services.rag import embed
from app.db import insert_chunk
from app.utils.extractor import extract_text

KB_PATH = r"C:\SKS\react\backend\knowledge_base"

def clean_text(text):
    # Remove NULL characters
    return text.replace("\x00", "").strip()


def load():
    total_chunks = 0

    print(f"Checking KB path: {os.path.abspath(KB_PATH)}")

    if not os.path.exists(KB_PATH):
        print("❌ knowledge_base folder not found")
        return

    for root, _, files in os.walk(KB_PATH):
        print(f"\n📂 Folder: {root}")
        print(f"Files found: {files}")

        for file in files:
            path = os.path.join(root, file)
            print(f"\nProcessing file: {path}")

            try:
                with open(path, "rb") as f:
                    file_bytes = f.read()

                # Use extractor for PDF / DOCX / TXT
                text = extract_text(file_bytes, file)

                text = clean_text(text)

                if not text:
                    print("⚠ Empty text extracted")
                    continue

                category = os.path.basename(root)

                for chunk in text.split("\n"):
                    chunk = clean_text(chunk)

                    if len(chunk) > 50:
                        try:
                            embedding = embed(chunk)

                            insert_chunk(
                                chunk,
                                embedding,
                                file,
                                category
                            )

                            total_chunks += 1
                            print(f"✅ Inserted chunk #{total_chunks}")

                        except Exception as e:
                            print(f"❌ Insert failed: {e}")

            except Exception as e:
                print(f"❌ File processing failed: {e}")

    print(f"\n🚀 KB loaded successfully")
    print(f"Total chunks inserted: {total_chunks}")


if __name__ == "__main__":
    load()
