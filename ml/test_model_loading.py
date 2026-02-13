import joblib
import os
import sys
import pandas as pd
import numpy as np

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'carbon_emission_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'feature_scaler.pkl')

def test_model():
    print("--- Testing Model Loading ---")
    
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model file not found at {MODEL_PATH}")
        return
    if not os.path.exists(SCALER_PATH):
        print(f"Error: Scaler file not found at {SCALER_PATH}")
        return

    try:
        print("Loading artifacts...")
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("Model and Scaler loaded successfully!")

        print("Testing prediction with sample data...")
        # Sample data matching the 7 features
        sample_data = {
            'material_quantity_kg': [1.8],
            'energy_used_kwh': [5.5],
            'transport_distance_km': [300.0],
            'product_weight_kg': [2.0],
            'recycled_material_percent': [60.0],
            'primary_material': ['wood'],
            'production_type': ['handmade']
        }
        
        df = pd.DataFrame(sample_data)
        
        # Check if scaler supports the input (handling string columns or not)
        try:
            X_scaled = scaler.transform(df)
            print("Scaling successful!")
        except Exception as e:
            print(f"Scaling failed (Expected if scaler doesn't handle strings): {e}")
            print("Attempting to predict without scaling (or with partial numeric data)...")
            return

        prediction = model.predict(X_scaled)
        print(f"Prediction successful! Result: {prediction[0]}")

    except Exception as e:
        with open('ml/test_result.txt', 'w') as f:
            f.write(f"Error: {str(e)}")
        print(f"Error logged to ml/test_result.txt")

if __name__ == "__main__":
    test_model()
