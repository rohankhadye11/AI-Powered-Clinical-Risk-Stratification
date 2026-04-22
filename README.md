# Explainable AI (XAI) Clinical Risk Stratification System

This project is a transparent, "glass-box" artificial intelligence application designed to predict cardiovascular risk from patient vitals. Unlike standard "black-box" machine learning models, this system utilizes an Adaptive Neuro-Fuzzy Inference System (ANFIS) to provide both a highly accurate risk percentage and the explicit, human-readable IF-THEN clinical rules that triggered the decision, ensuring maximum clinical trust.

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technologies Used](#3-technologies-used)
4. [Architecture](#4-architecture)
5. [Demonstration Screenshots](#5-demonstration-screenshots)
6. [Usage](#6-usage)
7. [Performance & Clinical Considerations](#7-performance--clinical-considerations)

## 1. Project Overview

The XAI Clinical Risk Stratification System bridges the gap between predictive power and explainability in healthcare. It comprises a modern frontend dashboard built with React and a high-performance backend powered by FastAPI. The core intelligence is a custom ANFIS algorithm that combines the continuous, human-like reasoning of fuzzy logic with the data-driven optimization of a neural network to assess cardiovascular risk based on Age, Blood Pressure, and Cholesterol.

## 2. Features

- **Complete Explainability (XAI):** Explicitly prints the mathematical logic and IF-THEN rules used for every prediction, eliminating the AI "black box."
- **Continuous Risk Assessment:** Uses overlapping fuzzy membership functions to evaluate vitals, removing the logical "cliff effects" found in standard Boolean medical software.
- **Real-Time Interactive Dashboard:** Clinicians can adjust patient vitals via sliders and see the risk assessment, radar charts, and rule logs update instantly.
- **Hybrid Neural Tuning:** The fuzzy rules were tuned against historical clinical data using a SciPy optimization loop (Mean Squared Error reduction) to learn objective clinical thresholds.
- **Modular Deployment:** Strict separation of the ML pipeline (Jupyter), backend API (FastAPI), and frontend UI (React) ensures scalability and maintainability.

## 3. Technologies Used

- **Frontend:**
  - React 18 (via Vite)
  - Tailwind CSS (Medical Dark Mode UI)
  - Recharts (SVG-based data visualization)
  - JavaScript / ES6+
- **Backend (API & Logic):**
  - Python 3.x
  - FastAPI (High-performance asynchronous API)
  - Uvicorn (ASGI web server)
  - Pydantic (Data validation)
- **Machine Learning & Data Science:**
  - `scikit-fuzzy` (Mamdani Fuzzy Inference Engine)
  - `scipy.optimize` (Neural tuning and gradient descent)
  - Pandas & NumPy (Data preprocessing and vectorization)

## 4. Architecture

The application follows a decoupled, modular architecture, separating the heavy machine learning logic from the real-time API routing and frontend visualization.

![Architecture](https://github.com/rohankhadye11/AI-Powered-Clinical-Risk-Stratification/blob/main/Snapshot%20of%20Project%20Architecture.png) 

**Key Components & Interactions:**

- **The Jupyter Pipeline:** The data preprocessing, fuzzy set definition, and optimization loop occurred here. The fully tuned model was then serialized and exported as `anfis_model.pkl`.
- **Backend API:** The FastAPI server loads the `.pkl` file into memory on startup. It exposes a `/predict` endpoint that receives patient JSON payloads, validates them, runs them through the fuzzy engine, and returns both a "crisp" risk score and the triggered rule log.
- **Frontend UI:** A React-based interface utilizing debounced state management to send API requests without overwhelming the server. Complex JSON responses are mapped into intuitive Recharts visualizations (Gauges, Scatter Plots, and Line Charts).

## 5. Demonstration Screenshots

This section showcases the UI/UX and the core explainability features of the ClinicalRisk AI web application.

**1. Project Landing Page**
![Landing Page Hero](https://github.com/rohankhadye11/AI-Powered-Clinical-Risk-Stratification/blob/main/Snapshot%20of%20Landing%20Page%201.jpeg)
![Landing Page Features](https://github.com/rohankhadye11/AI-Powered-Clinical-Risk-Stratification/blob/main/Snapshot%20of%20Landing%20Page%202.jpeg)
* **Description:** A modern, dark-themed landing page that introduces the platform's core value proposition: combining neural network predictive power with fuzzy logic explainability. It clearly outlines the three pillars of the system: Input Vitals, Neuro-Fuzzy Processing, and Explainable Results.

**2. The "Glass-Box" Clinical Dashboard**
![Main Dashboard](https://github.com/rohankhadye11/AI-Powered-Clinical-Risk-Stratification/blob/main/Snapshot%20of%20Dashboard%201.jpeg)
* **Description:** The primary interface for clinicians. It features an interactive **Control Panel** to input patient vitals, a dynamic **Assessment Score Gauge** displaying the finalized "crisp" risk factor (e.g., 49.8% Medium Risk), and a **Clinical Profile Radar Chart** that visually maps the patient's vitals against established axes to spot anomalies at a glance.

**3. Continuous Fuzzy Logic Visualization**
![Membership Logic - Cholesterol](https://github.com/rohankhadye11/AI-Powered-Clinical-Risk-Stratification/blob/main/Snapshot%20of%20Membership%20function.jpeg)
* **Description:** This interactive chart exposes the underlying math of the fuzzy inference system. When a clinician inputs a specific vital (e.g., a Cholesterol level of 205 mg/dL), the UI visually demonstrates how that crisp value intersects multiple fuzzy sets simultaneously (e.g., 12.5% Low, 10.0% Medium), eliminating the rigid "cliff effects" of standard Boolean medical rules.

**4. Explainability Log & Population Context**
![Rule Inference and Context](https://github.com/rohankhadye11/AI-Powered-Clinical-Risk-Stratification/blob/main/Snapshot%20of%20Rule%20Inference.jpeg)
* **Description:** The centerpiece of our Explainable AI (XAI) approach. 
  * **Population Context:** A scatter plot that drops the current patient (represented by a diamond) into a cluster of historical patient data, providing immediate macro-level context.
  * **Inference Log:** Explicitly prints out the exact array of IF-THEN clinical rules fired by the ANFIS engine during that specific prediction, ensuring complete algorithmic transparency and professional accountability.

## 6. Usage

1. **Start the Backend:** Navigate to the `backend` directory, activate your Python virtual environment, install `requirements.txt`, and run `uvicorn main:app --reload`.
2. **Start the Frontend:** Open a new terminal, navigate to the `frontend` directory, run `npm install`, and start the development server with `npm run dev`.
3. **Input Vitals:** On the main dashboard, use the sliders to adjust the patient's Age, Blood Pressure, and Cholesterol.
4. **Review Risk Score:** Instantly view the updated Crisp Risk Percentage on the central gauge.
5. **Audit the Logic:** Scroll to the bottom Inference Log to read the specific clinical rules the AI used to calculate the current score.

## 7. Performance & Clinical Considerations

This architecture is optimized for clinical deployment and trustworthiness.

- **Compute Efficiency:** Unlike Large Language Models (LLMs) or deep convolutional networks, this ANFIS model requires minimal compute power for inference. It evaluates mathematical intersections in milliseconds, making it highly suitable for lightweight clinical servers.
- **No Cold Starts:** The `.pkl` model is loaded into memory when the FastAPI application initializes, ensuring zero latency when a clinician requests a real-time risk calculation.
- **Ethical AI Alignment:** By guaranteeing 100% logic transparency, this system aligns with emerging healthcare regulatory frameworks which prioritize explainability, interpretability, and patient safety over black-box accuracy.
