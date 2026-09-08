import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle

print("⏳ Data taiyar kar rahe hain...")
# Dummy Data: [Age, BMI, Glucose Level, Blood Pressure]
# 1000 random patients ka data generate kar rahe hain
np.random.seed(42)
X = np.random.rand(1000, 4) * [60, 20, 100, 60] + [20, 18, 80, 80] 

# Logic for risk: Agar Glucose > 140 aur BMI > 25 hai, ya Age > 55 hai, toh High Risk (1)
y = ((X[:, 2] > 140) & (X[:, 1] > 25) | (X[:, 0] > 55)).astype(int)

print("⏳ Model train ho raha hai...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Train kiye hue model ko save karna
with open('health_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ Model successfully train ho gaya aur 'health_model.pkl' ke naam se save ho gaya!")