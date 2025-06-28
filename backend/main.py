from flask import Flask, request, send_file, jsonify, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
from color_detect import detect_dominant_color_object
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return jsonify({"message": "Color Detection API is live"}), 200

@app.route('/detect', methods=['POST'])
def detect_color():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(file.filename)
    input_path = os.path.join(UPLOAD_FOLDER, filename)
    output_path = os.path.join(OUTPUT_FOLDER, f"result_{filename}")

    file.save(input_path)

    try:
        dominant_rgb = detect_dominant_color_object(input_path, output_path)
        dominant_hex = '#%02x%02x%02x' % tuple(dominant_rgb)

        response = make_response(send_file(output_path, mimetype='image/jpeg'))
        response.headers['X-Dominant-Color-RGB'] = str(dominant_rgb)
        response.headers['X-Dominant-Color-HEX'] = dominant_hex
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500
