import custom_price_model

sample_data = {
    'product_name': 'Madhubani Painting',
    'material': 'Marble',
    'category': 'Footwear',
    'region': 'Delhi',
    'size_cm': '95x10x10',
    'weight_g': 3531,
    'description_keywords': 'handcrafted, eco-friendly, cultural'
}

print("Testing prediction with sample data:")
print(sample_data)
try:
    price = custom_price_model.predict(sample_data)
    print(f"Predicted Price: {price}")
except Exception as e:
    print(f"Prediction failed: {e}")
