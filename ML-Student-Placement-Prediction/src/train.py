import os
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"
DATA_PATH = DATA_DIR / "placement_data.csv"
MODEL_PATH = MODEL_DIR / "model.joblib"
ALT_MODEL_PATH = MODEL_DIR / "model.pkl"


def load_or_generate_data() -> pd.DataFrame:
    """Loads existing dataset from CSV or generates a synthetic one if missing."""
    if DATA_PATH.exists():
        df = pd.read_csv(DATA_PATH)
    else:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        np.random.seed(42)
        n = 500
        cgpa = np.clip(np.random.normal(7.5, 1.0, n), 5.0, 10.0)
        aptitude = np.clip(np.random.normal(70.0, 15.0, n), 30.0, 100.0)
        internship = np.random.choice([0, 1, 2], size=n, p=[0.4, 0.4, 0.2])
        
        # Logistic probability equation: higher cgpa, aptitude, internship -> placed
        logits = -11.0 + 1.15 * cgpa + 0.045 * aptitude + 1.2 * internship
        prob = 1.0 / (1.0 + np.exp(-logits))
        placed = (prob > 0.5).astype(int)

        df = pd.DataFrame({
            "cgpa": np.round(cgpa, 2),
            "aptitude": np.round(aptitude, 1),
            "internship": internship,
            "placed": placed
        })
        df.to_csv(DATA_PATH, index=False)
        print(f"Generated synthetic placement dataset at: {DATA_PATH}")

    return df


def train() -> LogisticRegression:
    """Trains a Logistic Regression classifier on student placement data."""
    print("=" * 65)
    print("     Student Placement Prediction - Model Training Pipeline     ")
    print("=" * 65)

    df = load_or_generate_data()
    print(f"Total student records: {len(df)}")
    print(f"Placement distribution:\n{df['placed'].value_counts(normalize=True).rename({0: 'Not Placed', 1: 'Placed'})}\n")

    features = ["cgpa", "aptitude", "internship"]
    X = df[features]
    y = df["placed"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training Logistic Regression classifier...")
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    print("\n" + "-" * 40)
    print("        Evaluation Results            ")
    print("-" * 40)
    print(f"Accuracy:  {acc:.4f} ({acc * 100:.2f}%)")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=["Not Placed", "Placed"]))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(model, ALT_MODEL_PATH)
    print(f"Model saved under {MODEL_DIR}/:")
    print(f" - {MODEL_PATH.name}")
    print(f" - {ALT_MODEL_PATH.name}")
    print("=" * 65)

    return model


if __name__ == "__main__":
    train()
