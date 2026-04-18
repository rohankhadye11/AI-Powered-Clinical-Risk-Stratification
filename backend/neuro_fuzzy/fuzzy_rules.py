import numpy as np
import skfuzzy as fuzzy
from skfuzzy import control as ctrl

def get_fuzzy_system():
    """
    Defines the fuzzy variables, membership functions, and rules for 
    cardiovascular risk stratification.
    
    Returns:
        ctrl.ControlSystem: The compiled fuzzy control system.
    """
    
    # 1. Define Antecedents (Inputs)
    # Range conventions: (start, stop, step)
    age = ctrl.Antecedent(np.arange(20, 101, 1), 'age')
    blood_pressure = ctrl.Antecedent(np.arange(90, 201, 1), 'blood_pressure')
    cholesterol = ctrl.Antecedent(np.arange(100, 401, 1), 'cholesterol')
    
    # 2. Define Consequent (Output)
    # The mathematical bounds are expanded beyond [0, 100] to [-50, 150] to 
    # defeat the centroid clipping limit.
    risk_score = ctrl.Consequent(np.arange(-50, 151, 1), 'risk_score')
    
    # 3. Define Membership Functions (Triangular - trimf)
    # Using 'Low', 'Medium', 'High' for all variables
    
    # Age Membership Functions
    age['Low'] = fuzzy.trimf(age.universe, [20, 20, 55])
    age['Medium'] = fuzzy.trimf(age.universe, [40, 60, 80])
    age['High'] = fuzzy.trimf(age.universe, [65, 100, 100])
    
    # Blood Pressure Membership Functions (mmHg)
    # Medical Intuition: High BP starts significantly above 140
    blood_pressure['Low'] = fuzzy.trimf(blood_pressure.universe, [90, 90, 130])
    blood_pressure['Medium'] = fuzzy.trimf(blood_pressure.universe, [120, 145, 170])
    blood_pressure['High'] = fuzzy.trimf(blood_pressure.universe, [155, 200, 200])
    
    # Cholesterol Membership Functions (mg/dL)
    # Medical Intuition: High is usually > 240
    cholesterol['Low'] = fuzzy.trimf(cholesterol.universe, [100, 100, 220])
    cholesterol['Medium'] = fuzzy.trimf(cholesterol.universe, [200, 250, 300])
    cholesterol['High'] = fuzzy.trimf(cholesterol.universe, [280, 400, 400])
    
    # Risk Score Membership Functions (%)
    # The peaks for Low and High are anchored at absolute 0 and 100 boundaries.
    risk_score['Low'] = fuzzy.trimf(risk_score.universe, [-50, 0, 50])
    risk_score['Medium'] = fuzzy.trimf(risk_score.universe, [25, 50, 75])
    risk_score['High'] = fuzzy.trimf(risk_score.universe, [50, 100, 150])
    
    # 4. Define Fuzzy Rules
    # We institute comprehensive generic 'OR' rules so the risk space is completely saturated, 
    # preventing "Rule Starvation" where patients trigger 0 rules.
    
    # High Risk Core Rules (Overlapping)
    rule1 = ctrl.Rule(blood_pressure['High'] | cholesterol['High'], risk_score['High'])
    rule2 = ctrl.Rule(age['High'] & (blood_pressure['Medium'] | cholesterol['Medium']), risk_score['High'])
    
    # Low Risk Core Rules (Overlapping)
    rule3 = ctrl.Rule(age['Low'] & blood_pressure['Low'] & cholesterol['Low'], risk_score['Low'])
    rule4 = ctrl.Rule((age['Low'] | age['Medium']) & blood_pressure['Low'] & (cholesterol['Low'] | cholesterol['Medium']), risk_score['Low'])

    # Medium Risk and Mixed Cases Base Coverages
    rule5 = ctrl.Rule(age['Medium'] | blood_pressure['Medium'] | cholesterol['Medium'], risk_score['Medium'])
    rule6 = ctrl.Rule(age['High'] & blood_pressure['Low'] & cholesterol['Low'], risk_score['Medium'])
    
    # Guaranteed Fallback Catch-All
    # Ensures the calculation engine definitively never encounters an empty activation surface
    rule7 = ctrl.Rule(age['Low'] | age['Medium'] | age['High'], risk_score['Medium'])
    
    # 5. Create and Compile Control System
    risk_ctrl = ctrl.ControlSystem([rule1, rule2, rule3, rule4, rule5, rule6, rule7])
    
    return risk_ctrl

if __name__ == "__main__":
    # Test compilation
    try:
        system = get_fuzzy_system()
        print("Fuzzy logic system compiled successfully.")
        print(f"Number of rules: {len(system.rules)}")
        
        # Simple simulation test
        simulator = ctrl.ControlSystemSimulation(system)
        
        # Input standard values
        simulator.input['age'] = 75
        simulator.input['blood_pressure'] = 165
        simulator.input['cholesterol'] = 300
        
        simulator.compute()
        print(f"Test case (Age: 75, BP: 165, Chol: 300): Risk Score = {simulator.output['risk_score']:.2f}%")
        
    except Exception as e:
        print(f"Error during fuzzy system compilation: {e}")
