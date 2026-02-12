# image_predict.py - FIXED VERSION
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import io
from PIL import Image

app = FastAPI(title="Civic Eye Image Classifier")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = "civic_eye_model.h5"
model = tf.keras.models.load_model(MODEL_PATH)

# Original class labels from your model
original_class_labels = ["garbage", "pothole", "streetlight", "water_leakage"]

# ✅ FIXED: Use exact department names that match backend database
department_mapping = {
    "garbage": "sanitation_dept",
    "pothole": "road_dept", 
    "streetlight": "electricity_dept",
    "water_leakage": "water_dept"
}

def preprocess_image(file_bytes):
    """Preprocess image for model prediction"""
    img = Image.open(io.BytesIO(file_bytes))
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    return img_array

@app.get("/")
async def root():
    return {"message": "Civic Eye Image Model API"}

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "File must be an image")
    
    try:
        # Read and preprocess image
        image_bytes = await file.read()
        processed_image = preprocess_image(image_bytes)
        
        # Predict
        predictions = model.predict(processed_image)
        class_idx = np.argmax(predictions[0])
        original_pred = original_class_labels[class_idx]
        confidence = float(predictions[0][class_idx]) * 100
        
        # Map to department (lowercase with underscore)
        department = department_mapping.get(original_pred, "other")
        
        print(f"🤖 Image Prediction: {original_pred} -> {department} ({confidence:.2f}%)")
        
        return {
            "prediction": department,
            "original_prediction": original_pred,
            "confidence": round(confidence, 2),
            "success": True
        }
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        raise HTTPException(500, f"Prediction error: {str(e)}")