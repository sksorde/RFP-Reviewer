import json
import re
import hashlib

from app.services.rag import retrieve
from app.utils.llm import call_llm
from app.db import get_cached_result, save_cached_result


def extract_json(text):
    try:
        text = text.replace("```json", "").replace("```", "").strip()

        match = re.search(r"\{.*\}", text, re.DOTALL)

        if match:
            return json.loads(match.group())

        raise ValueError("No valid JSON found")

    except Exception as e:
        raise ValueError(f"JSON extraction failed: {str(e)}")


def generate_hash(req, response):
    raw = req + response
    return hashlib.sha256(raw.encode()).hexdigest()


def evaluate(req, response):
    print(f"\n➡️ Evaluating requirement:")
    print(req[:150])

    # =========================
    # CACHE CHECK
    # =========================

    requirement_hash = generate_hash(req, response)

    cached = get_cached_result(requirement_hash)

    if cached:
        print("⚡ CACHE HIT → Skipping LLM call")
        return cached

    print("❌ CACHE MISS → Calling LLM")

    # =========================
    # RAG EVIDENCE
    # =========================

    #evidence = retrieve(req)   --SKS: Changed for tokens
    evidence = retrieve(req, chunk_size_tokens, overlap_tokens)
    print(f"📄 Evidence retrieved: {len(evidence)} chunks")

    prompt = f"""
You are a strict enterprise RFP compliance evaluator.

Rules:
- Return STRICT JSON ONLY
- No explanation outside JSON
- No markdown
- No extra text
- Use only evidence provided

Requirement:
{req}

Vendor Response:
{response[:1000]}

Knowledge Base Evidence:
{json.dumps(evidence)}

Return only this JSON format:

{{
  "requirement": "{req}",
  "status": "COMPLIANT | PARTIAL | NOT ADDRESSED",
  "confidence": 0,
  "explanation": "short explanation",
  "evidence": {json.dumps(evidence)}
}}
"""

    try:
        print("🤖 Sending to Ollama...Kindly wait for response...")
        output = call_llm(prompt)

        print("✅ Raw LLM Response:")
        print(output)

        parsed = extract_json(output)

        print("✅ Parsed JSON successfully")

        # =========================
        # SAVE TO CACHE
        # =========================

        save_cached_result(
            requirement_hash,
            req,
            parsed
        )

        print("💾 Saved to cache")

        return parsed

    except Exception as e:
        print("❌ LLM Error:", str(e))

        return {
            "requirement": req,
            "status": "ERROR",
            "confidence": 0,
            "explanation": str(e),
            "evidence": evidence
        }
