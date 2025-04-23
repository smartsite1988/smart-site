from flask import Blueprint, request, jsonify
import os
import base64
from datetime import datetime

signature_bp = Blueprint("signature_bp", __name__)

SIGNATURE_DIR = os.path.join("public", "signatures")
os.makedirs(SIGNATURE_DIR, exist_ok=True)

@signature_bp.route("/api/save-signature", methods=["POST"])
def save_signature():
    data = request.get_json()
    name = data.get("name")
    signature = data.get("signature")
    document_id = data.get("documentId")

    if not name or not signature or not document_id:
        return jsonify({"error": "Missing fields"}), 400

    try:
        # Extract base64 image data
        signature_data = signature.split(",")[1]
        decoded_data = base64.b64decode(signature_data)

        # Save file with timestamp
        filename = f"{document_id}_{name.replace(' ', '_')}_{datetime.utcnow().timestamp()}.png"
        filepath = os.path.join(SIGNATURE_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(decoded_data)

        return jsonify({"success": True, "path": filepath})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
