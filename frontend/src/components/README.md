# 🏥 Neuralite Healthcare AI

Neuralite is a comprehensive, futuristic, and AI-powered healthcare platform built to bridge the gap between advanced machine learning and accessible medical care. 

## ✨ Key Features (9 Smart AI Modules)

1. **AI Chatbot (Neuralite Assistant):** Voice-enabled smart symptom checker.
2. **AI Parchi Scanner:** Digitizes handwritten prescriptions & extracts medicine names.
3. **Pneumonia X-Ray Scanner:** Deep Learning (CNN) based chest X-Ray analysis.
4. **Health Risk Predictor:** ML-based tabular data analysis for overall health risk.
5. **Wellness Coach:** Personalized diet and lifestyle recommendations.
6. **Mental Health Analyzer:** Psychological stress assessment based on user inputs.
7. **Skin Analyzer:** Dermatology AI to detect skin conditions and rashes.
8. **Lab Report Analyzer:** Reads blood test reports and explains abnormal values.
9. **Food Calorie Scanner:** Tracks macronutrients and calories from food images.

## 🚀 Core Platform Features
* **Live Video Consultations:** Integrated with ZegoCloud for seamless 1-on-1 doctor-patient calls.
* **Payment Gateway:** Razorpay integration for online consultation fees and pharmacy orders.
* **E-Prescription Vault:** Smart PDF prescription generation and history tracking.
* **Interactive Analytics:** Real-time health vitals tracking with Recharts.

## 💻 Tech Stack
* **Frontend:** React.js, Tailwind CSS, Vite, Recharts
* **Backend:** Python, Flask
* **AI / ML:** Google Gemini AI API, TensorFlow/Keras (CNN)
* **Services:** Razorpay (Payments), ZegoCloud (WebRTC Video)

## ⚙️ How to Run Locally

### 1. Start the ML Backend (Port 8000)
```bash
cd ml-backend
pip install -r requirements.txt
python app.py