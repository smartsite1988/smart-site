from flask import request, jsonify
from backend import app, db
from backend.models import Organization, Operative, Certificate
from google.cloud import vision
import openai
import os

openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/')
def home():
    return "SmartSite Backend Active."

@app.route('/chat', methods=['POST'])
def chat():
    message = request.json.get('message')
    faq_response = {
        "What is your name?": "I am SmartSite ChatBot.",
        "What is your purpose?": "I answer your questions and assist you.",
        "Where is your company based?": "We are based in the UK."
    }.get(message)

    if faq_response:
        return jsonify({"response": faq_response})

    completion = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": message}]
    )

    return jsonify({"response": completion.choices[0].message.content})

@app.route('/scan-card', methods=['POST'])
def scan_card():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided."}), 400

    content = request.files['image'].read()
    client = vision.ImageAnnotatorClient()
    response = client.text_detection(image=vision.Image(content=content))

    if response.text_annotations:
        return jsonify({"extracted_text": response.text_annotations[0].description})
    return jsonify({"error": "No text detected."}), 400
