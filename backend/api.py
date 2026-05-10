from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.recommend import detect_patterns
from backend.preprocess import clean_data
from pydantic import BaseModel
from typing import List, Optional
from llama_cpp import Llama   # <-- using llama-cpp for GGUF models
import os
model_path = os.path.join(os.path.dirname(__file__), "models", "qwen2.5-0.5b-instruct-q4_k_m.gguf")

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LogEntry(BaseModel):
    timestamp: str
    glucose: float
    event: Optional[str] = ""

# -----------------------------
# LOAD QWEN GGUF MODEL (CPU)
# -----------------------------
model_path = os.path.join(os.path.dirname(__file__), "models", "qwen2.5-0.5b-instruct-q4_k_m.gguf")
print("Loading model from:", model_path)

llm = Llama(
    model_path=model_path,
    n_ctx=2048,     # context length
    n_threads=4,    # number of CPU threads
)

@app.post("/get_recommendations")
def get_recommendations(entries: List[LogEntry]):
    # Convert entries to dicts
    data = [entry.dict() for entry in entries]

    # Rule-based patterns
    df = clean_data(data)
    results = detect_patterns(df.to_dict("records"))

    # Build logs text
    logs_text = "\n".join(
        [f"{e['timestamp']}: {e['glucose']} mg/dL ({e['event']})" for e in data]
    )

    # -----------------------------
    # Build prompt for concise insight
    # -----------------------------
    prompt = (
    "Analyze the following glucose logs and detected patterns. "
    "provide a statistical analysis of the data"
    "No additional commentary nor suggestions."
    "Keep response under 50 words."
    "If last sentence does not end with a period, delete it.\n\n"
    f"Glucose logs:\n{logs_text}\n\n"
    f"Detected patterns:\n{results['patterns']}\n\n"
)


    # -----------------------------
    # Generate response
    # -----------------------------
    try:
        response = llm(
            prompt,
            max_tokens=50,  # small number for brevity
            temperature=0.3, # lower temperature for precise responses
        )

        ai_text = response["choices"][0]["text"].strip()
        results["ai_insights"] = [ai_text]

    except Exception as e:
        results["ai_insights"] = [f"AI insights unavailable: {e}"]

    return results
