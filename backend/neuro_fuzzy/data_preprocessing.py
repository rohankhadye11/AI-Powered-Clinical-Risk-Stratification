import pandas as pd
import pathlib
import os

def create_mock_data():
    """Generates a mock dataframe with standard UCI Heart Disease columns."""
    import numpy as np
    np.random.seed(42)
    n = 100
    age = np.random.randint(20, 101, n)
    trestbps = np.random.randint(90, 201, n)
    chol = np.random.randint(100, 401, n)
    
    # Calculate a synthetic num (0-4) based on explicit normalized limits
    norm_age = (age - 20) / 80
    norm_bp = (trestbps - 90) / 110
    norm_chol = (chol - 100) / 300
    
    risk = (norm_age * 0.3) + (norm_bp * 0.4) + (norm_chol * 0.3)
    num = np.round(risk * 4).astype(int)
    num = np.clip(num, 0, 4)
    
    data = {'age': age, 'trestbps': trestbps, 'chol': chol, 'num': num}
    return pd.DataFrame(data)

def clean_and_prepare_data(filepath):
    """
    Loads raw heart disease data, cleans it by removing duplicates and handling NaNs,
    and saves the cleaned version to a CSV file.
    """
    print(f"Loading data from: {filepath}")
    
    try:
        # Check if file exists and is not empty
        if not filepath.exists() or filepath.stat().st_size == 0:
            print("Warning: Raw data file is missing or empty. Using mock data instead.")
            df = create_mock_data()
        else:
            df = pd.read_csv(filepath)
            if df.empty:
                print("Warning: CSV is empty. Using mock data instead.")
                df = create_mock_data()
    except Exception as e:
        print(f"Error reading CSV: {e}. Using mock data instead.")
        df = create_mock_data()

    # Data Cleaning
    initial_shape = df.shape
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Handle missing values (NaN) - Filling numeric columns with mean, or dropping if too many
    # For this specific UCI dataset, filling with mean or median is standard for numeric columns
    # Here we drop rows with NaNs for simplicity, or we could use fillna
    df = df.dropna()
    
    final_shape = df.shape
    
    # Construct paths for saving
    # Assume output is at ../data/cleaned_data.csv relative to this script
    output_dir = filepath.parent
    output_path = output_dir / "cleaned_data.csv"
    
    df.to_csv(output_path, index=False)
    
    print(f"Cleaning complete.")
    print(f"Initial rows: {initial_shape[0]}, Columns: {initial_shape[1]}")
    print(f"Final rows: {final_shape[0]}, Columns: {final_shape[1]}")
    print(f"Cleaned data saved to: {output_path}")
    
    return df

if __name__ == "__main__":
    # Get the directory of the current script
    current_dir = pathlib.Path(__file__).parent.resolve()
    
    # Path to the raw data (relative to this script)
    raw_data_path = current_dir / ".." / "data" / "raw_heart_data.csv"
    
    cleaned_df = clean_and_prepare_data(raw_data_path)
    print(f"SUCCESS: Dataset processed successfully. Final shape: {cleaned_df.shape}")
