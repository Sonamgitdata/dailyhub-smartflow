import os
from flask import Flask, jsonify, request

app = Flask(__name__)

# ---------------- AUTH ---------------- #
# Shared-secret API key check. Set API_KEY in the environment to enable.
# When unset (e.g. local dev), auth is skipped so the demo keeps working.
API_KEY = os.environ.get("API_KEY")
# Endpoints that never require auth (health check + safe public reads).
_PUBLIC_PATHS = {"/", "/food", "/transport", "/food/compare"}


@app.before_request
def require_api_key():
    if not API_KEY:
        return  # auth disabled in local/demo mode
    if request.method == "OPTIONS":
        return  # let CORS preflight through
    if request.path in _PUBLIC_PATHS:
        return
    if request.headers.get("X-Api-Key") != API_KEY:
        return jsonify({"error": "Unauthorized"}), 401

# ---------------- MOCK DATA ---------------- #

food_data = [
    {"id": 1, "name": "KFC", "price": 3, "time": 20, "rating": 4.2},
    {"id": 2, "name": "McDonald's", "price": 4, "time": 15, "rating": 4.5},
    {"id": 3, "name": "Burger King", "price": 3.5, "time": 18, "rating": 4.1},
    {"id": 4, "name": "Subway", "price": 2.5, "time": 25, "rating": 4.0}
]

transport_data = [
    {"id": 1, "name": "Uber", "price": 5, "time": 10, "rating": 4.5},
    {"id": 2, "name": "Careem", "price": 4, "time": 12, "rating": 4.3}
]

# ---------------- HELPER FUNCTION ---------------- #

def calculate_score(item, preference):
    w_rating, w_price, w_time = 0.5, 0.3, 0.2
    if preference == "cheap":
        w_rating, w_price, w_time = 0.3, 0.5, 0.2
    elif preference == "fast":
        w_rating, w_price, w_time = 0.3, 0.2, 0.5
    elif preference == "best":
        w_rating, w_price, w_time = 0.6, 0.2, 0.2
    return (
        w_rating * item["rating"]
        - w_price * item["price"]
        - w_time * item["time"]
    )


def recommend_ai(options, preference):
    return max(options, key=lambda x: calculate_score(x, preference))


# Backwards-compatible alias
def recommend(options, preference):
    return recommend_ai(options, preference)

# ---------------- ROUTES ---------------- #

@app.route('/')
def home():
    return "DailyHub Mock API Running 🚀"

# 🍔 Get all food options
@app.route('/food', methods=['GET'])
def get_food():
    return jsonify(food_data)

# 🚕 Get all transport options
@app.route('/transport', methods=['GET'])
def get_transport():
    return jsonify(transport_data)

# 🔍 Compare food options
@app.route('/food/compare', methods=['GET'])
def compare_food():
    sorted_food = sorted(food_data, key=lambda x: x["price"])
    return jsonify(sorted_food)

# 🤖 AI Recommendation
@app.route('/recommend', methods=['POST'])
def get_recommendation():
    data = request.json or {}
    preference = data.get("preference", "best")

    best_food = recommend_ai(food_data, preference)
    best_transport = recommend_ai(transport_data, preference)

    return jsonify({
        "preference": preference,
        "recommended_food": best_food,
        "recommended_transport": best_transport,
    })

# 📦 Simulate booking
@app.route('/book', methods=['POST'])
def book_service():
    data = request.json

    return jsonify({
        "message": "Booking successful ✅",
        "order_details": data
    })

# 💳 Simulate payment
@app.route('/pay', methods=['POST'])
def make_payment():
    data = request.json

    return jsonify({
        "message": "Payment successful 💳",
        "amount": data.get("amount"),
        "status": "Paid"
    })

# ---------------- RUN ---------------- #

if __name__ == '__main__':
    app.run(debug=True)