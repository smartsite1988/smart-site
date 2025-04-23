# SmartSite MVP

This project is a full-stack AI-powered portal for construction operatives, contractors, and subcontractors.

## 🔧 Stack
- **Frontend**: HTML, CSS, Vanilla JS
- **Backend**: Flask (Python)
- **OCR**: Google Cloud Vision
- **Chatbot**: OpenAI Chat API
- **Authentication**: QR Code + Token Share (Planned)
- **Database**: PostgreSQL
- **Storage**: Firebase (for profile/selfie/doc uploads)

## 🗂️ Project Structure
```
SmartSite-MVP/
├── backend/
│   └── app.py (Flask routes)
├── public/
│   ├── operative/
│   │   ├── operative-dashboard.html
│   │   ├── operative-cscs.html
│   │   ├── operative-profile.html
│   │   └── cscs-scan.html
│   ├── js/
│   │   └── card-scanner.js
│   ├── css/
│   │   └── style.css
├── requirements.txt
├── Procfile
├── .gitignore
├── README.md ✅
```

## ✅ Features (Operative Side)
- Upload and scan CSCS card (OCR-powered)
- Auto-populate training matrix
- Fill out a complete operative profile (incl. selfie, NI, UTR, clothing size)
- Upload documents (RTW, licence, certs)
- Smart AI chatbot
- Fully responsive and mobile-ready

## 🔜 Coming Soon
- HMRC integration (upload receipts, payslips)
- CV generator (auto-built from profile + history)
- Translation support for all forms
- Employer/contractor view
- Job site sign-on/sign-off logic

## 💻 Deployment Options
- Heroku (backend)
- Vercel / Netlify (frontend)
- Firebase or Google Cloud for file storage

---

## 🚀 Usage
```bash
# Run backend locally
cd backend
flask run

# View dashboard
open public/operative/operative-dashboard.html
```

---

Built with 💼 by SmartSite
