import cv2
import numpy as np

def detect_dominant_color_object(image_path, output_path):
    image = cv2.imread(image_path)
    if image is None:
        raise Exception("Invalid image")

    # Resize for processing
    image = cv2.resize(image, (400, 400))

    # Convert to RGB and reshape for clustering
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    img_data = img_rgb.reshape((-1, 3))

    # KMeans to detect dominant color
    from sklearn.cluster import KMeans
    kmeans = KMeans(n_clusters=1, random_state=42)
    kmeans.fit(img_data)

    # Get dominant color
    dominant = kmeans.cluster_centers_[0].astype(int)

    # Create mask based on color range (±40 tolerance)
    lower = np.clip(dominant - 40, 0, 255)
    upper = np.clip(dominant + 40, 0, 255)
    mask = cv2.inRange(img_rgb, lower, upper)

    # Find contours from mask
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    output = image.copy()
    cv2.drawContours(output, contours, -1, (0, 255, 0), 2)

    # Save result
    cv2.imwrite(output_path, output)
