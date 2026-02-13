import joblib
import pandas as pd
import numpy as np

try:
    model = joblib.load('ml/carbon_emission_model.pkl')
    scaler = joblib.load('ml/feature_scaler.pkl')

    print("Model and Scaler loaded.")
    
    # Try finding feature names
    feature_names = None
    if hasattr(model, 'feature_names_in_'):
        feature_names = model.feature_names_in_
        print(f"Model Feature Names ({len(feature_names)}): {list(feature_names)}")
    elif hasattr(scaler, 'feature_names_in_'):
        feature_names = scaler.feature_names_in_
        print(f"Scaler Feature Names ({len(feature_names)}): {list(feature_names)}")
    elif hasattr(model, 'n_features_in_'):
        print(f"Model expects {model.n_features_in_} features.")
        if hasattr(scaler, 'n_features_in_'):
            print(f"Scaler expects {scaler.n_features_in_} features.")

    # Save to file if found
    if feature_names is not None:
        with open('ml/feature_names.txt', 'w') as f:
            for name in feature_names:
                f.write(f"{name}\n")
        print("Feature names saved to ml/feature_names.txt")
        
except Exception as e:
    print(f"Error inspecting: {e}")
