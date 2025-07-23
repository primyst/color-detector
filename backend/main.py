from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import webcolors
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

def closest_color_name(requested_rgb):
    min_distance = float("inf")
    closest_name = None
    for name, hex in webcolors.CSS3_NAMES_TO_HEX.items():
        r, g, b = webcolors.hex_to_rgb(hex)
        distance = np.sqrt((r - requested_rgb[0])**2 + (g - requested_rgb[1])**2 + (b - requested_rgb[2])**2)
        if distance < min_distance:
            min_distance = distance
            closest_name = name
    return closest_name

@app.route('/detect', methods=['POST'])
def detect_color_objects():
    file = request.files['image']
    img = Image.open(file.stream).convert('RGB')
    img_np = np.array(img)
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    blurred = cv2.GaussianBlur(img_bgr, (11, 11), 0)
    hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)

    mask = cv2.inRange(hsv, (0, 50, 50), (180, 255, 255))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    colors_found = []

    for cnt in contours:
        if cv2.contourArea(cnt) < 500:
            continue

        x, y, w, h = cv2.boundingRect(cnt)
        roi = img_bgr[y:y+h, x:x+w]
        mean_color = cv2.mean(roi)[:3]  # BGR
        mean_rgb = tuple(int(c) for c in mean_color[::-1])  # RGB

        name = closest_color_name(mean_rgb)
        label = f"{name} {mean_rgb}"

        cv2.rectangle(img_bgr, (x, y), (x+w, y+h), mean_color, 2)
        cv2.putText(img_bgr, label, (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, mean_color, 2)
        colors_found.append({'rgb': mean_rgb, 'name': name})

    # Convert to base64 for React
    _, buffer = cv2.imencode('.png', img_bgr)
    encoded_image = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        'detectedImage': encoded_image,
        'detectedColors': colors_found
    })

if __name__ == '__main__':
    app.run(debug=True)