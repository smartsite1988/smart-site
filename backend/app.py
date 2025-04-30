import os
import uuid
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

# Load environment variables
load_dotenv()

app = Flask(__name__)

# --- CONFIGURE CORS ---
CORS(app, origins=[
    "https://www.smartsite-app.com",
    "https://smartsite-mvp-de16b70f49d2.herokuapp.com",
    "http://localhost:5500"
])

# --- CONFIGURE UPLOADS ---
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# --- CONFIGURE DATABASE ---
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI", "sqlite:///site.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# --- INITIALIZE FIREBASE FROM BASE64 ---
firebase_key_b64 = os.getenv("FIREBASE_KEY_B64")
if not firebase_key_b64:
    raise Exception("FIREBASE_KEY_B64 is not set in .env")

firebase_json_path = os.path.join(os.getcwd(), "firebase-key.json")
with open(firebase_json_path, "w") as f:
    f.write(base64.b64decode(firebase_key_b64).decode("utf-8"))

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = firebase_json_path
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_json_path)
    firebase_admin.initialize_app(cred)

# --- OPENAI API KEY ---
openai.api_key = os.getenv("OPENAI_API_KEY")

# --- MODELS ---
class Operative(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    card_number = db.Column(db.String(50))
    expiry_date = db.Column(db.String(20))
    qualifications = db.Column(db.Text)
    image_path = db.Column(db.String(255))

# --- ROUTES ---
@app.route("/")
def home():
    return "<h2>✅ SmartSite API is Live</h2>"

@app.route("/scan", methods=["POST"])
def scan_card():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded."}), 400

    image = request.files["image"]
    filename = f"{uuid.uuid4()}_{secure_filename(image.filename)}"
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    image.save(path)

    try:
        client = vision.ImageAnnotatorClient()
        with open(path, "rb") as img:
            content = img.read()

        response = client.text_detection(image=vision.Image(content=content))
        texts = response.text_annotations
        extracted_text = texts[0].description if texts else ""

        # Demo data until full OCR parser is live
        name = "John Smith" if "Smith" in extracted_text else "Unknown"
        card_number = "123456789"
        expiry = "01/01/2026"
        qualifications = "Site Supervisor, First Aid"

        op = Operative(
            name=name,
            card_number=card_number,
            expiry_date=expiry,
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
            "imageUrl": f"{request.host_url}uploads/{filename}"
        })

    except Exception as e:
        print("❌ Vision API error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    message = request.json.get("message", "").strip()
    if not message:
        return jsonify({"error": "No message provided."}), 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": message}]
        )
        return jsonify({"response": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/uploads/<filename>")
def serve_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# --- MAIN ENTRY ---
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=False)
