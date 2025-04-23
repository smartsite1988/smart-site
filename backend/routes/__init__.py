import os
import base64
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Get the environment variable from Heroku
firebase_key_b64 = os.environ.get("FIREBASE_KEY_B64")

# If it's missing, raise an error (this avoids fallback to json file)
if not firebase_key_b64:
    raise RuntimeError("Missing FIREBASE_KEY_B64 in environment.")

# Decode and parse the Firebase credentials
firebase_key_json = base64.b64decode(firebase_key_b64).decode("utf-8")
cred = credentials.Certificate(json.loads(firebase_key_json))

# Initialize Firebase app
firebase_admin.initialize_app(cred)
db = firestore.client()
