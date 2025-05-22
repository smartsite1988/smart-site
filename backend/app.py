# FILE: backend/app.py

import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# 🔧 Fix Heroku postgres:// to postgresql:// for SQLAlchemy
db_url = os.getenv('DATABASE_URL')
if db_url and db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure upload folder
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Setup database
db = SQLAlchemy(app)

class Operative(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    card_number = db.Column(db.String(50))
    expiry_date = db.Column(db.String(50))
    qualifications = db.Column(db.String(100))
    image_path = db.Column(db.String(255))

@app.route("/")
def home():
    return "<h1>✅ SmartSite backend is running!</h1>"

@app.route("/scan", methods=['POST'])
def scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files['image']
    filename = secure_filename(f"{uuid.uuid4()}_{image.filename}")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image.save(filepath)

    # Dummy scan result
    dummy_result = {
        "name": "Jordan Graham",
        "cardNumber": "12345678",
        "expiry": "May 2027",
        "qualifications": "Supervisor",
        "imageUrl": f"/uploads/{filename}"
    }

    # Save to database
    operative = Operative(
        name=dummy_result['name'],
        card_number=dummy_result['cardNumber'],
        expiry_date=dummy_result['expiry'],
        qualifications=dummy_result['qualifications'],
        image_path=filepath
    )
    db.session.add(operative)
    db.session.commit()

    return jsonify(dummy_result)

@app.route("/uploads/<filename>")
def get_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)), host="0.0.0.0")
