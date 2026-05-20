from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
# import xgboost as xgb # Uncomment when installed
# from prophet import Prophet # Uncomment when installed



app = Flask(__name__)
CORS(app)



@app.route('/')
def home():
    return "Green Thread Connect ML Service is Running!"

import predict_carbon

@app.route('/predict-carbon', methods=['POST'])
def predict_carbon_route():
    data = request.json
    result = predict_carbon.predict(data)
    # Check if there is an error code
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)
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
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)
