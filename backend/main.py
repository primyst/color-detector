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
    from PIL import Image
    import numpy as np
    from collections import Counter
    from io import BytesIO
    import base64
    from flask import request, jsonify

    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Open and process image
    image = Image.open(image_file.stream).convert('RGB')
    image = image.resize((150, 150))
    pixels = np.array(image).reshape(-1, 3)

    # Get top 5 dominant colors
    counter = Counter(map(tuple, pixels))
    most_common = counter.most_common(5)
    dominant_colors = [f"#{r:02x}{g:02x}{b:02x}" for (r, g, b), _ in most_common]

    # Convert processed image to base64
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    encoded_img = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return jsonify({
        'dominantColors': dominant_colors,
        'detectedImage': encoded_img
    })
    except Exception as e:
        print('Error during /detect:', e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)