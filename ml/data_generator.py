import pandas as pd
import random
import os

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

categories = ['Textiles', 'Pottery', 'Woodwork', 'Jewelry', 'Home Decor']
materials = ['Cotton', 'Silk', 'Bamboo', 'Jute', 'Clay', 'Wood', 'Silver', 'Brass']
regions = ['India', 'Vietnam', 'Peru', 'Kenya', 'Mexico']

def generate_product(id):
    category = random.choice(categories)
    material = random.choice(materials)
    region = random.choice(regions)
    
    # Base price logic for some realism
    base_price = 20
    if material in ['Silk', 'Silver']: base_price += 50
    if material in ['Wood', 'Brass']: base_price += 30
    if region == 'Peru': base_price += 10 # Shipping/Import factor mock
    
    price = base_price + random.uniform(-10, 20)
    
    return {
        'Product_ID': id,
        'Name': f"{material} {category} Item {id}",
        'Category': category,
        'Material': material,
        'Region': region,
        'Weight_kg': round(random.uniform(0.1, 5.0), 2),
        'Sustainability_Rating': random.randint(3, 5),
        'Price': round(price, 2)
    }

# Generate 200 products
data = [generate_product(i) for i in range(1, 201)]

df = pd.DataFrame(data)
df.to_csv('data/products.csv', index=False)
print(f"Generated {len(df)} products in data/products.csv")
