from flask import Blueprint, request, jsonify
import os
import base64
from datetime import datetime

save_signature = Blueprint("save_signature", __name__)

@save_signature.route("/api/save-signature", methods=["POST"])
def save_signature_route():
    data = request.get_json()
    name = data.get("name")
    signature = data.get("signature")
    document_id = data.get("documentId")

    if not name or not signature or not document_id:
        return jsonify({"error": "Missing fields"}), 400

    # Prepare directory
    today = datetime.now().strftime("%Y-%m-%d")
    folder = os.path.join("signatures", document_id)
    os.makedirs(folder, exist_ok=True)

    filename = f"{name.replace(' ', '_')}_{today}.png"
    path = os.path.join(folder, filename)

    # Remove the prefix and save as .png
    header, encoded = signature.split(",", 1)
    with open(path, "wb") as f:
        f.write(base64.b64decode(encoded))

    return jsonify({"success": True})
