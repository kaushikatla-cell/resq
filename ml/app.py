import os, pickle, logging
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title='ResQ ML Service', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['GET','POST'], allow_headers=['*'])

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
_model = None

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise HTTPException(status_code=503, detail='Model not trained. Run: python train.py')
        with open(MODEL_PATH, 'rb') as f: _model = pickle.load(f)
        logger.info('Model loaded')
    return _model

@app.on_event('startup')
async def startup():
    try: get_model(); logger.info('✅ Model ready')
    except HTTPException: logger.warning('⚠  Model not found — run python train.py')

class PredictRequest(BaseModel):
    day_of_week: int   = Field(ge=0, le=6)
    meal_type:   str
    category:    str
    menu_items:  int   = Field(ge=1, le=100)
    enrolled:    int   = Field(ge=0)
    event_day:   bool
    weather_code: int  = Field(ge=0, le=2)

MEAL_HOURS = {'breakfast': 7, 'lunch': 12, 'dinner': 18}

@app.post('/predict')
def predict(req: PredictRequest):
    model = get_model()
    row = pd.DataFrame([{**req.dict(), 'event_day': int(req.event_day), 'hour_of_day': MEAL_HOURS.get(req.meal_type, 12)}])
    try: raw = float(model.predict(row)[0])
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
    prediction = max(0, round(raw))
    confidence = 'high' if prediction < 150 else 'medium' if prediction < 300 else 'low'
    return {'predicted_surplus': prediction, 'confidence': confidence}

@app.get('/health')
def health():
    return {'status': 'ok', 'model_ready': os.path.exists(MODEL_PATH)}
