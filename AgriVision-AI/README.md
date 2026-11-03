# AgriVision AI

A simple college demonstration project for plant leaf disease detection and treatment guidance using MobileNetV2 transfer learning, TensorFlow/Keras, Pillow, NumPy, and Streamlit.

## Local Streamlit run

1. Create a Python 3.8+ environment.
2. Install dependencies: `pip install -r requirements.txt`
3. Add a balanced PlantVillage subset under `data/`, using the eight class folder names in `train.py`.
4. Train once: `python train.py`
5. Start the app: `streamlit run app.py`

The trained model is saved to `model/plant_disease_model.keras`. The recommendation content is local and stored in `disease_info.json`; it is general guidance, not professional agricultural advice.

## Included preview

The Next.js preview in this repository presents the same upload → model pipeline → result workflow as a polished demonstration surface. The Streamlit app is the local Python implementation intended for running the actual TensorFlow model.
