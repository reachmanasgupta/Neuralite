import warnings
warnings.filterwarnings("ignore")

import os
import json 
import pickle 
import numpy as np 
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import google.generativeai as genai

# --- Dotenv Import for Security ---
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- TensorFlow Imports ---
from tensorflow.keras.models import load_model, Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing import image

# ================= CNN MODEL LOADING (PNEUMONIA) =================
try:
    # 1. Khali AI Brain (Architecture) banana, bilkul Colab jaisa
    cnn_model = Sequential([
        Conv2D(32, (3,3), activation='relu', input_shape=(150, 150, 3)),
        MaxPooling2D(2, 2),
        Conv2D(64, (3,3), activation='relu'),
        MaxPooling2D(2,2),
        Conv2D(128, (3,3), activation='relu'),
        MaxPooling2D(2,2),
        Flatten(),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(1, activation='sigmoid')
    ])

    # 2. Uss khali dimag mein trained knowledge (.h5 file se) transfer karna
    cnn_model.load_weights('pneumonia_cnn_model.h5')
    print("✅ Pneumonia CNN Model successfully loaded into Flask using Weights!")
except Exception as e:
    print(f"⚠️ Pneumonia Model load nahi ho paya: {e}")
    cnn_model = None

app = Flask(__name__)
CORS(app)

# ==========================================================
# --- SMART API KEY ROTATION & LOAD BALANCER ---
# ==========================================================
# .env se 5 API keys uthana
API_KEYS = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
    os.getenv("GEMINI_API_KEY") # Agar purani key ho toh
]
# Khali (None/Blank) keys ko hatana
API_KEYS = [key for key in API_KEYS if key and key.strip() != ""]

if not API_KEYS:
    print("⚠️ WARNING: Koi bhi GEMINI_API_KEY .env file mein nahi mili!")

current_key_index = 0

def configure_gemini():
    """Current active key ko set karta hai"""
    if API_KEYS:
        genai.configure(api_key=API_KEYS[current_key_index])
        print(f"[LOAD BALANCER] Using API Key {current_key_index + 1} / {len(API_KEYS)}")

# Shuru mein pehli key set karein
configure_gemini()

# ================= AUTO-DETECT WORKING MODEL =================
def get_working_model():
    """Google se automatically allowed models ki list fetch karta hai"""
    try:
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]

        for m in available_models:
            if 'gemini-1.5-flash' in m: return m
        for m in available_models:
            if 'gemini-1.0-pro' in m: return m
        if available_models: return available_models[0]
    except Exception as e:
        print("Model list fetch error:", e)
    return 'models/gemini-1.5-flash'

def generate_with_fallback(contents, system_instruction=None):
    """
    Yeh function AI call karta hai. Agar ek key ki limit khatam ho jaye 
    (Quota Exceeded/429), toh yeh automatically agli key try karta hai.
    """
    global current_key_index
    max_retries = len(API_KEYS)
    
    for attempt in range(max_retries):
        try:
            model_name = get_working_model()
            if system_instruction:
                model = genai.GenerativeModel(model_name, system_instruction=system_instruction)
            else:
                model = genai.GenerativeModel(model_name)
            
            # Request bhej kar result return karna
            return model.generate_content(contents)
            
        except Exception as e:
            error_msg = str(e).lower()
            # Check for Rate Limit, Quota Exhausted, or 429 Error
            if "429" in error_msg or "quota" in error_msg or "exhausted" in error_msg or "rate limit" in error_msg:
                print(f"⚠️ Key {current_key_index + 1} limit reached! Switching to next key...")
                current_key_index = (current_key_index + 1) % len(API_KEYS)
                configure_gemini() # Agli key active karo aur loop dobara chalega
            else:
                # Agar koi aur normal error ho (bad image format, etc.), wahi raise karo
                raise e
                
    raise Exception("System overloaded: Sabhi 5 API keys ki limit khatam ho chuki hai. Kripya thodi der baad try karein.")


# ================= ML MODEL LOADING (TABULAR DATA) =================
try:
    with open('health_model.pkl', 'rb') as f:
        health_ml_model = pickle.load(f)
        print("✅ ML Health Model loaded successfully!")
except Exception as e:
    print("⚠️ ML Model load nahi hua. Kripya pehle 'python train_model.py' run karein.")
    health_ml_model = None

system_text = """
Tum ek smart, caring aur professional AI Health Assistant ho. Tumhara naam 'Neuralite' hai.

STRICT RULES FOR CONVERSATION:
1. Apna naam ('Neuralite') sirf shuruwat mein ek baar batao. Har message mein naam mat dohrao.
2. Ek asli, caring doctor ki tarah baat karo. User ko comfort do.
3. Jawab thoda detailed, helpful aur achhe se samjhane wala rakho (max 2-3 chote paragraphs).
4. Agar user symptoms bataye, toh thoda samjhao aur 1-2 zaroori follow-up sawal pucho.
5. MULTILINGUAL ADAPTATION (CRITICAL RULE): User jis bhasha (language) ya script mein sawal puche, tumhe EXACTLY usi bhasha aur script mein jawab dena hai. 
   - Agar user Hindi (Devanagari) me likhe: "मेरे सिर में दर्द है" -> Jawab Devanagari Hindi me do.
   - Agar user English me likhe: "I have a headache" -> Jawab pure English me do.
   - Agar user Hinglish me likhe: "Mujhe fever lag raha hai" -> Jawab Devanagari Hindi me do.
   - Agar user Bengali, Tamil, Gujarati, ya kisi aur bhasha me likhe -> Toh jawab usi same bhasha me do.
"""

chat_sessions = {}

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "success", "message": "Direct API Health Server is Running! 🚀"})

# ================= 1. PARCHI SCANNER API =================
@app.route('/api/analyze-prescription', methods=['POST'])
def analyze_prescription():
    if 'file' not in request.files:
        return jsonify({"error": "Koi image upload nahi ki gayi!"}), 400
    file = request.files['file']
    user_id = "default_user"

    try:
        img = Image.open(file.stream)
        prompt = """
        Tum ek expert pharmacist aur doctor ho. Is handwritten prescription (parchi) ko dhyan se padho.
        Mujhe 2 chizein JSON format mein do:
        1. 'medicines': Dawaiyon ki list (jaise ✅ Medicine 1). Agar kuch na mile toh 'No text found' likho.
        2. 'specialty': In dawaiyon ke aadhar par kis specialist se milna chahiye (e.g., 'General Physician', 'Cardiologist', 'Dermatologist'). Agar text na mile toh 'None' likho.

        Sirf aur sirf valid JSON return karna, koi aur text ya markdown block (```json) mat lagana.
        Format example:
        {
            "medicines": "✅ Paracetamol\n✅ Omee",
            "specialty": "General Physician"
        }
        """

        # LOAD BALANCER FUNCTION USED HERE
        response = generate_with_fallback([prompt, img])
        response_text = response.text.strip()

        if response_text.startswith("```json"): response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"): response_text = response_text[3:-3].strip()

        try:
            ai_data = json.loads(response_text)
        except json.JSONDecodeError:
            return jsonify({"error": "AI ne sahi format mein data nahi bheja. Kripya dobara try karein."}), 500

        extracted_medicines = ai_data.get("medicines", "")
        recommended_specialty = ai_data.get("specialty", "General Physician")

        if "No text found" in extracted_medicines or not extracted_medicines:
            return jsonify({"status": "success", "message": "Maaf kijiye, main is image mein koi dawai ka naam nahi padh paa raha hu."})

        msg = f"Parchi Analysis Complete! 📄\n\nMujhe yeh dawaiyan samajh aayi hain:\n{extracted_medicines}"
        bot_memory_text = f"Maine ek parchi upload ki hai jisme yeh dawaiyan hain: {extracted_medicines}. Inhe yaad rakhna."

        if user_id not in chat_sessions: chat_sessions[user_id] = []
        chat_sessions[user_id].append({"role": "user", "parts": [bot_memory_text]})
        chat_sessions[user_id].append({"role": "model", "parts": [msg]})

        return jsonify({"status": "success", "message": msg, "recommended_specialty": recommended_specialty})

    except Exception as e:
        return jsonify({"error": f"Image Error: {str(e)}"}), 500

# ================= 2. TEXT API (CHAT) =================
@app.route('/api/chat-text', methods=['POST'])
def chat_text():
    data = request.json
    user_message = data.get('message', '')
    user_id = "default_user"

    try:
        if user_id not in chat_sessions:
            chat_sessions[user_id] = []

        chat_sessions[user_id].append({"role": "user", "parts": [user_message]})

        try:
            # TRY WITH SYSTEM INSTRUCTIONS
            response = generate_with_fallback(chat_sessions[user_id], system_instruction=system_text)
            bot_reply = response.text
        except Exception as e:
            err_str = str(e).lower()
            if "system_instruction" in err_msg or "support" in err_str:
                print(f"⚠️ System Instruction reject ho gayi. Fallback lag raha hai...")
                fallback_history = [
                    {"role": "user", "parts": [system_text]},
                    {"role": "model", "parts": ["Understood. I am Neuralite."]}
                ] + chat_sessions[user_id]
                response = generate_with_fallback(fallback_history)
                bot_reply = response.text
            else:
                raise e # This will catch out of limit exceptions

        chat_sessions[user_id].append({"role": "model", "parts": [bot_reply]})
        return jsonify({"message": bot_reply})

    except Exception as e:
        if len(chat_sessions.get(user_id, [])) > 0:
            chat_sessions.get(user_id, []).pop()
        error_msg = str(e)
        return jsonify({"message": f"Server Error: {error_msg}\n\n💡 Hint: Please wait or try again."})

# ================= 3. ML PREDICTION & MATCHMAKING API =================
@app.route('/api/predict-health', methods=['POST'])
def predict_health():
    if health_ml_model is None:
        return jsonify({"error": "ML Model server par load nahi hua hai. Pehle model train karein."}), 500

    try:
        data = request.json
        age = float(data.get('age', 0))
        bmi = float(data.get('bmi', 0))
        glucose = float(data.get('glucose', 0))
        bp = float(data.get('bp', 0))

        features = np.array([[age, bmi, glucose, bp]])
        prediction = health_ml_model.predict(features)[0]
        probability = health_ml_model.predict_proba(features)[0][1] * 100
        result = "High Risk" if prediction == 1 else "Low Risk"

        try:
            prompt = f"""
            Tum ek expert Doctor aur Dietitian ho. 
            Patient Details: Age: {age}, BMI: {bmi}, Glucose: {glucose}, BP: {bp}.
            ML Model Diagnosis: {result} (Probability: {round(probability, 2)}%).

            Mujhe sirf JSON format mein 2 details do:
            1. 'diet_plan': 2-3 lines mein ek strict aur healthy diet advice inki condition ke hisaab se (Hinglish mein).
            2. 'specialty': Inhe kis specialist se milna chahiye (e.g., 'Cardiologist', 'Endocrinologist', 'General Physician', 'Dietitian').

            Format: {{"diet_plan": "Aapko meetha kam khana chahiye...", "specialty": "Endocrinologist"}}
            """
            ai_response = generate_with_fallback(prompt)
            response_text = ai_response.text.strip()

            if response_text.startswith("```json"): response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"): response_text = response_text[3:-3].strip()

            ai_data = json.loads(response_text)
            diet_plan = ai_data.get("diet_plan", "Healthy khana khayein aur roz exercise karein.")
            recommended_specialty = ai_data.get("specialty", "General Physician")

        except Exception as ai_err:
            print(f"⚠️ AI Generation Error: {ai_err}")
            diet_plan = "Roz 30 minute walk karein aur paani zyada piyein."
            recommended_specialty = "General Physician"

        return jsonify({
            "status": "success",
            "risk_level": result,
            "risk_probability": round(probability, 2),
            "message": f"ML Analysis: Aapka Health Risk {result} hai ({round(probability, 2)}% probability).",
            "diet_plan": diet_plan,
            "recommended_specialty": recommended_specialty
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ================= 4. CNN X-RAY ANALYSIS API =================
@app.route('/api/analyze-xray', methods=['POST'])
def analyze_xray():
    if cnn_model is None: return jsonify({'error': 'CNN Model server par loaded nahi hai!'}), 500
    if 'file' not in request.files: return jsonify({'error': 'Koi file nahi mili'}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({'error': 'File select nahi ki gayi'}), 400

    try:
        file_path = 'temp_xray.jpg'
        file.save(file_path)

        img = image.load_img(file_path, target_size=(150, 150))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = x / 255.0 

        prediction = cnn_model.predict(x)
        score = prediction[0][0]

        if os.path.exists(file_path): os.remove(file_path)

        if score > 0.5:
            confidence = round(float(score) * 100, 2)
            return jsonify({'result': 'Pneumonia Detected', 'confidence': confidence, 'message': f'Warning: Pneumonia ke lakshan paye gaye hain ({confidence}% confidence). Kripya Pulmonologist se consult karein.'})
        else:
            confidence = round(float(1 - score) * 100, 2)
            return jsonify({'result': 'Normal', 'confidence': confidence, 'message': f'Aapka X-Ray Normal hai ({confidence}% confidence). Koi khatre ki baat nahi hai.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================= 5. AI WELLNESS & DIET COACH API =================
@app.route('/api/wellness-plan', methods=['POST'])
def wellness_plan():
    data = request.json
    user_problem = data.get('problem', '')

    if not user_problem: return jsonify({"error": "Kripya apni pareshani ya goal batayein."}), 400

    try:
        prompt = f"""
        Tum ek expert Clinical Nutritionist, Ayurvedic Expert aur Fitness Coach ho.
        User ki pareshani/goal yeh hai: "{user_problem}"

        Mujhe ek detailed aur practical wellness plan do. 
        CRITICAL LANGUAGE RULE: User ne jis bhasha me likha hai, pura jawab USI Bhasha/Script me do.
        
        Mujhe sirf aur sirf valid JSON format mein jawab do:
        1. "root_cause": Is problem ki wajah kya ho sakti hai.
        2. "diet_plan": Ek simple Indian diet plan.
        3. "lifestyle_changes": 3-4 aasan aadat jo badalni chahiye.
        4. "dos_and_donts": Kya karna chahiye aur kya bilkul nahi karna chahiye.

        CRITICAL JSON RULE: Nested JSON mat banana. Markdown (```json) mat lagana.
        """
        response = generate_with_fallback(prompt)
        response_text = response.text.strip()
        
        if response_text.startswith("```json"): response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"): response_text = response_text[3:-3].strip()

        try:
            return jsonify({"status": "success", "data": json.loads(response_text)})
        except json.JSONDecodeError:
            return jsonify({"error": "AI ne sahi format mein plan nahi banaya. Kripya dobara try karein."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= 6. MENTAL HEALTH & STRESS ANALYZER API =================
@app.route('/api/analyze-stress', methods=['POST'])
def analyze_stress():
    data = request.json
    q1, q2, q3, q4, q5 = data.get('q1',''), data.get('q2',''), data.get('q3',''), data.get('q4',''), data.get('q5','')
    
    if not all([q1, q2, q3, q4, q5]): return jsonify({"error": "Kripya sabhi sawalon ke jawab dein."}), 400

    try:
        prompt = f"""
        Tum ek expert Psychiatrist aur Mental Health Counselor ho. Patient ne yeh jawab diye hain:
        1: {q1}, 2: {q2}, 3: {q3}, 4: {q4}, 5: {q5}

        Mujhe sirf JSON format mein jawab do:
        1. "stress_level": "Low", "Moderate", ya "High".
        2. "analysis": Patient ki mental state ka summary (Hindi Devanagari mein).
        3. "recommendation": Unhe stress kam karne ke liye kya karna chahiye.
        CRITICAL RULE: No Markdown. Valid JSON only.
        """
        response = generate_with_fallback(prompt)
        response_text = response.text.strip()
        
        if response_text.startswith("```json"): response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"): response_text = response_text[3:-3].strip()

        try:
            return jsonify({"status": "success", "data": json.loads(response_text)})
        except: return jsonify({"error": "AI could not process responses correctly."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= 7. SKIN / DERMATOLOGY ANALYZER API =================
@app.route('/api/analyze-skin', methods=['POST'])
def analyze_skin():
    if 'file' not in request.files: return jsonify({"error": "Koi image upload nahi ki gayi!"}), 400
    file = request.files['file']

    try:
        img = Image.open(file.stream)
        prompt = """
        Tum ek expert Dermatologist (Skin Specialist) ho. Is skin condition ya rash ko dekho.
        Mujhe sirf JSON format mein 3 cheezein batao:
        1. "possible_condition": Is condition ka kya naam ho sakta hai.
        2. "description": Yeh kya hoti hai aur kyu hoti hai (Hindi Devanagari).
        3. "advice": Ghar par kya khyal rakhein (Hinglish).
        CRITICAL RULE: Valid JSON return karna. Markdown (```json) mat lagana.
        """
        response = generate_with_fallback([prompt, img])
        response_text = response.text.strip()
        
        if response_text.startswith("```json"): response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"): response_text = response_text[3:-3].strip()

        try:
            return jsonify({"status": "success", "data": json.loads(response_text)})
        except: return jsonify({"error": "AI could not process the image properly."}), 500
    except Exception as e:
        return jsonify({"error": f"Image Error: {str(e)}"}), 500

# ================= 8. LAB REPORT ANALYZER API =================
@app.route('/api/analyze-lab', methods=['POST'])
def analyze_lab():
    if 'file' not in request.files: return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']

    try:
        img = Image.open(file.stream)
        prompt = """
        Tum ek expert Pathologist aur Doctor ho. Is Blood/Lab test report ki image ko dhyan se padho.
        Mujhe sirf valid JSON format mein yeh details do:
        1. "summary": Report ka overall summary (Hindi Devanagari mein).
        2. "abnormal_values": Agar koi result normal range se bahar hai (High/Low) toh uski list aur uska kya matlab hai. Agar sab normal hai toh likho "Sab kuch normal hai".
        3. "advice": Patient ke liye basic health advice (Hinglish mein).
        CRITICAL: Valid JSON only. Do NOT use markdown (```json).
        """
        response = generate_with_fallback([prompt, img])
        response_text = response.text.strip()
        
        if response_text.startswith("```json"): response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"): response_text = response_text[3:-3].strip()

        return jsonify({"status": "success", "data": json.loads(response_text)})
    except Exception as e:
        return jsonify({"error": f"Lab Analysis Error: {str(e)}"}), 500

# ================= 9. AI FOOD CALORIE SCANNER API =================
@app.route('/api/analyze-food', methods=['POST'])
def analyze_food():
    if 'file' not in request.files: return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']

    try:
        img = Image.open(file.stream)
        prompt = """
        Tum ek expert Nutritionist ho. Is khane (food/plate) ki photo ko dhyan se dekho.
        Mujhe sirf valid JSON format mein yeh details do:
        1. "food_items": Plate mein kya-kya khana rakha hai uski list.
        2. "estimated_calories": Is poori plate mein lagbhag kitni total calories hain.
        3. "protein_content": Lagbhag kitna protein (grams) hoga isme.
        4. "health_score": Is khane ka health score 10 mein se kitna doge (e.g., "7/10").
        5. "advice": Is khane ko aur healthy kaise banayein (Hindi Devanagari mein).
        CRITICAL: Valid JSON only. Do NOT use markdown (```json).
        """
        response = generate_with_fallback([prompt, img])
        response_text = response.text.strip()
        
        if response_text.startswith("```json"): response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"): response_text = response_text[3:-3].strip()

        return jsonify({"status": "success", "data": json.loads(response_text)})
    except Exception as e:
        return jsonify({"error": f"Food Analysis Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)