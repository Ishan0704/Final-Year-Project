import os
import pandas as pd
import joblib
import gdown  # Import gdown to download files from Google Drive
from flask import Flask, request, render_template, jsonify

# Initialize Flask app
app = Flask(__name__)

# Google Drive File IDs
file_links = {
    "csv": "1fZ3WHUKAO3mBDg5DpFtD2jOKu6ZlP4w5",
    "rf_model": "1ez_GO8NrvV1jQ3qPVFtTpkWXIlZdbJW2",
    "dt_model": "1qhmvOVif1Ogxb3bsaYjPGoiZtK4s5TzY",
    "lgbm_model": "1QQV104_wKfqSPC7PbpI-gPB_JVZo46Qs",
    "scaler": "1Uk_qd5_q9uTiIoIic56xKzKPakd2JmEb"
}

# Function to download files
def download_file(file_id, output_path):
    url = f"https://drive.google.com/uc?id={file_id}"
    gdown.download(url, output_path, quiet=False)

# Download and load the dataset
csv_path = "MongoDB_data.csv"
download_file(file_links["csv"], csv_path)
df = pd.read_csv(csv_path)

# Download and load ML models and scaler
model_paths = {
    "Random Forest": "Random_Forest_model.pkl",
    "Decision Tree": "Decision_tree_model.pkl",
    "LightGBM": "Light_GBM_model.pkl"
}

for model_name, file_key in zip(model_paths.keys(), ["rf_model", "dt_model", "lgbm_model"]):
    download_file(file_links[file_key], model_paths[model_name])

models = {name: joblib.load(path) for name, path in model_paths.items()}

scaler_path = "scaler.pkl"
download_file(file_links["scaler"], scaler_path)
scaler = joblib.load(scaler_path)

# Function to preprocess input
def preprocess_input(address):
    row = df[df["address"] == address]

    if row.empty:
        return None

    features = row[["year", "day", "length", "weight", "count", "looped", "neighbors", "income"]]
    scaled_features = scaler.transform(features)

    return scaled_features, row["label"].values[0], row["target"].values[0]

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        address = request.form["address"]

        result = preprocess_input(address)
        if result is None:
            return jsonify({"error": "Address not found in dataset"})

        scaled_input, actual_label, actual_target = result
        predictions = {name: int(model.predict(scaled_input)[0]) for name, model in models.items()}
        majority_prediction = int(sum(predictions.values()) > 1)

        return jsonify({
            "address": address,
            "predictions": predictions,
            "majority_prediction": majority_prediction,
            "actual_target": int(actual_target)
        })

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
