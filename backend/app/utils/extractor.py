from docx import Document
import pdfplumber
from io import BytesIO

def extract_text(file_bytes, filename):
    stream = BytesIO(file_bytes)

    if filename.endswith(".docx"):
        doc = Document(stream)
        return "\n".join(p.text for p in doc.paragraphs)

    if filename.endswith(".pdf"):
        text = []
        with pdfplumber.open(stream) as pdf:
            for p in pdf.pages:
                t = p.extract_text()
                if t:
                    text.append(t)
        return "\n".join(text)

    return file_bytes.decode("utf-8", errors="ignore")
