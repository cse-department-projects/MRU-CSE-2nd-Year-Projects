import pytest
from pathlib import Path
import pandas as pd
from src.train import load_or_generate_data, train
from src.predict import predict_placement, get_model


def test_dataset_generation_and_schema():
    df = load_or_generate_data()
    assert isinstance(df, pd.DataFrame), "Data must be loaded as a pandas DataFrame"
    assert not df.empty, "Dataset must not be empty"
    expected_cols = {"cgpa", "aptitude", "internship", "placed"}
    assert expected_cols.issubset(set(df.columns)), f"Missing expected columns: {expected_cols - set(df.columns)}"
    assert df["placed"].isin([0, 1]).all(), "Target 'placed' column must contain only 0 and 1"


def test_model_training_and_serialization():
    model = train()
    assert model is not None, "Trained model should not be None"
    assert hasattr(model, "predict"), "Model must implement predict()"
    assert hasattr(model, "predict_proba"), "Model must implement predict_proba()"


def test_sample_prediction_high_profile():
    # Strong academic and internship profile -> should predict Placed
    res = predict_placement(cgpa=8.5, aptitude=85.0, internship=2)
    assert res["prediction"] == 1
    assert res["status"] == "PLACED"
    assert res["placement_probability"] > 0.5


def test_sample_prediction_low_profile():
    # Weak academic and 0 internships -> should predict Not Placed
    res = predict_placement(cgpa=5.2, aptitude=35.0, internship=0)
    assert res["prediction"] == 0
    assert res["status"] == "NOT PLACED"
    assert res["placement_probability"] < 0.5


def test_exact_user_prediction_case():
    # Exact user command: --cgpa 8.1 --aptitude 78 --internship 1
    res = predict_placement(cgpa=8.1, aptitude=78.0, internship=1)
    assert res["prediction"] == 1
    assert res["status"] == "PLACED"
    assert 0.0 <= res["placement_probability"] <= 1.0
