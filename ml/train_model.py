import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'artisan_dataset_10000_final.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# Create models directory if it doesn't exist
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def train():
    print("Loading dataset...")
    if not os.path.exists(DATA_PATH):
        print(f"Error: Dataset not found at {DATA_PATH}")
        return

    df = pd.read_csv(DATA_PATH)
    
    # Preprocessing
    print("Preprocessing data...")
    
    # 1. Handle Size(cm) -> Split into L, W, H
    # Assuming format is "LxWxH"
    def parse_size(size_str):
        try:
            parts = size_str.lower().split('x')
            if len(parts) == 3:
                return float(parts[0]), float(parts[1]), float(parts[2])
            return 0.0, 0.0, 0.0
        except:
            return 0.0, 0.0, 0.0

    df[['Size_L', 'Size_W', 'Size_H']] = df['Size(cm)'].apply(lambda x: pd.Series(parse_size(str(x))))
    
    # 2. Drop unused columns
    # Description_Keywords and Image_URL might not be useful for a simple regression model without NLP/CV
    drop_cols = ['Size(cm)', 'Description_Keywords', 'Image_URL']
    df = df.drop(columns=[c for c in drop_cols if c in df.columns])
    
    # 3. Encode Categorical Variables
    categorical_cols = ['Product_Name', 'Material', 'Category', 'Region']
    encoders = {}
    
    for col in categorical_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le
            
    # 4. Handle Target
    target_col = 'Price(INR)'
    if target_col not in df.columns:
        print(f"Error: Target column '{target_col}' not found.")
        return
        
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    # Save feature names
    feature_names = X.columns.tolist()
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Model
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    print(f"Model Performance:")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    
    # Save Artifacts
    print("Saving model and artifacts...")
    joblib.dump(model, os.path.join(MODEL_DIR, 'price_prediction_model.joblib'))
    joblib.dump(encoders, os.path.join(MODEL_DIR, 'label_encoders.joblib'))
    joblib.dump(feature_names, os.path.join(MODEL_DIR, 'feature_names.joblib'))
    
    print("Training complete!")

if __name__ == "__main__":
    train()
