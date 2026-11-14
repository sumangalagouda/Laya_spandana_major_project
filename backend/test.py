import joblib
from tensorflow.keras.models import load_model

scaler = joblib.load("models/scaler.joblib")
model = load_model("models/best_mlp_model.keras")

print("scaler features:", scaler.n_features_in_)
print("feature names:", getattr(scaler, "feature_names_in_", "not stored"))
print("first 9 means:", scaler.mean_[:9])
print("model input:", model.input_shape, "-> output:", model.output_shape)