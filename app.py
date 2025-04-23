import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from google.cloud import vision
import firebase_admin
from firebase_admin import credentials
import openai

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Firebase initialization (only once)
firebase_cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
if not firebase_admin._apps:
    firebase_admin.initialize_app(firebase_cred)

# Set OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

# FAQ data for chatbot
FAQS = {
    "What is your name?": "I am SmartSite ChatBot.",
    "What is your purpose?": "I answer your questions and assist you.",
    "Where is your company based?": "We are based in the UK.",
}

# Chatbot endpoint
@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message', '')
    response_text = FAQS.get(user_input)

    if response_text:
        return jsonify({"response": response_text})

    completion = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": user_input}]
    )

    return jsonify({"response": completion.choices[0].message.content})

# OCR scanning endpoint
@app.route('/scan-card', methods=['POST'])
def scan_card():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']
    content = file.read()

    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=content)

    response = client.text_detection(image=image)
    texts = response.text_annotations

    if texts:
        extracted_text = texts[0].description
        return jsonify({"extracted_text": extracted_text})
    else:
        return jsonify({"error": "No text detected."}), 400

# Root endpoint
@app.route('/')
def index():
    return "SmartSite Backend Active."

if __name__ == '__main__':
    app.run(debug=True)
