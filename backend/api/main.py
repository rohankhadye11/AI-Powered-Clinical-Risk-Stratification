from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pathlib
import joblib
import skfuzzy.control as ctrl
from .schemas import PatientVitals

# Global variable to store the loaded model
model_state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load the clinical risk model on startup.
    """
    current_dir = pathlib.Path(__file__).parent.resolve()
    model_path = current_dir / ".." / "neuro_fuzzy" / "saved_models" / "clinical_anfis_model.pkl"
    
    if not model_path.exists():
        print(f"ERROR: Model file not found at {model_path}")
        # Note: In production, you might want to raise an error or use a fallback
    else:
        try:
            # The saved object is a ControlSystemSimulation (or similar serialized object)
            model_state["simulator"] = joblib.load(model_path)
            print(f"Model loaded successfully from {model_path}")
        except Exception as e:
            print(f"ERROR: Failed to load model: {e}")
            
    yield
    # Clean up on shutdown if necessary
    model_state.clear()

app = FastAPI(
    title="Clinical Risk Stratification API",
    description="API to predict cardiovascular risk using a Neuro-Fuzzy ANFIS model.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allowing all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Clinical Risk Stratification API"}

@app.post("/predict-risk")
async def predict_risk(patient: PatientVitals):
    """
    Computes cardiovascular risk based on patient vitals using the tuned fuzzy system.
    """
    if "simulator" not in model_state:
        raise HTTPException(status_code=503, detail="Model not loaded on server.")

    simulator = model_state["simulator"]
    
    try:
        # Pass inputs to the simulation
        simulator.input['age'] = patient.age
        simulator.input['blood_pressure'] = patient.blood_pressure
        simulator.input['cholesterol'] = patient.cholesterol
        
        # Compute the result and enforce mathematical bounding 
        # (Centroid limits are natively [-50, 150] to solve MAE clipping, but UI requires strictly [0, 100])
        simulator.compute()
        raw_score = simulator.output['risk_score']
        risk_score = max(0.0, min(100.0, float(raw_score)))
        
        # Determine risk category based on score
        if risk_score < 40:
            category = "Low"
        elif 40 <= risk_score <= 70:
            category = "Medium"
        else:
            category = "High"
            
        # Extract triggered rules (Explainable AI)
        triggered_rules = []
        for rule in simulator.ctrl.rules:
            # Check internal firing strength from the skfuzzy computation graph
            try:
                # The 'aggregate_firing' dictionary stores firing strength keyed by the simulator instance
                firing_strength = rule.aggregate_firing.get(simulator, 0.0)
                # For some versions/configurations, it might be an array or stored differently
                if hasattr(firing_strength, '__iter__'):
                    firing_strength = max(firing_strength) if len(firing_strength) > 0 else 0.0
                
                if float(firing_strength) > 0.01:
                    triggered_rules.append(str(rule))
            except Exception:
                # Safe fallback if skfuzzy internal graph API changes
                triggered_rules.append(str(rule))
                
        # Get learned parameters if available
        learned_params = getattr(simulator, "learned_fuzzy_params", None)
            
        return {
            "crisp_risk_score": round(float(risk_score), 2),
            "risk_category": category,
            "triggered_rules": triggered_rules if len(triggered_rules) > 0 else ["No specific risk rules triggered significantly."],
            "status": "success",
            "membership_parameters": learned_params
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Standard command to run: uvicorn api.main:app --reload
