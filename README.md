# GreenThreadConnect

GreenThreadConnect is a sustainable artisan marketplace that connects buyers with handcrafted products from Indian artisans while helping sellers optimize pricing, discover sustainable materials, and understand their product impact. The platform combines a React-based storefront, an Express API backend, an AI-powered assistant, and a Python ML service for carbon prediction.

## Overview

GreenThreadConnect is designed for:

- Buyers looking for authentic, eco-conscious handmade products
- Sellers managing product listings, pricing, and sales analytics
- Communities focused on sustainability, heritage craftsmanship, and transparent sourcing

The project is structured as a full-stack application with separate frontend, backend, and ML components.

## Key Features

- Buyer marketplace with product browsing and cart/checkout flow
- Seller dashboard for managing inventory and analytics
- AI chat assistant for product discovery and navigation
- Price prediction and carbon footprint analysis
- Eco-material recommendations for sustainable product design
- MongoDB-backed data model for users, products, orders, and analytics
- Vercel-ready deployment configuration

## Tech Stack

### Frontend
- React
- React Router
- Axios
- Recharts
- CSS-based responsive UI

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT auth
- Helmet, CORS, rate limiting, compression

### AI and ML
- Google Gemini API
- Python Flask service
- Pandas and ML model utilities for carbon prediction

### Infrastructure
- Vercel deployment config for app/server
- SQLite config for CDS backend support
- MongoDB Atlas for database connectivity

## Repository Structure

```text
GreenThreadConnect/
├── app/                     # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── server/                  # Express API backend
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   ├── package.json
│   └── vercel.json
├── ml/                      # Python ML service
│   ├── app.py
│   ├── predict_carbon.py
│   ├── requirements.txt
│   └── ...
├── db.sqlite                # SQLite database file
├── package.json            # Root project config
├── requirements.txt        # Root Python dependency file
├── vercel.json             # Root Vercel config
├── .gitignore
├── README.md
└── package-lock.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Python 3.10+
- MongoDB Atlas connection or local MongoDB instance
- Google Gemini API key

### 1. Install frontend dependencies

```bash
cd app
npm install
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install ML dependencies

```bash
cd ml
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the `server/` directory with the following values:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

The frontend app in `app/` is configured to proxy API calls to the local backend at `http://localhost:5000`.

### 5. Start the applications

Start the backend:

```bash
cd server
npm start
```

Start the frontend:

```bash
cd app
npm start
```

Start the ML service:

```bash
cd ml
python app.py
```

## Application Flow

- Users can sign up or log in as buyers or sellers.
- Sellers can add, update, and manage handmade products.
- Buyers can browse products, add items to a cart, and proceed to checkout.
- The AI assistant helps with product discovery, navigation, and onboarding.
- Sellers can use AI features for image-based product generation suggestions and price prediction.
- The ML service provides carbon impact analysis and recommendations for more eco-friendly materials.

## Key API Routes

The backend exposes REST endpoints under `/api` for:

- authentication and users
- products and seller inventory
- orders and buyer transactions
- analytics
- AI-powered assistance
- price prediction and sustainability workflows
- payments

## Deployment Notes

This repository includes Vercel configuration files and is suitable for deployment across separate services:

- Frontend: Vercel app deployment
- Backend: Vercel server deployment or Node hosting service
- ML service: Python hosting platform or a separate container deployment

## Contributing

Contributions are welcome. If you want to improve the product, add new features, or improve sustainability analytics, feel free to open a pull request.

## License

This project currently does not declare an explicit license in the repository metadata.

## Project Summary

GreenThreadConnect aims to combine commerce, culture, and sustainability in one marketplace experience. It preserves artisan heritage while giving sellers modern tools for pricing, insights, and digital growth.
