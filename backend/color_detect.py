import cv2
import numpy as np
from sklearn.cluster import KMeans

def detect_dominant_colors(image_path, output_path, n_colors=3):
    image = cv2.imread(image_path)
    if image is None:
        raise Exception("Invalid image")

    image = cv2.resize(image, (400, 400))
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    img_data = img_rgb.reshape((-1, 3))

    kmeans = KMeans(n_clusters=n_colors, random_state=42)
    kmeans.fit(img_data)

    dominant_colors = [center.astype(int).tolist() for center in kmeans.cluster_centers_]

    mask = np.zeros(img_rgb.shape[:2], dtype=np.uint8)
    for color in dominant_colors:
        lower = np.clip(np.array(color) - 40, 0, 255)
        upper = np.clip(np.array(color) + 40, 0, 255)
        mask |= cv2.inRange(img_rgb, lower, upper)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    output = image.copy()
    cv2.drawContours(output, contours, -1, (0, 255, 0), 2)
    cv2.imwrite(output_path, output)

    return dominant_colors