import json
from pathlib import Path
import numpy as np
import streamlit as st
import tensorflow as tf
from PIL import Image

CLASSES = ['Tomato Healthy', 'Tomato Early Blight', 'Tomato Late Blight', 'Potato Healthy', 'Potato Early Blight', 'Potato Late Blight', 'Pepper Healthy', 'Pepper Bacterial Spot']

@st.cache_resource
def load_model():
    return tf.keras.models.load_model('model/plant_disease_model.keras')

@st.cache_data
def load_info():
    return json.loads(Path('disease_info.json').read_text())

def preprocess(image):
    image = image.convert('RGB').resize((224, 224))
    return np.expand_dims(np.asarray(image) / 255.0, axis=0)

st.set_page_config(page_title='AgriVision AI', page_icon='leaf', layout='centered')
st.title('AgriVision AI')
st.caption('AI-Powered Plant Disease Detection & Treatment Recommendation')
uploaded = st.file_uploader('Upload a plant leaf image', type=['jpg', 'jpeg', 'png'])
if uploaded:
    image = Image.open(uploaded)
    st.image(image, caption='Uploaded leaf image', width=320)
    with st.spinner('Processing image with MobileNetV2...'):
        prediction = load_model().predict(preprocess(image), verbose=0)[0]
    label = CLASSES[int(np.argmax(prediction))]
    info = load_info()[label]
    st.success(f'Predicted disease: {info["name"]}')
    st.metric('Confidence', f'{float(np.max(prediction)) * 100:.2f}%')
    for key in ['symptoms', 'cause', 'treatment', 'prevention']:
        st.write(f'**{key.title()}:** {info[key]}')
    st.warning('This is general guidance only, not professional agricultural advice.')
