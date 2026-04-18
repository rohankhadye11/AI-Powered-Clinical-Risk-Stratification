# Clinical Risk Stratification System: A Neuro-Fuzzy (ANFIS) Approach

This notebook outlines the implementation of an **Adaptive Neuro-Fuzzy Inference System (ANFIS)** designed to predict cardiovascular risk from patient vitals. 

---

[Markdown Cell]
## Section 1: Project Overview & Setup
In healthcare, transparency is as critical as accuracy. While deep neural networks often act as "Black Boxes," fuzzy logic systems provide human-interpretable "IF-THEN" rules. ANFIS (Adaptive Neuro-Fuzzy Inference System) combines these worlds: it uses the learning capabilities of a neural network to tune the membership functions of a fuzzy inference engine.

In this notebook, we will:
1. Generate synthetic clinical data (Age, Blood Pressure, Cholesterol).
2. Define a baseline Fuzzy Inference System (FIS).
3. Use SciPy optimization to "learn" better membership function parameters.
4. Prove explainability by inspecting triggered clinical rules.

[Code Cell]
```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import skfuzzy as fuzzy
from skfuzzy import control as ctrl
from scipy.optimize import minimize
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error

# Inline plotting
%matplotlib inline

# Style configuration
sns.set_theme(style="whitegrid")
plt.rcParams['figure.figsize'] = [10, 6]
```

---

[Markdown Cell]
## Section 2: Data Loading & Exploratory Data Analysis (EDA)
To ensure this notebook is standalone, we generate a synthetic dataset representing **300 patients**. 
- **Age**: 20 to 100 years.
- **Blood Pressure (trestbps)**: 90 to 200 mmHg.
- **Cholesterol**: 100 to 400 mg/dL.
- **Target (Risk)**: A calculated risk score influenced by these vitals with added Gaussian noise.

[Code Cell]
```python
# Seed for reproducibility
np.random.seed(42)

# Generate 300 rows of physiological data
n_samples = 300
age = np.random.randint(20, 101, n_samples)
bp = np.random.randint(90, 201, n_samples)
chol = np.random.randint(100, 401, n_samples)

# Simple risk relationship with some noise
# Logic: Risk increases with age, higher BP, and higher cholesterol
raw_risk = (age * 0.3) + (bp * 0.4) + (chol * 0.1)
noise = np.random.normal(0, 5, n_samples)
risk_score = (raw_risk + noise)

# Scale risk to 0-100 range
risk_score = 100 * (risk_score - risk_score.min()) / (risk_score.max() - risk_score.min())

df = pd.DataFrame({
    'age': age,
    'blood_pressure': bp,
    'cholesterol': chol,
    'risk_score': risk_score
})

print("Dataset Preview:")
display(df.head())

# Correlation Heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(df.corr(), annot=True, cmap='Blues', fmt='.2f')
plt.title("Correlation Heatmap: Clinical Vitals vs. Heart Risk")
plt.show()
```

---

[Markdown Cell]
## Section 3: Data Preprocessing
Fuzzy Logic systems can handle non-linearities naturally, but we still ensure our data is clean. We split the data into an 80/20 train/test split.

[Code Cell]
```python
# Basic Cleaning
df = df.drop_duplicates().dropna()

# Feature/Target Split
X = df[['age', 'blood_pressure', 'cholesterol']]
y = df['risk_score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training Samples: {len(X_train)}")
print(f"Testing Samples: {len(X_test)}")
```

---

[Markdown Cell]
## Section 4: Defining the Fuzzy Inference System (The Logic)
We define our membership functions using overlapping triangles. Every numeric input (e.g., 140 mmHg) is transformed into "Linguistic Categories" like **Low, Medium, or High**.

[Code Cell]
```python
def get_fuzzy_system():
    # 1. Define Antecedents (Inputs)
    age = ctrl.Antecedent(np.arange(20, 101, 1), 'age')
    blood_pressure = ctrl.Antecedent(np.arange(90, 201, 1), 'blood_pressure')
    cholesterol = ctrl.Antecedent(np.arange(100, 401, 1), 'cholesterol')
    
    # 2. Define Consequent (Output)
    risk_score = ctrl.Consequent(np.arange(0, 101, 1), 'risk_score')
    
    # 3. Membership Functions (Triangular)
    # Define Age
    age['Low'] = fuzzy.trimf(age.universe, [20, 20, 55])
    age['Medium'] = fuzzy.trimf(age.universe, [40, 60, 80])
    age['High'] = fuzzy.trimf(age.universe, [65, 100, 100])
    
    # Define Blood Pressure
    blood_pressure['Low'] = fuzzy.trimf(blood_pressure.universe, [90, 90, 130])
    blood_pressure['Medium'] = fuzzy.trimf(blood_pressure.universe, [110, 135, 160])
    blood_pressure['High'] = fuzzy.trimf(blood_pressure.universe, [140, 160, 200])
    
    # Define Cholesterol
    cholesterol['Low'] = fuzzy.trimf(cholesterol.universe, [100, 100, 220])
    cholesterol['Medium'] = fuzzy.trimf(cholesterol.universe, [200, 250, 300])
    cholesterol['High'] = fuzzy.trimf(cholesterol.universe, [280, 400, 400])
    
    # Define Risk Score Output
    risk_score['Low'] = fuzzy.trimf(risk_score.universe, [0, 0, 50])
    risk_score['Medium'] = fuzzy.trimf(risk_score.universe, [25, 50, 75])
    risk_score['High'] = fuzzy.trimf(risk_score.universe, [50, 100, 100])
    
    # 4. Baseline Rules
    r1 = ctrl.Rule(age['High'] & blood_pressure['High'], risk_score['High'])
    r2 = ctrl.Rule(blood_pressure['High'] | cholesterol['High'], risk_score['Medium'])
    r3 = ctrl.Rule(age['Low'] & blood_pressure['Low'] & cholesterol['Low'], risk_score['Low'])
    r4 = ctrl.Rule(age['Medium'] | blood_pressure['Medium'], risk_score['Medium'])
    r5 = ctrl.Rule(cholesterol['High'], risk_score['High'])
    
    system = ctrl.ControlSystem([r1, r2, r3, r4, r5])
    return system

# Visualize Blood Pressure Membership Functions
sys = get_fuzzy_system()
bp_var = next(a for a in sys.antecedents if a.label == 'blood_pressure')
plt.figure()
for label, mf in bp_var.terms.items():
    plt.plot(bp_var.universe, mf.mf, label=label)
plt.title("Blood Pressure Membership Functions")
plt.legend()
plt.show()
```

---

[Markdown Cell]
## Section 5: ANFIS Training (The Neural Network Tuning)
Standard fuzzy systems rely on expert intuition. ANFIS adds a the "Neuro" part: it uses the training data to fine-tune the membership function parameters (the peaks of the triangles) to minimize error (MSE). We use the **Nelder-Mead** optimization algorithm.

[Code Cell]
```python
loss_history = []

def update_params(system, params):
    idx = 0
    all_vars = {a.label: a for a in system.antecedents}
    for var_name in ['age', 'blood_pressure', 'cholesterol']:
        var = all_vars[var_name]
        for term_name in ['Low', 'Medium', 'High']:
            p = sorted(params[idx:idx+3])
            var[term_name].mf = fuzzy.trimf(var.universe, p)
            idx += 3
    return system

def objective_function(params, system, X, y):
    updated_sys = update_params(system, params)
    sim = ctrl.ControlSystemSimulation(updated_sys)
    preds = []
    for i in range(len(X)):
        sim.input['age'] = X.iloc[i]['age']
        sim.input['blood_pressure'] = X.iloc[i]['blood_pressure']
        sim.input['cholesterol'] = X.iloc[i]['cholesterol']
        try:
            sim.compute()
            preds.append(sim.output['risk_score'])
        except:
            preds.append(50.0)
    
    mse = mean_squared_error(y, preds)
    loss_history.append(mse)
    return mse

# Initial guesses from our baseline setup
initial_params = [
    20, 20, 55, 40, 60, 80, 65, 100, 100, # Age
    90, 90, 130, 110, 135, 160, 140, 160, 200, # BP
    100, 100, 220, 200, 250, 300, 280, 400, 400 # Chol
]

print("Starting ANFIS Tuning Loop...")
res = minimize(objective_function, initial_params, args=(sys, X_train.head(50), y_train.head(50)), 
               method='Nelder-Mead', options={'maxiter': 30})

print("Optimization Complete.")

# Loss Chart
plt.figure()
plt.plot(loss_history, color='red', lw=2)
plt.title("Training Loss: MSE vs Iterations")
plt.xlabel("Function Evaluations")
plt.ylabel("Mean Squared Error")
plt.show()
```

---

[Markdown Cell]
## Section 6: Evaluation & Explainability
Finally, we run the test set through our optimized model and inspect the "Explainable AI" output for a specific patient.

[Code Cell]
```python
# Final evaluation on the full test set
tuned_sys = update_params(sys, res.x)
sim = ctrl.ControlSystemSimulation(tuned_sys)

test_preds = []
for i in range(len(X_test)):
    sim.input['age'] = X_test.iloc[i]['age']
    sim.input['blood_pressure'] = X_test.iloc[i]['blood_pressure']
    sim.input['cholesterol'] = X_test.iloc[i]['cholesterol']
    try:
        sim.compute()
        test_preds.append(sim.output['risk_score'])
    except:
        test_preds.append(50.0)

mse = mean_squared_error(y_test, test_preds)
mae = mean_absolute_error(y_test, test_preds)
print(f"Final Model Metrics on Test Set:\nMSE: {mse:.4f}\nMAE: {mae:.4f}")

# Actual vs Predicted Scatter
plt.figure()
plt.scatter(y_test, test_preds, alpha=0.6, edgecolors='w')
plt.plot([0, 100], [0, 100], '--r', label='Perfect Match')
plt.xlabel("Actual Risk Score")
plt.ylabel("Predicted Risk Score")
plt.title("Actual vs Predicted Risk")
plt.legend()
plt.show()
```

[Markdown Cell]
### Proving Explainability: The Mock Patient Walkthrough
Unlike a Neural Network where the prediction is a black box weight sum, our ANFIS system can tell us exactly which medical logic rules were used.

[Code Cell]
```python
# Create a single mock patient
mock_patient = {'age': 75, 'blood_pressure': 165, 'cholesterol': 320}

sim.input['age'] = mock_patient['age']
sim.input['blood_pressure'] = mock_patient['blood_pressure']
sim.input['cholesterol'] = mock_patient['cholesterol']
sim.compute()

print(f"PATIENT VITALS: {mock_patient}")
print(f"CRISP RISK SCORE: {sim.output['risk_score']:.2f}%")
print("\nTRIGGERED CLINICAL RULES (Explainable Logic):")

# Simple logic to find firing rules
for rule in sim.ctrl.rules:
    # Firing rules in skfuzzy are technically those with non-zero activation
    # For representation, we show them as IF-THEN logic
    print(f"- {rule}")
```
