from flask import request, jsonify
from backend import app, db
from backend.models import Operative, Certificate
import openai
import pytesseract
import cv2
import numpy as np
import io
from PIL import Image
import base64
import os

# ========= CHATBOT ========= #
@app.route("/api/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    system_prompt = (
        "You are SmartSite AI, a helpful assistant for a construction management platform.\n"
        "You answer questions about SmartSite features, how it's better than Procore, Fieldwire, Buildertrend, etc.,\n"
        "and help construction companies choose SmartSite."
    )

    try:
        openai.api_key = os.getenv("OPENAI_API_KEY")
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ]
        )
        reply = response.choices[0].message.content
        return jsonify({"response": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========= SCAN CARD ========= #
@app.route("/api/scan-card", methods=["POST"])
def scan_card():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded."}), 400

    file = request.files['image']
    img_bytes = file.read()
    img_np = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    try:
        text = pytesseract.image_to_string(img)
        return jsonify({"extracted_text": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========= SAVE OPERATOR + CERTIFICATE ========= #
@app.route("/api/save-operator", methods=["POST"])
def save_operator():
    data = request.get_json()

    op = Operative(
        full_name=data.get("full_name"),
        job_title=data.get("job_title"),
        firebase_uid=data.get("firebase_uid")
    )
    db.session.add(op)
    db.session.commit()

    certs = data.get("certificates", [])
    for cert in certs:
        c = Certificate(
            name=cert.get("name"),
            expiry=cert.get("expiry"),
            operative_id=op.id
        )
        db.session.add(c)

    db.session.commit()
    return jsonify({"message": "Operator and certificates saved successfully."})


# ========= GET TRAINING MATRIX ========= #
@app.route("/api/training-matrix", methods=["GET"])
def get_training_matrix():
    operatives = Operative.query.all()
    data = []
    for op in operatives:
        cert_list = []
        for cert in op.certificates:
            cert_list.append({
                "name": cert.name,
                "expiry": cert.expiry.strftime('%Y-%m-%d')
            })
        data.append({
            "full_name": op.full_name,
            "job_title": op.job_title,
            "certificates": cert_list
        })
    return jsonify(data)


# ========= BACKEND INDEX ========= #
@app.route("/")
def index():
    return "✅ SmartSite Backend is running!"
