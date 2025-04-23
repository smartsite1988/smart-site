import os
import uuid
import json
import base64
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from google.cloud import vision
import firebase_admin
from firebase_admin import credentials
from werkzeug.utils import secure_filename
import openai

# Load .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Firebase from base64
firebase_key_b64 = os.getenv("FIREBASE_KEY_B64")
if not firebase_key_b64:
    raise Exception("FIREBASE_KEY_B64 not set")

firebase_key_json = base64.b64decode(firebase_key_b64).decode("utf-8")
key_path = os.path.join(os.getcwd(), "firebase-key.json")
with open(key_path, "w") as f:
    f.write(firebase_key_json)

# Set env var and initialize Firebase if not already done
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_path
if not firebase_admin._apps:
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)

# Uploads folder
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), "uploads")
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
db = SQLAlchemy(app)

# OpenAI key
openai.api_key = os.getenv("OPENAI_API_KEY")

# ---------- MODELS ----------
class Operative(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    card_number = db.Column(db.String(50))
    expiry_date = db.Column(db.String(20))
    qualifications = db.Column(db.Text)
    image_path = db.Column(db.String(255))

# ---------- ROUTES ----------
@app.route("/")
def index():
    return "<h1>✅ SmartSite Backend is Live!</h1><p>Ready to receive requests.</p>"

@app.route("/scan", methods=["POST"])
def scan_card():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file uploaded"}), 400

        image = request.files["image"]
        filename = str(uuid.uuid4()) + "_" + secure_filename(image.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        image.save(filepath)

        print(f"📷 Saved image to: {filepath}")

        client = vision.ImageAnnotatorClient()
        with open(filepath, "rb") as img:
            content = img.read()

        image_obj = vision.Image(content=content)
        response = client.text_detection(image=image_obj)

        if response.error.message:
            raise Exception(f"Vision API Error: {response.error.message}")

        texts = response.text_annotations
        extracted_text = texts[0].description if texts else ""

        print("🔍 Extracted Text:", extracted_text)

        # Simulated logic for now
        name = "Unknown"
        if "Smith" in extracted_text:
            name = "John Smith"

        card_number = "123456789"
        expiry = "01/01/2026"
        qualifications = "Site Supervisor, First Aid"

        op = Operative(
            name=name,
            card_number=card_number,
            expiry_date=expiry,
            qualifications=qualifications,
            image_path=filepath
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
        print(f"❌ Error during /scan: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat_bot():
    try:
        message = request.json.get("message", "")
        if not message:
            return jsonify({"error": "Message required"}), 400

        static_responses = {
            "What is SmartSite?": "SmartSite is an AI-driven construction management platform.",
            "Who is SmartSite for?": "Contractors, site teams, suppliers and more.",
        }

        for q, a in static_responses.items():
            if message.lower() in q.lower():
                return jsonify({"response": a})

        gpt_reply = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": message}]
        )

        return jsonify({"response": gpt_reply.choices[0].message.content})

    except Exception as e:
        print(f"❌ Error in /chat: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/uploads/<filename>")
def serve_upload(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ---------- MAIN ----------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
