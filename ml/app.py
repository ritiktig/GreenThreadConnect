from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
# import xgboost as xgb # Uncomment when installed
# from prophet import Prophet # Uncomment when installed

# Try to import user's custom model
try:
    import custom_price_model
    print("Custom model loaded successfully.")
except ImportError:
    print("Custom model not found. Using mock logic.")
    custom_price_model = None

app = Flask(__name__)
CORS(app)

# Load Dummy Data (Mocking Model Training)
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'products.csv')

def train_mock_model():
    if os.path.exists(DATA_PATH):
        df = pd.read_csv(DATA_PATH)
        print(f"Loaded {len(df)} products for training.")
    else:
        print("Data file not found. Please run data_generator.py")

train_mock_model()

@app.route('/')
def home():
    return "Green Thread Connect ML Service is Running!"

@app.route('/predict-price', methods=['POST'])
def predict_price():
    data = request.json
    
    # Extract fields
    product_name = data.get('product_name')
    material = data.get('material')
    category = data.get('category')
    region = data.get('region')
    size_cm = data.get('size_cm')
    weight_g = data.get('weight_g')
    description_keywords = data.get('description_keywords')
    
    if custom_price_model:
        try:
            # Pass the entire data dict to the custom model
            predicted_price = custom_price_model.predict(data)
            return jsonify({
                'predicted_price': round(float(predicted_price), 2),
                'currency': 'INR'
            })
        except Exception as e:
            print(f"Error in custom model: {e}")
            return jsonify({'error': str(e)}), 500
            
    # Fallback Mock Logic
    base_price = 30
    if material and 'Silk' in material: base_price += 40
    if material and 'Bamboo' in material: base_price += 15
    if region and 'India' in region: base_price -= 5
    
    predicted_price = base_price * 80 # Convert approx USD to INR for fallback
    
    return jsonify({
        'predicted_price': round(predicted_price, 2),
        'currency': 'INR'
    })

@app.route('/recommend', methods=['POST'])
def recommend():
    # Mock Recommendation
    return jsonify({
        'recommendations': [
            {'id': 101, 'name': 'Bamboo Basket', 'score': 0.95},
            {'id': 204, 'name': 'Jute Bag', 'score': 0.88}
        ]
    })

@app.route('/trends', methods=['GET'])
def trends():
    # Mock Trend Forecast
    return jsonify({
        'category': 'Textiles',
        'forecast': [120, 135, 150, 140, 160]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
