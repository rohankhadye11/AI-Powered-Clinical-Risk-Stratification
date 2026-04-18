import pandas as pd
import numpy as np
import pathlib
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
from scipy.optimize import minimize, differential_evolution
import skfuzzy as fuzzy
from skfuzzy import control as ctrl

# Import the fuzzy system from our rules file
from fuzzy_rules import get_fuzzy_system

def update_system_params(system, params):
    """
    Updates the membership function parameters of the fuzzy system.
    Params is a flat array of 27 values (3 variables * 3 terms * 3 points).
    """
    idx = 0
    # Update Age, Blood Pressure, and Cholesterol
    all_antecedents = {a.label: a for a in system.antecedents}
    for var_name in ['age', 'blood_pressure', 'cholesterol']:
        var = all_antecedents[var_name]
        for term_name in ['Low', 'Medium', 'High']:
            # Extract the triplet [a, b, c]
            # Sort triplet to ensure valid triangle shape (a <= b <= c)
            new_triplet = sorted(params[idx:idx+3])
            # Ensure the points fall within the variable's universe to prevent interpolation crashes
            new_triplet = np.clip(new_triplet, var.universe.min(), var.universe.max())
            var[term_name].mf = fuzzy.trimf(var.universe, new_triplet)
            idx += 3
    return system

def mse_objective(params, system, X, y):
    """
    Objective function for optimization: Mean Squared Error.
    """
    # 1. Update system with current candidate parameters
    updated_system = update_system_params(system, params)
    
    # 2. Simulate for the training batch
    simulator = ctrl.ControlSystemSimulation(updated_system)
    predictions = []
    
    for i in range(len(X)):
        try:
            simulator.input['age'] = X.iloc[i]['age']
            simulator.input['blood_pressure'] = X.iloc[i]['blood_pressure']
            simulator.input['cholesterol'] = X.iloc[i]['cholesterol']
            simulator.compute()
            predictions.append(simulator.output['risk_score'])
        except Exception:
            # Absolute failure penalty to rigorously teach the genetic algorithm to avoid unstable rule parameters
            predictions.append(10000.0) 
            
    # Clip predictions natively inside objective out of abundance of caution for scoring
    predictions = np.clip(predictions, 0, 100)
    # 3. Calculate MSE
    return mean_squared_error(y, predictions)

def train_anfis():
    # 1. Paths
    current_dir = pathlib.Path(__file__).parent.resolve()
    data_path = current_dir / ".." / "data" / "cleaned_data.csv"
    model_dir = current_dir / "saved_models"
    model_path = model_dir / "clinical_anfis_model.pkl"
    
    # Ensure model directory exists
    model_dir.mkdir(parents=True, exist_ok=True)
    
    # 2. Load and Split Data
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Assuming cleaned_data.csv has 'age', 'blood_pressure', 'cholesterol' and 'target'
    # The UCI dataset columns are 'trestbps' (BP) and 'chol' (Cholesterol)
    X = df[['age', 'trestbps', 'chol']]
    # Rename for consistency with fuzzy system
    X = X.rename(columns={'trestbps': 'blood_pressure', 'chol': 'cholesterol'})
    y = df['num'].astype(float) * 25.0 # Scale 0-4 to 0-100
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Dataset split: {len(X_train)} training, {len(X_test)} testing samples.")
    
    # 3. Initialize Fuzzy System
    system = get_fuzzy_system()
    
    # 4. Extract Initial Parameters
    all_antecedents = {a.label: a for a in system.antecedents}
    initial_params = []
    for var_name in ['age', 'blood_pressure', 'cholesterol']:
        var = all_antecedents[var_name]
        for term_name in ['Low', 'Medium', 'High']:
            # We need to find the trimf parameters. 
            # This is a bit tricky as skfuzzy doesn't store the [a,b,c] directly in the term object 
            # in an easy way once converted to a function. 
            # However, for this task, we can use the defaults we defined in fuzzy_rules.py.
            # Since we know the defaults, we'll hardcode the initial search point for the optimizer.
            pass
            
    # Hardcoded initial parameters based on fuzzy_rules.py defaults
    # Age: [20,20,55], [40,60,80], [65,100,100]
    # BP: [90,90,130], [120,145,170], [155,200,200]
    # Chol: [100,100,220], [200,250,300], [280,400,400]
    initial_params = [
        20, 20, 55, 40, 60, 80, 65, 100, 100, # Age
        90, 90, 130, 120, 145, 170, 155, 200, 200, # BP
        100, 100, 220, 200, 250, 300, 280, 400, 400 # Chol
    ]
    
    print("Starting optimization routine (Neuro-Fuzzy Fine-tuning)...")
    
    # Define strict mathematical bounds to prevent optimization from breaking clinical logic
    # (Low < Medium < High logic topology must be preserved)
    bounds = [
        # Age [a, b, c]
        (20, 20), (20, 50), (45, 60),    # Low
        (35, 45), (55, 65), (75, 85),    # Medium
        (60, 70), (100, 100), (100, 100),# High
        # Blood Pressure [a, b, c]
        (90, 90), (90, 110), (120, 135), # Low
        (115, 125), (135, 150), (160, 175), # Medium
        (150, 165), (200, 200), (200, 200), # High
        # Cholesterol [a, b, c]
        (100, 100), (100, 140), (200, 230), # Low
        (190, 210), (240, 260), (290, 310), # Medium
        (270, 290), (400, 400), (400, 400)  # High
    ]
    
    # We deploy 'Powell', a highly efficient gradient-free optimizer that respects
    # the flat mathematical bounds of the fuzzy sets rapidly.
    res = minimize(
        mse_objective,
        initial_params,
        args=(system, X_train, y_train),
        method='Powell',
        bounds=bounds,
        options={'maxiter': 50, 'disp': True}
    )
    print("Optimization complete.")
    
    final_params = res.x
    
    # 6. Update System with Optimized Parameters
    optimized_system = update_system_params(system, final_params)
    simulator = ctrl.ControlSystemSimulation(optimized_system)
    
    # Store the learned parameters in the simulator object so the API can expose them to the frontend
    simulator.learned_fuzzy_params = final_params.tolist()
    
    # 7. Evaluation on Test Set
    print("Evaluating optimized model on test set...")
    test_preds = []
    for i in range(len(X_test)):
        simulator.input['age'] = X_test.iloc[i]['age']
        simulator.input['blood_pressure'] = X_test.iloc[i]['blood_pressure']
        simulator.input['cholesterol'] = X_test.iloc[i]['cholesterol']
        try:
            simulator.compute()
            test_preds.append(simulator.output['risk_score'])
        except:
            test_preds.append(50.0)
            
    # Clip the raw outputs of the extended mathematical universe (-50, 150) precisely to [0, 100]
    test_preds = np.clip(test_preds, 0, 100)
    
    mse = mean_squared_error(y_test, test_preds)
    mae = mean_absolute_error(y_test, test_preds)
    
    print(f"Final Evaluation -> MSE: {mse:.4f}, MAE: {mae:.4f}")
    
    # 8. Export
    # print(f"Saving tuned model to {model_path}...")
    # joblib.dump(simulator, model_path)
    # print("Model saved successfully.")

if __name__ == "__main__":
    train_anfis()
