import joblib
import numpy as np

clf = joblib.load("text_classifier.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

def predict_department_from_text(text):
    # Preprocess text
    text_proc = text.lower().strip()
    
    # Vectorize and predict
    vec = vectorizer.transform([text_proc])
    pred = clf.predict(vec)[0]
    proba = clf.predict_proba(vec)[0]
    
    # Get confidence and top 3 predictions
    confidence = float(max(proba)) * 100
    top_idx = np.argsort(proba)[::-1][:3]
    top3 = [(clf.classes_[i], float(proba[i])*100) for i in top_idx]
    
    print(f"🤖 Text Prediction: {pred} (confidence: {confidence:.2f}%)")
    
    return pred, round(confidence, 2), top3

if __name__ == "__main__":
    s = input("Enter complaint text: ")
    dept, conf, top3 = predict_department_from_text(s)
    print(f"\nPredicted Department: {dept}  |  Confidence: {conf}%")
    print("Top 3:")
    for c, p in top3:
        print(f"  {c}: {p:.2f}%")