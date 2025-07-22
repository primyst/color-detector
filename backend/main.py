from flask import Flask, request, send_file, jsonify
from PIL import Image
import numpy as np
from collections import Counter
from io import BytesIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return 'Color Detector API is running.'

@app.route('/detect', methods=['POST'])
def detect_color():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image part'}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Resize and convert image to RGB
        image = Image.open(image_file.stream).convert('RGB')
        image = image.resize((150, 150))
        pixels = np.array(image).reshape(-1, 3)

        # Count colors and get top 5
        counter = Counter(map(tuple, pixels))
        most_common = counter.most_common(5)  # Top 5 colors

        # Convert RGB tuples to HEX
        dominant_colors = [f"#{r:02x}{g:02x}{b:02x}" for (r, g, b), _ in most_common]

        # Save image to buffer (for preview on frontend)
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)

        # Return colors as JSON
        return jsonify({
            'dominantColors': dominant_colors
        })

    except Exception as e:
        print('Error during /detect:', e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)