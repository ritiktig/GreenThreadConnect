import os
import joblib
import pandas as pd
import numpy as np

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'price_prediction_model.joblib')
ENCODERS_PATH = os.path.join(MODEL_DIR, 'label_encoders.joblib')
FEATURE_NAMES_PATH = os.path.join(MODEL_DIR, 'feature_names.joblib')

# Load artifacts globally to avoid reloading on every request
try:
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODERS_PATH)
    feature_names = joblib.load(FEATURE_NAMES_PATH)
    print("Model and artifacts loaded successfully.")
except Exception as e:
    print(f"Error loading model artifacts: {e}")
    model = None
    encoders = None
    feature_names = None

def parse_size(size_str):
    try:
        if not size_str:
            return 0.0, 0.0, 0.0
        parts = str(size_str).lower().split('x')
        if len(parts) == 3:
            return float(parts[0]), float(parts[1]), float(parts[2])
        return 0.0, 0.0, 0.0
    except:
        return 0.0, 0.0, 0.0

def predict(data):
    """
    Predicts the price based on the input data.
    """
    if model is None:
        print("Model is not loaded. Returning mock price.")
        return 100.0

    try:
        # Prepare input dictionary
        input_data = {}
        
        # 1. Handle Numerical Features
        # Weight
        try:
            input_data['Weight(g)'] = float(data.get('weight_g', 0))
        except:
            input_data['Weight(g)'] = 0.0
            
        # Size
        l, w, h = parse_size(data.get('size_cm', ''))
        input_data['Size_L'] = l
        input_data['Size_W'] = w
        input_data['Size_H'] = h
        
        # 2. Handle Categorical Features
        # Map input keys to training column names
        cat_map = {
            'product_name': 'Product_Name',
            'material': 'Material',
            'category': 'Category',
            'region': 'Region'
        }
        
        for input_key, col_name in cat_map.items():
            val = data.get(input_key, '')
            le = encoders.get(col_name)
            if le:
                try:
                    # Try to transform
                    input_data[col_name] = le.transform([str(val)])[0]
                except ValueError:
                    # Handle unseen label - assign to first class or a default
                    # print(f"Warning: Unseen label '{val}' for column '{col_name}'. Using default.")
                    input_data[col_name] = 0 # Default to 0
            else:
                input_data[col_name] = 0

        # 3. Create DataFrame with correct column order
        df_input = pd.DataFrame([input_data])
        
        # Ensure all features are present (fill missing with 0)
        for col in feature_names:
            if col not in df_input.columns:
                df_input[col] = 0
                
        # Reorder columns to match training
        df_input = df_input[feature_names]
        
        # 4. Predict
        prediction = model.predict(df_input)[0]
        
        return float(prediction)
        
    except Exception as e:
        print(f"Error during prediction: {e}")
        return 100.0

