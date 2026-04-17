from flask import Flask, jsonify, request

app = Flask(__name__)

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

def recommend(options, preference):
    if preference == "cheap":
        return sorted(options, key=lambda x: x["price"])[0]
    elif preference == "fast":
        return sorted(options, key=lambda x: x["time"])[0]
    else:  # best
        return sorted(options, key=lambda x: x["rating"], reverse=True)[0]

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
    data = request.json
    preference = data.get("preference", "best")

    best_food = recommend(food_data, preference)
    best_transport = recommend(transport_data, preference)

    return jsonify({
        "recommended_food": best_food,
        "recommended_transport": best_transport
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