# train_text_classifier.py - FIXED VERSION
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib

# 1. Load dataset
df = pd.read_csv("text_dataset.csv")

print("Dataset Info:")
print(f"Total samples: {len(df)}")
print("\nDepartment distribution:")
print(df['department'].value_counts())

# 2. ✅ FIXED: Map to standardized department names (lowercase with underscore)
department_mapping = {
    'Water Dept': 'water_dept',
    'Electricity Dept': 'electricity_dept',
    'Road Dept': 'road_dept', 
    'Sanitation Dept': 'sanitation_dept',
    'water_dept': 'water_dept', 
    'electricity_dept': 'electricity_dept',
    'road_dept': 'road_dept',
    'sanitation_dept': 'sanitation_dept'
}

# Apply mapping to standardize department names
df['department'] = df['department'].map(lambda x: department_mapping.get(x, 'other'))

print("\n✅ Standardized Department distribution:")
print(df['department'].value_counts())

# 3. Split features and labels
X = df['description']
y = df['department']

# 4. Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 5. Convert text to numbers
vectorizer = TfidfVectorizer(
    max_features=5000, 
    ngram_range=(1, 3),
    stop_words='english',
    min_df=2,
    max_df=0.9
)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# 6. Train multiple classifiers and pick the best one
print("\nTraining multiple models to find the best one...")

# Model 1: Naive Bayes
clf_nb = MultinomialNB(alpha=0.1)
clf_nb.fit(X_train_vec, y_train)
y_pred_nb = clf_nb.predict(X_test_vec)
accuracy_nb = accuracy_score(y_test, y_pred_nb)

# Model 2: Logistic Regression
clf_lr = LogisticRegression(max_iter=1000, random_state=42)
clf_lr.fit(X_train_vec, y_train)
y_pred_lr = clf_lr.predict(X_test_vec)
accuracy_lr = accuracy_score(y_test, y_pred_lr)

# Choose the best model
if accuracy_lr > accuracy_nb:
    clf = clf_lr
    best_model_name = "Logistic Regression"
    best_accuracy = accuracy_lr
else:
    clf = clf_nb
    best_model_name = "Naive Bayes"
    best_accuracy = accuracy_nb

print(f"\n✅ Best Model: {best_model_name}")
print(f"✅ Best Accuracy: {best_accuracy:.4f}")

# 7. Make predictions with best model
y_pred = clf.predict(X_test_vec)

# 8. Print results
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# 9. Save trained model and vectorizer
joblib.dump(clf, "text_classifier.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")

print("✅ Model and vectorizer saved successfully!")

# Test with common examples
test_cases = [
    "there is electricity shortage near the hospital",
    "power cut in our area",
    "water pipe leaking",
    "road has big pothole",
    "garbage not collected"
]

print("\n🧪 Testing model with sample complaints:")
for test_text in test_cases:
    test_vec = vectorizer.transform([test_text])
    prediction = clf.predict(test_vec)[0]
    probability = max(clf.predict_proba(test_vec)[0]) * 100
    print(f"  '{test_text}' -> {prediction} ({probability:.1f}%)")