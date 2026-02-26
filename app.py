from flask import Flask, request, render_template, jsonify
import numpy as np
from tensorflow.keras.models import load_model, Model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import pickle
import os
import base64
import cv2
import tensorflow as tf
import threading

app = Flask(__name__, template_folder="pages")

# ── Load model ────────────────────────────────────────────
model_path = os.path.join("model", "chicken_disease_model_efficientnetb0_final.h5")
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model not found at: {model_path}")
model = load_model(model_path)

label_encoder_path = os.path.join("model", "label_encoder.pkl")
if not os.path.exists(label_encoder_path):
    raise FileNotFoundError(f"Label encoder not found at: {label_encoder_path}")
with open(label_encoder_path, "rb") as f:
    label_encoder = pickle.load(f)

UPLOAD_FOLDER = os.path.join("static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

DISEASE_COLORS = {
    "Coccidiosis": "#FF6B35",
    "Healthy": "#2ECC71",
    "Newcastle Disease": "#E74C3C",
    "Salmonella": "#F39C12",
}

# ── In-memory gradcam cache: filename -> base64 string ───
_gradcam_cache = {}
_cache_lock = threading.Lock()


# ── Grad-CAM++ ────────────────────────────────────────────
def find_last_conv_layer(m):
    """Recursively find last conv layer — handles EfficientNet nested structure."""
    last_conv = None
    for layer in m.layers:
        if hasattr(layer, "layers"):
            inner = find_last_conv_layer(layer)
            if inner:
                last_conv = inner
        else:
            try:
                if len(layer.output_shape) == 4:
                    last_conv = layer.name
            except Exception:
                pass
    return last_conv


def generate_gradcam(img_array, class_idx):
    """
    Occlusion-based saliency map — works regardless of model graph structure.
    7x7 grid, each patch greyed out, importance = score drop for target class.
    """
    try:
        img = img_array[0]  # (224,224,3)
        orig_score = float(model.predict(img_array, verbose=0)[0][class_idx])

        grid = 7
        patch_h = 224 // grid
        patch_w = 224 // grid
        cam = np.zeros((grid, grid), dtype=np.float32)

        for row in range(grid):
            for col in range(grid):
                occluded = img.copy()
                r1, r2 = row * patch_h, (row + 1) * patch_h
                c1, c2 = col * patch_w, (col + 1) * patch_w
                occluded[r1:r2, c1:c2] = 0.5
                score = float(
                    model.predict(np.expand_dims(occluded, 0), verbose=0)[0][class_idx]
                )
                cam[row, col] = max(orig_score - score, 0)

        cam = cam / (cam.max() + 1e-10)
        cam_resized = cv2.resize(cam, (224, 224))
        heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
        heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        orig_uint8 = (img * 255).astype(np.uint8)
        overlay = (heatmap * 0.45 + orig_uint8 * 0.55).astype(np.uint8)

        _, buffer = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
        print("[GradCAM] Occlusion heatmap generated OK")
        return base64.b64encode(buffer).decode("utf-8")

    except Exception as e:
        import traceback

        print(f"[GradCAM error] {e}")
        print(traceback.format_exc())
        return None


def _background_gradcam(filename, img_array, class_idx):
    """Run gradcam in background thread and store result in cache."""
    b64 = generate_gradcam(img_array, class_idx)
    if b64:
        with _cache_lock:
            _gradcam_cache[filename] = b64
        print(f"[GradCAM] Cached for {filename}")
    else:
        print(f"[GradCAM] Failed for {filename}")


# ── Routes ────────────────────────────────────────────────
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "GET":
        return render_template("index.html")

    if "file" not in request.files:
        return render_template("index.html", error="No file uploaded.")
    file = request.files["file"]
    if file.filename == "":
        return render_template("index.html", error="No file selected.")

    filename = file.filename
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    img = load_img(filepath, target_size=(224, 224))
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    preds = model.predict(img_array, verbose=0)
    predicted_idx = int(np.argmax(preds, axis=1)[0])
    confidence = float(np.max(preds)) * 100
    predicted_label = label_encoder.classes_[predicted_idx]
    disease_color = DISEASE_COLORS.get(predicted_label, "#00d4ff")

    probabilities = {
        label_encoder.classes_[i]: round(float(preds[0][i]) * 100, 2)
        for i in range(len(label_encoder.classes_))
    }

    # Generate gradcam synchronously so it is ready before page loads
    # (occlusion takes ~10-30s but page load already takes that long with model.predict)
    b64 = generate_gradcam(img_array, predicted_idx)
    if b64:
        with _cache_lock:
            _gradcam_cache[filename] = b64

    image_path = filepath.replace("\\", "/")

    return render_template(
        "index.html",
        prediction=predicted_label,
        confidence=confidence,
        image_path=image_path,
        image_filename=filename,
        disease_color=disease_color,
        probabilities=probabilities,
        class_colors=DISEASE_COLORS,
    )


@app.route("/gradcam")
def gradcam():
    """
    main.js polls: GET /gradcam?filename=<filename>
    Returns {"gradcam": "<base64>"} when ready, or {"ready": false} while generating.
    """
    filename = request.args.get("filename", "")
    if not filename:
        return jsonify({"error": "No filename provided"}), 400

    # Check in-memory cache first (fast path)
    with _cache_lock:
        if filename in _gradcam_cache:
            return jsonify({"gradcam": _gradcam_cache[filename], "ready": True})

    # Not ready yet — tell JS to retry
    return jsonify({"ready": False})


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/predict", methods=["GET", "POST"])
def predict():
    if request.method == "GET":
        return render_template("prediction.html")

    if "file" not in request.files:
        return render_template("prediction.html", error="No file uploaded.")
    file = request.files["file"]
    if file.filename == "":
        return render_template("prediction.html", error="No file selected.")

    filename = file.filename
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    img = load_img(filepath, target_size=(224, 224))
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    preds = model.predict(img_array, verbose=0)
    predicted_idx = int(np.argmax(preds, axis=1)[0])
    confidence = float(np.max(preds)) * 100
    predicted_label = label_encoder.classes_[predicted_idx]

    image_path = filepath.replace("\\", "/")

    return render_template(
        "prediction.html",
        prediction=predicted_label,
        confidence=confidence,
        image_path=image_path,
    )


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/debug-gradcam")
def debug_gradcam():
    import traceback

    results = {}

    with _cache_lock:
        results["cached_filenames"] = list(_gradcam_cache.keys())

    uploads = sorted(os.listdir(app.config["UPLOAD_FOLDER"]))
    results["uploaded_files"] = uploads[-5:] if uploads else []

    if not uploads:
        results["gradcam_test"] = "NO FILES TO TEST"
        return jsonify(results)

    latest = uploads[-1]
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], latest)
    results["tested_on"] = latest

    try:
        img = load_img(filepath, target_size=(224, 224))
        arr = img_to_array(img) / 255.0
        arr = np.expand_dims(arr, axis=0)
        preds = model.predict(arr, verbose=0)
        idx = int(np.argmax(preds))
        results["predicted_class"] = label_encoder.classes_[idx]
        results["confidence"] = round(float(preds[0][idx]) * 100, 2)

        b64 = generate_gradcam(arr, idx)
        results["gradcam_test"] = "SUCCESS" if b64 else "RETURNED NONE"
        if b64:
            results["base64_length"] = len(b64)
    except Exception as e:
        results["gradcam_test"] = f"ERROR: {e}"
        results["traceback"] = traceback.format_exc()

    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True)
