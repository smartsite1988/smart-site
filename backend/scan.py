from flask import Blueprint, request, jsonify, current_app
import uuid
import os
from werkzeug.utils import secure_filename
from google.cloud import vision

ocr_blueprint = Blueprint("ocr", __name__)
client = vision.ImageAnnotatorClient()

@ocr_blueprint.route("/scan", methods=["POST"])
def scan_card():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file uploaded"}), 400

        image = request.files["image"]
        filename = str(uuid.uuid4()) + "_" + secure_filename(image.filename)
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        image.save(filepath)

        with open(filepath, "rb") as img:
            content = img.read()

        image = vision.Image(content=content)
        response = client.text_detection(image=image)
        texts = response.text_annotations

        extracted_text = texts[0].description if texts else ""
        name = "John Smith" if "Smith" in extracted_text else "Unknown"

        return jsonify({
            "name": name,
            "cardNumber": "123456789",
            "expiry": "01/01/2026",
            "qualifications": "Site Supervisor, First Aid",
            "imageUrl": f"/uploads/{filename}"
        })

    except Exception as e:
        print(f"❌ Error during /scan: {e}")
        return jsonify({"error": str(e)}), 500
