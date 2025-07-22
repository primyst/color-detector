import os
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from color_detect import detect_dominant_colors
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return 'Color Detector API is running.'

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
        dominant_colors = detect_dominant_colors(input_path, output_path, n_colors=3)
        hex_colors = ['#%02x%02x%02x' % tuple(rgb) for rgb in dominant_colors]
        return send_file(
            output_path,
            mimetype='image/jpeg',
            as_attachment=False,
            download_name='detected.jpg',
            conditional=True,
            headers={
                'X-Dominant-Colors-RGB': str(dominant_colors),
                'X-Dominant-Colors-HEX': str(hex_colors)
            }
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500