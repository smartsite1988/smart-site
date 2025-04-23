from flask import Blueprint, request, jsonify
from google.cloud import vision
import pytesseract
import cv2
import numpy as np

ocr_blueprint = Blueprint('ocr', __name__)

client = vision.ImageAnnotatorClient()

@ocr_blueprint.route('/upload', methods=['POST'])
def upload_card():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    image_content = file.read()

    # Google Vision OCR
    image = vision.Image(content=image_content)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    if response.error.message:
        return jsonify({'error': response.error.message}), 500

    extracted_text = texts[0].description if texts else ""

    return jsonify({'extracted_text': extracted_text}), 200
