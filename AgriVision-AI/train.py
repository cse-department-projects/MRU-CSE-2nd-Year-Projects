from pathlib import Path
import tensorflow as tf

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
DATA_DIR = Path('data')
MODEL_PATH = Path('model/plant_disease_model.keras')

classes = [
    'Tomato Healthy', 'Tomato Early Blight', 'Tomato Late Blight',
    'Potato Healthy', 'Potato Early Blight', 'Potato Late Blight',
    'Pepper Healthy', 'Pepper Bacterial Spot'
]

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR, image_size=IMAGE_SIZE, batch_size=BATCH_SIZE,
    validation_split=0.2, subset='training', seed=42, class_names=classes,
)
val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR, image_size=IMAGE_SIZE, batch_size=BATCH_SIZE,
    validation_split=0.2, subset='validation', seed=42, class_names=classes,
)

base = tf.keras.applications.MobileNetV2(input_shape=(*IMAGE_SIZE, 3), include_top=False, weights='imagenet')
base.trainable = False
model = tf.keras.Sequential([
    tf.keras.layers.Rescaling(1 / 255.0), base,
    tf.keras.layers.GlobalAveragePooling2D(), tf.keras.layers.Dense(len(classes), activation='softmax')
])
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(train_ds, validation_data=val_ds, epochs=8)
MODEL_PATH.parent.mkdir(exist_ok=True)
model.save(MODEL_PATH)
print(f'Saved model to {MODEL_PATH}')
