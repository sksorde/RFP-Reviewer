from fastapi import APIRouter, UploadFile, Form
import sys
import subprocess
from app.services.compliance import evaluate
from app.utils.extractor import extract_text

router = APIRouter()

# =========================================
# BUILD / REFRESH INDEX
# =========================================

@router.post("/build-refresh-index")
async def build_refresh_index():
    chunk_size_tokens = 2500  # or get from frontend
    overlap_tokens = 500      # or get from frontend
    try:
        # Run the load_kb.py script
        result = subprocess.run(
            [sys.executable, "load_kb.py", str(chunk_size_tokens), str(overlap_tokens)], 
            check=True,  # Ensures that any error will raise an exception
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        output = result.stdout.decode()
        return {"message": "Index build/refresh started successfully", "output": output}
    except subprocess.CalledProcessError as e:
        return {"error": f"Error executing load_kb.py: {e.stderr.decode()}"}

# =========================================
# COMPLIANCE REVIEW
# =========================================

@router.post("/review")
async def review(
    rfp: UploadFile = None,
    response: UploadFile = None,
    rfp_text: str = Form(None),
    response_text: str = Form(None)
):
    print("\n===== REVIEW API CALLED =====")

    try:
        # ---------------------------------
        # Handle RFP input
        # ---------------------------------
        if rfp:
            print(f"RFP file uploaded: {rfp.filename}")

            rfp_bytes = await rfp.read()
            rfp_text = extract_text(rfp_bytes, rfp.filename)

        elif rfp_text:
            print("RFP provided via text input")

        else:
            return {
                "results": [],
                "error": "Please provide RFP file or RFP text"
            }
        # ---------------------------------
        # Handle Response input
        # ---------------------------------
        if response:
            print(f"Response file uploaded: {response.filename}")

            response_bytes = await response.read()
            response_text = extract_text(
                response_bytes,
                response.filename
            )

        elif response_text:
            print("Response provided via text input")

        else:
            return {
                "results": [],
                "error": "Please provide Response file or Response text"
            }

        print(f"RFP text length: {len(rfp_text)}")
        print(f"Response text length: {len(response_text)}")

        # ---------------------------------
        # Extract requirements
        # ---------------------------------

        requirements = [
            line.strip()
            for line in rfp_text.split("\n")
            if len(line.strip()) > 30
        ][:2]

        print(f"Requirements found: {len(requirements)}")
        print(requirements)

        if not requirements:
            return {
                "results": [],
                "error": "No valid requirements found in RFP"
            }

        # ---------------------------------
        # Evaluate requirements
        # ---------------------------------

        results = []

        for req in requirements:
            print(f"Evaluating: {req[:100]}")

            result = evaluate(
                req,
                response_text
            )

            results.append(result)

        print("FINAL RESULTS:", results)

        return {
            "results": results
        }

    except Exception as e:
        print("ERROR in /review:", str(e))

        return {
            "results": [],
            "error": str(e)
        }
