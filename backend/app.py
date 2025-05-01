# === app.py ===
import os
import uuid
import base64
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from google.cloud import vision
import firebase_admin
from firebase_admin import credentials
from werkzeug.utils import secure_filename
import openai

# Load environment
load_dotenv()

app = Flask(__name__)
CORS(app)

# Firebase credentials
firebase_key_b64 = os.getenv("FIREBASE_KEY_B64")
if not firebase_key_b64:
    raise Exception("FIREBASE_KEY_B64 not set")

firebase_json_path = os.path.join(os.getcwd(), "firebase-key.json")
with open(firebase_json_path, "w") as f:
    f.write(base64.b64decode(firebase_key_b64).decode("utf-8"))

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = firebase_json_path

if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_json_path)
    firebase_admin.initialize_app(cred)

# DB Config
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

openai.api_key = os.getenv("OPENAI_API_KEY")
db = SQLAlchemy(app)

# === Models ===
class Operative(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    card_number = db.Column(db.String(50))
    expiry_date = db.Column(db.String(20))
    qualifications = db.Column(db.Text)
    image_path = db.Column(db.String(255))

# === Routes ===
@app.route("/")
def home():
    return "<h2>✅ SmartSite backend is running!</h2>"

@app.route("/scan", methods=["POST"])
def scan_card():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image = request.files["image"]
    filename = f"{uuid.uuid4()}_{secure_filename(image.filename)}"
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    image.save(path)

    try:
        client = vision.ImageAnnotatorClient()
        with open(path, "rb") as img:
            content = img.read()

        vision_img = vision.Image(content=content)
        response = client.text_detection(image=vision_img)

        texts = response.text_annotations
        extracted_text = texts[0].description if texts else ""

        # Dummy extraction
        name = "Jordan Graham" if "JORDAN" in extracted_text else "Unknown"
        card_number = "14152773" if "14152773" in extracted_text else "00000000"
        expiry_date = "Jun 2027" if "2027" in extracted_text else "Unknown"
        qualifications = "Supervisor" if "SUPERVISOR" in extracted_text else "Unverified"

        op = Operative(
            name=name,
            card_number=card_number,
            expiry_date=expiry_date,
            qualifications=qualifications,
            image_path=path
        )
        db.session.add(op)
        db.session.commit()

        return jsonify({
            "name": op.name,
            "cardNumber": op.card_number,
            "expiry": op.expiry_date,
            "qualifications": op.qualifications,
            "imageUrl": f"/uploads/{filename}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/operatives", methods=["GET"])
def get_operatives():
    ops = Operative.query.all()
    return jsonify([
        {
            "name": o.name,
            "cardNumber": o.card_number,
            "expiry": o.expiry_date,
            "qualifications": o.qualifications,
            "imageUrl": f"/uploads/{os.path.basename(o.image_path)}"
        } for o in ops
    ])

@app.route("/uploads/<filename>")
def get_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
