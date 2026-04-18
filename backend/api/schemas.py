from pydantic import BaseModel, Field
from typing import List, Optional

class PatientVitals(BaseModel):
    """
    Schema for patient vital signs for risk stratification.
    """
    age: int = Field(..., ge=20, le=100)
    blood_pressure: int = Field(..., ge=90, le=200)
    cholesterol: int = Field(..., ge=100, le=400)

class PredictionResponse(BaseModel):
    crisp_risk_score: float
    risk_category: str
    triggered_rules: List[str]
    status: str
    membership_parameters: Optional[list] = None
