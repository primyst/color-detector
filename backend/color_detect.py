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

    dominant_hsv = cv2.cvtColor(np.uint8([[dominant_color]]), cv2.COLOR_RGB2HSV)[0][0]
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

    cv2.imwrite(output_path, img)
    return output_path
