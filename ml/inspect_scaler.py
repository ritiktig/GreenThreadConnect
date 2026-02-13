import joblib
import pandas as pd
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCALER_PATH = os.path.join(BASE_DIR, 'feature_scaler.pkl')

try:
    scaler = joblib.load(SCALER_PATH)
    print(f"Scaler type: {type(scaler)}")
    
    if hasattr(scaler, 'n_features_in_'):
        print(f"Scaler expects {scaler.n_features_in_} features.")
    
    if hasattr(scaler, 'feature_names_in_'):
        print(f"Scaler feature names: {list(scaler.feature_names_in_[:10])} ...")
        # Save scaler feature names to a file
        with open(os.path.join(BASE_DIR, 'scaler_feature_names.txt'), 'w') as f:
            for name in scaler.feature_names_in_:
                f.write(name + '\n')
        print("Scaler feature names saved to scaler_feature_names.txt")
    else:
        print("Scaler does NOT have feature_names_in_ attribute.")

except Exception as e:
    print(f"Error: {e}")
