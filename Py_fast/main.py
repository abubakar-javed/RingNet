from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load the trained model
model = joblib.load('./earthquake_model.pkl')

# Request schema
class PredictionRequest(BaseModel):
    parameters: list[float]

def estimate_distance(magnitude: float) -> float:
    if magnitude >= 7:
        return 500
    elif magnitude >= 5:
        return 200
    else:
        return 100

@app.get("/")
async def read_root():
    return {"message": "Welcome to my FastAPI app!"}
@app.post("/predict")
async def predict(request: PredictionRequest):
    if len(request.parameters) != 12:
        raise HTTPException(status_code=400, detail="12 input parameters are required.")

    # Convert input to numpy array and make predictions
    input_array = np.array([request.parameters])
    magnitude = model.predict(input_array)[0]
    distance = estimate_distance(magnitude)

    return {"magnitude": magnitude, "distance": distance}
