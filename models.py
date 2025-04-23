# backend/models.py
from backend import db
from datetime import datetime

class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    firebase_uid = db.Column(db.String(255), unique=True, nullable=False)  # Link to Firebase Auth
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Operative(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    card_number = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    organization = db.relationship('Organization', backref='operatives')

class Certificate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    operative_id = db.Column(db.Integer, db.ForeignKey('operative.id'), nullable=False)
    certificate_name = db.Column(db.String(200), nullable=False)
    issued_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date)
    front_image_path = db.Column(db.String(255))
    back_image_path = db.Column(db.String(255), nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    operative = db.relationship('Operative', backref='certificates')
