import argparse
from pathlib import Path
import pandas as pd
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "model.joblib"
ALT_MODEL_PATH = MODEL_DIR / "model.pkl"


def get_model():
    """Loads the trained model or triggers training if not yet built."""
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    elif ALT_MODEL_PATH.exists():
        return joblib.load(ALT_MODEL_PATH)
    else:
        from src.train import train
        return train()


def predict_placement(cgpa: float, aptitude: float, internship: int) -> dict:
    """Predicts placement classification and probability for given student features."""
    model = get_model()
    
    input_data = pd.DataFrame([{
        "cgpa": float(cgpa),
        "aptitude": float(aptitude),
        "internship": int(internship)
    }])

    prediction = int(model.predict(input_data)[0])
    probabilities = model.predict_proba(input_data)[0]
    placed_prob = float(probabilities[1])

    status = "PLACED" if prediction == 1 else "NOT PLACED"

    return {
        "cgpa": cgpa,
        "aptitude": aptitude,
        "internship": internship,
        "prediction": prediction,
        "status": status,
        "placement_probability": placed_prob
    }


def main():
    parser = argparse.ArgumentParser(
        description="Predict student campus placement probability using trained Logistic Regression model."
    )
    parser.add_argument("--cgpa", type=float, required=True, help="Student Cumulative Grade Point Average (0-10)")
    parser.add_argument("--aptitude", type=float, required=True, help="Aptitude assessment score (0-100)")
    parser.add_argument("--internship", type=int, required=True, help="Number of completed internships")

    args = parser.parse_args()
    result = predict_placement(args.cgpa, args.aptitude, args.internship)

    print("\n" + "=" * 55)
    print("      STUDENT CAMPUS PLACEMENT PREDICTION REPORT      ")
    print("=" * 55)
    print(f"CGPA:                  {result['cgpa']}")
    print(f"Aptitude Score:        {result['aptitude']}")
    print(f"Internships Completed: {result['internship']}")
    print("-" * 55)
    print(f"Outcome Prediction:    {result['status']}")
    print(f"Placement Probability: {result['placement_probability'] * 100:.2f}%")
    print("=" * 55 + "\n")


if __name__ == "__main__":
    main()
