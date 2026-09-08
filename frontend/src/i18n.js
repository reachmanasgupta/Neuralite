import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Yahan hum apna translation data rakhenge
const resources = {
  en: {
    translation: {
      "welcome": "Welcome back",
      "home": "Home",
      "login": "Login",
      "register": "Register",
      "dashboard": "Dashboard",
      "logout": "Logout",
      "patient_dashboard": "Patient Dashboard",
      "upload_parchi": "Upload Parchi",
      "book_appointment": "Book Appointment",
      "my_appointments": "My Appointments",
      "ai_analyzer_title": "Smart Symptom Analyzer",
      "ai_analyzer_desc": "Upload your old report or prescription and our AI will suggest the best doctor for you."
    }
  },
  hi: {
    translation: {
      "welcome": "वापसी पर स्वागत है",
      "home": "होम",
      "login": "लॉगिन",
      "register": "रजिस्टर",
      "dashboard": "डैशबोर्ड",
      "logout": "लॉगआउट",
      "patient_dashboard": "मरीज़ डैशबोर्ड",
      "upload_parchi": "पर्ची अपलोड करें",
      "book_appointment": "अपॉइंटमेंट बुक करें",
      "my_appointments": "मेरे अपॉइंटमेंट्स",
      "ai_analyzer_title": "स्मार्ट लक्षण विश्लेषक (AI)",
      "ai_analyzer_desc": "अपनी पुरानी रिपोर्ट या पर्ची अपलोड करें और हमारा AI आपको सही डॉक्टर का सुझाव देगा।"
    }
  }
};

i18n
  .use(LanguageDetector) // User ka language detect karne ke liye
  .use(initReactI18next) // React ke sath jodane ke liye
  .init({
    resources,
    fallbackLng: 'en', // Agar koi error aaye toh default English chalega
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;