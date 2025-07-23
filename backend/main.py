from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
from collections import Counter
from sklearn.cluster import KMeans
import cv2
import base64
from io import BytesIO
import webcolors

app = Flask(name)
CORS(app)

def closest_color(rgb):
min_colors = {}
for hex_value, name in webcolors.CSS3_HEX_TO_NAMES.items():
r_c, g_c, b_c = webcolors.hex_to_rgb(hex_value)
rd = (r_c - rgb[0]) ** 2
gd = (g_c - rgb[1]) ** 2
bd = (b_c - rgb[2]) ** 2
min_colors[(rd + gd + bd)] = name
return min_colors[min(min_colors.keys())]

def detect_dominant_colors_and_draw(image: Image.Image, n_colors=3):
# Convert to OpenCV format (BGR)
image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
resized = cv2.resize(image_cv, (400, 400))

# Convert to RGB and reshape for clustering  
img_rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)  
img_data = img_rgb.reshape((-1, 3))  

kmeans = KMeans(n_clusters=n_colors, random_state=42)  
kmeans.fit(img_data)  
centers = kmeans.cluster_centers_.astype(int)  

dominant_colors = []  
mask = np.zeros(img_rgb.shape[:2], dtype=np.uint8)  

for color in centers:  
    r, g, b = color  
    hex_code = f"#{r:02x}{g:02x}{b:02x}"  
    try:  
        name = webcolors.rgb_to_name((r, g, b))  
    except ValueError:  
        name = closest_color((r, g, b))  
    dominant_colors.append({  
        "rgb": f"rgb({r}, {g}, {b})",  
        "hex": hex_code,  
        "name": name  
    })  

    lower = np.clip(color - 40, 0, 255)  
    upper = np.clip(color + 40, 0, 255)  
    mask |= cv2.inRange(img_rgb, lower, upper)  

contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)  
output = resized.copy()  
cv2.drawContours(output, contours, -1, (0, 255, 0), 2)  

# Convert image to base64  
_, buffer = cv2.imencode('.png', output)  
detected_base64 = base64.b64encode(buffer).decode('utf-8')  

return dominant_colors, detected_base64

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

    image = Image.open(image_file.stream).convert('RGB')  
    dominant_colors, detected_base64 = detect_dominant_colors_and_draw(image)  

    return jsonify({  
        'dominantColors': dominant_colors,  
        'detectedImage': detected_base64  
    })  

except Exception as e:  
    print("Error:", e)  
    return jsonify({'error': str(e)}), 500

if name == 'main':
app.run(debug=True)
