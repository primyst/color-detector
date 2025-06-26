from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from color_detect import detect_dominant_color_object
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return 'Color Detector API is live!'

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    filename = secure_filename(file.filename)
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(image_path)

    output_path = os.path.join(OUTPUT_FOLDER, f"result_{filename}")
    output_path, color_name = detect_dominant_color_object(image_path, output_path)

    return jsonify({
        "image": f"/get-image/{os.path.basename(output_path)}",
        "color": color_name
    })

@app.route('/get-image/<filename>')
def get_image(filename):
    return send_file(os.path.join(OUTPUT_FOLDER, filename), mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
