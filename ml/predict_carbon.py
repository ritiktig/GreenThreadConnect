import sys
import json
import os
import numpy as np
import warnings
warnings.filterwarnings("ignore")

import joblib
import pandas as pd

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'carbon_emission_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'feature_scaler.pkl')
FEATURE_NAMES_PATH = os.path.join(BASE_DIR, 'feature_names.txt')

def load_feature_names():
    if not os.path.exists(FEATURE_NAMES_PATH):
        raise FileNotFoundError("feature_names.txt not found.")
    with open(FEATURE_NAMES_PATH, 'r') as f:
        return [line.strip() for line in f.readlines()]

def get_organic_score(material):
    # This might still be needed for 'organic_material' feature in Scaler
    if not material: return 0.0
    material = str(material).lower()
    organic_list = ['wood', 'cotton', 'jute', 'cane', 'bamboo', 'wool', 'silk', 'paper', 'leather', 'clay', 'canvas', 'palm leaf']
    if any(x in material for x in organic_list):
        return 1.0
    return 0.0

def get_handmade_score(prod_type):
    # This might still be needed for 'handmade_level' feature in Scaler
    if not prod_type: return 0.5
    prod_type = str(prod_type).lower()
    if 'handmade' in prod_type:
        return 1.0
    if 'machine' in prod_type:
        return 0.0
    return 0.5

def predict():
    try:
        # Read input
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            return

        data = json.loads(input_data)
        
        # Load artifacts
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
             print(json.dumps({"error": "Model or Scaler not found"}))
             return

        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        model_feature_names = load_feature_names()

        # Scaler expects these 17 features
        scaler_feature_names = [
            'product_weight_kg', 'handmade_level', 'material_quantity_kg', 
            'recycled_material_percent', 'organic_material', 'production_time_hours', 
            'units_per_batch', 'energy_used_kwh', 'renewable_energy_percent', 
            'transport_distance_km', 'transport_load_kg', 'local_or_export', 
            'packaging_weight_kg', 'recyclable_packaging', 'material_efficiency', 
            'production_efficiency', 'total_recycled_material_kg'
        ]

        features = {}
        
        # --- 1. Inputs for SCALER (Numerical + Derived) ---
        features['material_quantity_kg'] = float(data.get('material_quantity_kg', 0))
        features['energy_used_kwh'] = float(data.get('energy_used_kwh', 0))
        features['transport_distance_km'] = float(data.get('transport_distance_km', 0))
        features['product_weight_kg'] = float(data.get('product_weight_kg', 0))
        features['recycled_material_percent'] = float(data.get('recycled_material_percent', 0))
        
        # Derived for Scaler
        features['organic_material'] = get_organic_score(data.get('primary_material', ''))
        features['handmade_level'] = get_handmade_score(data.get('production_type', ''))
        
        try:
            dist = float(features['transport_distance_km'])
            features['local_or_export'] = 1.0 if dist > 1000 else 0.0
        except:
             features['local_or_export'] = 0.0
        
        # Defaults for Scaler
        features['recyclable_packaging'] = 0.494
        features['packaging_weight_kg'] = 0.5 
        features['production_time_hours'] = 10.0
        features['units_per_batch'] = 100.0
        features['renewable_energy_percent'] = 20.0
        features['transport_load_kg'] = 1000.0
        
        if features['material_quantity_kg'] > 0:
            features['material_efficiency'] = features['product_weight_kg'] / features['material_quantity_kg']
        else:
            features['material_efficiency'] = 0.0
            
        if features['production_time_hours'] > 0:
            features['production_efficiency'] = features['units_per_batch'] / features['production_time_hours']
        else:
            features['production_efficiency'] = 0.0
            
        features['total_recycled_material_kg'] = features['material_quantity_kg'] * (features['recycled_material_percent'] / 100.0)

        # Create DataFrame for Scaler
        df_scaler = pd.DataFrame([features])
        df_scaler = df_scaler[scaler_feature_names] # Enforce order matching Scaler
        
        # Scale
        X_scaled_all = scaler.transform(df_scaler) # Shape (1, 17)
        X_scaled_14 = X_scaled_all[:, :14] # Keep first 14 if model logic omits last 3? 
        # Wait, earlier debug showed model expects 1038 feats. 
        # Scaler has 17. 
        # User snippet showed many OHE columns.
        
        # --- 2. Inputs for MODEL (One-Hot Encoding) ---
        # We need to constructing exactly the 1038 features the model expects.
        # We start with the Scaled features (mapped by name if possible, or just first N columns)
        # But wait - User snippet showed `product_weight_kg` scaled -1.9, etc.
        # It implies the FINAL model input has:
        # [Scaled Numerical Features] + [One-Hot Encoded Categorical Features] + [Product IDs?]
        
        # Let's map the scaled values to a dict first
        scaled_values = dict(zip(scaler_feature_names, X_scaled_all[0]))
        
        final_input_dict = {name: 0.0 for name in model_feature_names}
        
        # A. Fill Numerical/Scaled Values (Match by name)
        for name in scaler_feature_names:
            if name in final_input_dict:
                final_input_dict[name] = scaled_values[name]
                
        # B. Fill One-Hot Encoded 'primary_material'
        # e.g., if primary_material='wood', look for 'primary_material_wood' in model_feature_names
        p_mat = str(data.get('primary_material', '')).lower().strip()
        if p_mat:
            # Try exact match first
            col_name = f"primary_material_{p_mat}"
            if col_name in final_input_dict:
                final_input_dict[col_name] = 1.0
            else:
                # Try partial? Or just ignore if unknown
                pass

        # C. Fill One-Hot Encoded 'production_type'
        p_type = str(data.get('production_type', '')).lower().strip()
        if p_type:
            # User snippet: 'production_type_handmade'
            # Input might be 'Handmade' -> 'production_type_handmade'
            col_name = f"production_type_{p_type}"
             # handle space to underscore just in case
            col_name = col_name.replace(" ", "_")
            if col_name in final_input_dict:
                 final_input_dict[col_name] = 1.0
        
        # D. 'product_id' columns -> All 0 by default (Already set)
        
        # --- 3. Construct Final Vector ---
        # Ensure exact order as model_feature_names
        final_vector = [final_input_dict[name] for name in model_feature_names]
        X_final = np.array([final_vector])
        
        # Predict
        prediction = model.predict(X_final)
        
        print(json.dumps({"carbon_emission": prediction[0]}))

    except Exception as e:
        import traceback
        error_msg = {"error": str(e), "trace": traceback.format_exc().splitlines()[-1]}
        print(json.dumps(error_msg))

if __name__ == "__main__":
    predict()
