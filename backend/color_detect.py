import cv2
import numpy as np
from sklearn.cluster import KMeans

def detect_dominant_color_object(image_path, output_path="outputs/output.jpg", num_colors=1):
    img = cv2.imread(image_path)
    img_resized = cv2.resize(img, (300, 300))

    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    reshaped = img_rgb.reshape((-1, 3))

    kmeans = KMeans(n_clusters=num_colors, n_init=10)
    kmeans.fit(reshaped)
    dominant_color = kmeans.cluster_centers_[0].astype(int)

    # Convert dominant RGB to HSV
    dominant_hsv = cv2.cvtColor(np.uint8([[dominant_color]]), cv2.COLOR_RGB2HSV)[0][0]
    color_name = classify_color(dominant_hsv)

    lower_bound = np.array([max(dominant_hsv[0] - 10, 0), 50, 50])
    upper_bound = np.array([min(dominant_hsv[0] + 10, 179), 255, 255])

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, lower_bound, upper_bound)

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        if cv2.contourArea(cnt) > 500:
            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(img, color_name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX,
                        0.9, (0, 255, 0), 2)

    cv2.imwrite(output_path, img)
    return output_path, color_name

def classify_color(hsv):
    h, s, v = hsv
    if s < 50 and v > 200:
        return "White"
    elif v < 50:
        return "Black"
    elif h < 10 or h > 160:
        return "Red"
    elif 10 <= h <= 25:
        return "Orange"
    elif 26 <= h <= 35:
        return "Yellow"
    elif 36 <= h <= 85:
        return "Green"
    elif 86 <= h <= 125:
        return "Blue"
    elif 126 <= h <= 159:
        return "Purple"
    else:
        return "Unknown"
