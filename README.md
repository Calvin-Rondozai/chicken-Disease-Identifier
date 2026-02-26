# chicken-Disease-Identifier
This is an AI-powered poultry health diagnosis web application designed to detect diseases in chickens by analyzing fecal samples

# HealthyHen — Poultry Disease Classifier

An AI-powered web application designed to detect diseases in chickens by analyzing fecal sample images using deep learning.

## Overview

**HealthyHen** classifies chicken fecal samples into four categories:
- **Healthy** 🟢 — No disease detected
- **Coccidiosis** 🟠 — Parasitic intestinal infection
- **Newcastle Disease** 🔴 — Highly contagious viral disease
- **Salmonella** 🟡 — Bacterial infection

Each prediction includes a **confidence percentage** and a **Grad-CAM heatmap** showing which image regions influenced the classification decision.

## Features

✨ **Core Functionality**
- 🖼️ **Drag-and-drop upload** with real-time image preview
- 🤖 **EfficientNetB0 neural network** for rapid, accurate classification
- 📊 **Grad-CAM visualization** — explainable AI showing model decision reasoning
- ⚠️ **Confirmation modal** — ensures users provide proper chicken fecal samples
- 🔔 **Warning sound** — audio feedback for important actions
- 📜 **Prediction history** — browser-based localStorage (up to 50 records)
- 📱 **Responsive design** — modern glassmorphism UI with animations
- 🎯 **Auto-scroll** — results auto-scroll into view after prediction

## Tech Stack

**Backend**
- Flask (Python web framework)
- TensorFlow/Keras (deep learning)
- NumPy, OpenCV (image processing)
- Gunicorn (production WSGI server)

**Frontend**
- HTML5, CSS3, JavaScript (vanilla)
- Google Fonts (Syne, DM Mono, DM Sans)
- Modern CSS animations & glassmorphism

**Model**
- **EfficientNetB0** — efficient deep learning architecture
- Input: 224×224 RGB images
- Output: 4-class probabilities + confidence scores

## Installation

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Windows/macOS/Linux with 2+ GB free disk space

### Setup Steps

1. **Clone or extract the repository**
   ```bash
   cd Chicken-Disease-Identifier/chicken_disease_app
   ```

2. **Create a virtual environment** (optional but recommended)
   ```bash
   python -m venv venv
   ```
   
   Activate on **Windows**:
   ```bash
   venv\Scripts\activate
   ```
   
   Activate on **macOS/Linux**:
   ```bash
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify model files exist**
   ```
   model/
   ├── chicken_disease_model_efficientnetb0_final.h5
   └── label_encoder.pkl
   ```
   (These should be included in the repository)

5. **Run the application**
   ```bash
   python app.py
   ```
   
   The app will start at `http://localhost:5000`

## Usage

### Upload & Analyze
1. Open `http://localhost:5000` in your browser
2. **Drag and drop** a fecal sample image (JPG, PNG, WEBP, up to 16MB)
   - Or click **"Select Image"** to browse
3. **Preview** the image and click **"Analyze"**
4. **Confirm** the sample is a poultry fecal image
5. **Wait** for prediction (10-30 seconds depending on hardware)
6. **View results**:
   - Predicted disease class
   - Confidence percentage
   - All class probabilities
   - Grad-CAM heatmap visualization

### View History
- Navigate to **"History"** tab to see past predictions
- Results are stored in browser localStorage (persists across sessions)
- Up to 50 most recent predictions retained

### Best Practices
- ✅ **Clear, close-up photos** of fecal samples (not blurry)
- ✅ **Well-lit** images (natural or artificial light)
- ✅ **Uniform background** to isolate the sample
- ❌ Avoid: grainy, dark, or contaminated images
- ❌ Avoid: non-poultry samples (model trained on chicken only)

## API Endpoints

### `GET /` — Main page
Returns the home/analysis page with optional prediction results.

### `POST /` — Analysis endpoint
**Request**: Multipart form with `file` parameter  
**Response**: HTML with:
- `prediction` — Classified disease (string)
- `confidence` — Confidence percentage (0-100)
- `image_path` — Uploaded file path
- `probabilities` — Dict of all class scores
- `disease_color` — Hex color for disease

### `GET /gradcam` — Heatmap polling
**Query Parameters**: `filename` — uploaded filename  
**Response**: 
```json
{
  "gradcam": "<base64-png>",
  "ready": true
}
```
Returns `{"ready": false}` while generating.

### `GET /about` — History/info page
Displays prediction history dashboard.

### `GET /debug-gradcam` — Diagnostics
Returns Grad-CAM cache status and test results (development use).

## Model Details

### Architecture
- **Base Model**: EfficientNetB0 (pre-trained on ImageNet)
- **Input Size**: 224 × 224 × 3 (RGB)
- **Classes**: 4 (Healthy, Coccidiosis, Newcastle Disease, Salmonella)
- **Training**: Transfer learning with fine-tuning

### Grad-CAM Visualization
Uses **occlusion-based saliency mapping**:
1. Divides image into 7×7 grid
2. Iteratively "greys out" each patch
3. Measures confidence drop for target class
4. Creates heatmap showing importance regions
5. Overlays heatmap (45%) + original image (55%)

This approach is model-agnostic and works regardless of architecture complexity.

## Project Structure

```
Chicken-Disease-Identifier/
├── chicken_disease_app/
│   ├── app.py                           # Flask server & routes
│   ├── requirements.txt                 # Python dependencies
│   ├── model/
│   │   ├── chicken_disease_model_efficientnetb0_final.h5
│   │   └── label_encoder.pkl
│   ├── pages/
│   │   ├── index.html                   # Main upload page
│   │   ├── prediction.html              # Results page
│   │   ├── about.html                   # History dashboard
│   │   └── dashboard.html               # Analytics (optional)
│   └── static/
│       ├── css/
│       │   └── style.css                # UI styling
│       ├── js/
│       │   ├── main.js                  # Upload & prediction logic
│       │   └── chatbot.js               # Chat feature (optional)
│       ├── uploads/                     # User-uploaded images
│       ├── image/                       # Asset images
│       └── history/                     # Cache directory
├── README.md                             # This file
└── run venv.txt                          # Virtual env setup notes
```

## File Descriptions

### `app.py`
- Loads pre-trained EfficientNetB0 model
- Handles image uploads and predictions
- Generates Grad-CAM heatmaps (threaded, in-memory cache)
- Serves static files and HTML templates

### `main.js`
- Drag-and-drop file handling
- Confirmation modal UI
- Form submission to Flask backend
- localStorage history management
- Grad-CAM polling (60 attempts, 1.5s intervals)
- Warning sound generation (Web Audio API)

### `style.css`
- Modern glassmorphism design
- Smooth animations (fade, pop, slide)
- Responsive grid layout
- Dark theme with accent colors

## Browser LocalStorage

The app saves prediction history to browser localStorage under key `healthyhen_history`:

```javascript
{
  id: timestamp,
  prediction: "Coccidiosis",
  confidence: 94.5,
  imagePath: "static/uploads/chicken_001.jpg",
  imageFilename: "chicken_001.jpg",
  probabilities: {
    "Healthy": 2.1,
    "Coccidiosis": 94.5,
    "Newcastle Disease": 1.2,
    "Salmonella": 2.2
  },
  timestamp: "2026-02-26T14:30:45.123Z"
}
```

**Max records**: 50 (oldest automatically pruned)

## Performance Notes

- **Model size**: ~100 MB (H5 format)
- **Prediction time**: 5-15 seconds (depends on hardware)
- **Grad-CAM generation**: 10-30 seconds (7×7 occlusion grid)
- **Memory usage**: ~500 MB during operation (model + cache)

### Production Deployment
For production, use gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

### Model not found
Ensure `model/chicken_disease_model_efficientnetb0_final.h5` and `model/label_encoder.pkl` exist in the project root.

### Slow predictions
- Check available RAM (model requires ~500 MB)
- GPU acceleration: Install `tensorflow-gpu` for CUDA support
- Reduce concurrent users (single-threaded model inference)

### Grad-CAM timeout
- Increases attempts limit in `main.js` (default: 60 × 1.5s = 90s max)
- Check browser console for polling errors
- Use `/debug-gradcam` endpoint to diagnose

### Browser storage full
- LocalStorage has 5-10 MB limit per domain
- History auto-limits to 50 records
- Clear manually: Open DevTools → Application → LocalStorage → Delete `healthyhen_history`

## Research & Attribution

This project uses:
- **EfficientNet** — Tan & Le (2019) - Efficient and Scalable CNNs
- **Transfer Learning** — Fine-tuned on poultry disease datasets
- **Grad-CAM** — Selvaraju et al. (2016) - Visual Explanations from CNNs

## License

Specify your license here (MIT, Apache 2.0, etc.)

## Contact & Support

For bugs, feature requests, or questions:
- Create an issue in the repository
- Check the `/debug-gradcam` endpoint for diagnostic info

---

**Status**: Production-ready  
**Last Updated**: February 2026  
**Python Version**: 3.8+  
**TensorFlow**: 2.15+
