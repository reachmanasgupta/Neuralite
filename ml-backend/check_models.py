import os
import google.generativeai as genai
from dotenv import load_dotenv

# .env file se keys load karna
load_dotenv()

# Secure tareeke se API key nikalna
API_KEY = os.getenv("GEMINI_API_KEY_1") # Ya GEMINI_API_KEY jo bhi aapne .env me rakha ho

if not API_KEY:
    print("⚠️ Error: API Key .env file mein nahi mili!")
else:
    genai.configure(api_key=API_KEY)
    
    print("⏳ Fetching available models...\n")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"✅ {m.name}")
    except Exception as e:
        print(f"⚠️ Error: {e}")