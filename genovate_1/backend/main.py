
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.analysis_service import get_analysis_memo

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="AI Commercial Real Estate Analyst API",
    description="An API that uses Google Gemini and BigQuery to analyze real estate data.",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """Prints a confirmation message when the server starts."""
    print("\n--- AI Real Estate Analyst Backend ---")
    print("Server is running.")
    print("API URL: http://127.0.0.1:8000")
    print("Health Check: http://127.0.0.1:8000/health")
    print("-------------------------------------\n")


# Configure CORS to allow requests from the frontend
origins = [
    "http://localhost:3000",  # Default for many React dev servers
    "null", # Allow requests from local files (e.g., opening index.html directly)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    file_content: str

@app.get("/health")
def health_check():
    """A simple endpoint to check if the server is running."""
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "AI Commercial Real Estate Analyst Backend is running."}

@app.post("/analyze")
async def analyze_document(request: AnalysisRequest):
    """
    Accepts commercial real estate data, enriches it with data from BigQuery,
    analyzes it using Gemini via LangChain, and returns a comprehensive deal memo.
    """
    if not os.getenv("API_KEY") or not os.getenv("GCP_PROJECT_ID"):
        raise HTTPException(
            status_code=500, 
            detail="API_KEY or GCP_PROJECT_ID not configured on the server. Please create and configure the .env file."
        )
        
    if not request.file_content or not request.file_content.strip():
        raise HTTPException(status_code=400, detail="File content is empty.")

    try:
        memo = await get_analysis_memo(request.file_content)
        return {"memo": memo}
    except Exception as e:
        print(f"An error occurred during analysis: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred during analysis: {str(e)}")

# To run this app:
# 1. Navigate to the 'backend' directory.
# 2. Make sure you have a .env file with your API_KEY and GCP_PROJECT_ID.
# 3. Run `pip install -r requirements.txt`.
# 4. Run `uvicorn main:app --reload` in your terminal.
