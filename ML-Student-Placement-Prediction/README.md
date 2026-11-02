# ML-Student-Placement-Prediction

A Python Machine Learning project that predicts whether a student will secure campus placement based on academic metrics, aptitude test scores, and internship experience.

[![Python ML project checks](https://github.com/2511cs010100-pixel/ML-Student-Placement-Prediction/actions/workflows/python-ml-checks.yml/badge.svg)](https://github.com/2511cs010100-pixel/ML-Student-Placement-Prediction/actions)

---

## Project Structure

```
ML-Student-Placement-Prediction/
├── .github/
│   └── workflows/
│       └── python-ml-checks.yml   # GitHub Actions automated CI testing
├── data/
│   └── placement_data.csv         # Synthetic campus recruitment dataset
├── models/
│   ├── model.joblib               # Serialized Logistic Regression model
│   └── model.pkl                  # Serialized pickle backup
├── src/
│   ├── __init__.py
│   ├── train.py                   # Data ingestion, splitting, training & evaluation
│   └── predict.py                 # Command-line prediction interface
├── tests/
│   ├── __init__.py
│   └── test_model.py              # Pytest unit tests for model & predictions
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Getting Started

### 1. Check Python Version
```powershell
py --version
# or
python --version
```

### 2. Create and Activate Virtual Environment
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Train the Model
Trains a Logistic Regression classifier, evaluates classification metrics (Accuracy, Precision, Recall, F1), and saves model checkpoints to `models/`:
```powershell
python -m src.train
```

### 5. Test a Sample Prediction
Run prediction from the command line:
```powershell
python -m src.predict --cgpa 8.1 --aptitude 78 --internship 1
```

### 6. Run the Test Suite
Execute automated unit tests:
```powershell
python -m pytest -q
```

---

## Automated CI/CD
The repository includes a GitHub Actions workflow named **`Python ML project checks`** (`.github/workflows/python-ml-checks.yml`). On every push and pull request, the workflow:
1. Checks out the code.
2. Sets up Python 3.11 with pip caching.
3. Installs requirements.
4. Executes model training.
5. Runs sample inference CLI.
6. Executes all automated `pytest` tests.
