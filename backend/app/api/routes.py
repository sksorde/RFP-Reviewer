from fastapi import APIRouter, UploadFile, Form
import subprocess
from app.services.compliance import evaluate
from app.utils.extractor import extract_text

router = APIRouter()

# Route for triggering index refresh
@router.post("/build-refresh-index")
async def build_refresh_index():
    try:
        # Run the load_kb.py script
        result = subprocess.run(
            ["python", "backend/load_kb.py"], 
            check=True,  # Ensures that any error will raise an exception
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        output = result.stdout.decode()
        return {"message": "Index build/refresh started successfully", "output": output}
    except subprocess.CalledProcessError as e:
        return {"error": f"Error executing load_kb.py: {e.stderr.decode()}"}

# Route for review processing
@router.post("/review")
async def review(rfp: UploadFile = None, response: UploadFile = None, rfp_text: str = Form(None), response_text: str = Form(None)):
    print("\n===== REVIEW API CALLED =====")

    try:
        #rfp_bytes = await rfp.read()
        #response_bytes = await response.read()

        if rfp:
            rfp_bytes = await rfp.read()
            rfp_text = extract_text(rfp_bytes, rfp.filename)
        
        if response:
            response_bytes = await response.read()
            response_text = extract_text(response_bytes, response.filename)

        print(f"RFP text length: {len(rfp_text)}")
        print(f"Response text length: {len(response_text)}")

        print(f"RFP file: {rfp.filename}")
        print(f"Response file: {response.filename}")

        #rfp_text = extract_text(rfp_bytes, rfp.filename)
        #response_text = extract_text(response_bytes, response.filename)

        #print(f"RFP text length: {len(rfp_text)}")
        #print(f"Response text length: {len(response_text)}")

        requirements = [
            r.strip()
            for r in rfp_text.split("\n")
            if len(r.strip()) > 30
        ][:2]

        print(f"Requirements found: {len(requirements)}")
        print(requirements)

        results = []

        for req in requirements:
            print(f"Evaluating: {req[:80]}")
            result = evaluate(req, response_text)
            print("Result:", result)
            results.append(result)

        print("FINAL RESULTS:", results)

        return {"results": results}

    except Exception as e:
        print("ERROR in /review:", str(e))
        return {"results": [], "error": str(e)}
