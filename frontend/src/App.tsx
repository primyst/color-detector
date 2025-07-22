import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [dominantColorRGB, setDominantColorRGB] = useState<string | null>(null)
  const [dominantColorHEX, setDominantColorHEX] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setDominantColorRGB(null)
      setDominantColorHEX(null)
    }
  }

  const handleUpload = async () => {
  if (!image) return;

  const formData = new FormData();
  formData.append("image", image);

  try {
    setLoading(true);
    setDetectedColors([]);

    const response = await fetch("https://color-detector-ucj3.onrender.com/detect", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error detecting color. Check backend connection.");
    }

    const reader = new FileReader();
    const blob = await response.blob();

    reader.onloadend = () => {
      setDetectedImage(reader.result as string);

      // Get color info from headers
      const rgbHeader = response.headers.get("X-Dominant-Colors-RGB");
      const hexHeader = response.headers.get("X-Dominant-Colors-HEX");

      if (hexHeader) {
        const hexArray = JSON.parse(hexHeader.replace(/'/g, '"'));
        setDetectedColors(hexArray);
      }
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    alert("Error detecting color. Check backend connection.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container">
      <div className="card">
        <h1>Color Object Detector</h1>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button onClick={handleUpload} disabled={!image || loading}>
          {loading ? 'Processing...' : 'Detect Color'}
        </button>

        {(preview || result) && (
          <div className="images">
            {preview && (
              <div>
                <h3>Original</h3>
                <img src={preview} alt="Original" />
              </div>
            )}

            {result && (
              <div>
                <h3>Detected</h3>
                <img src={result} alt="Detected" />
                {dominantColorHEX && (
                  <div className="color-info">
                    <p>
                      <strong>Dominant Color:</strong> {dominantColorHEX} ({dominantColorRGB})
                    </p>
                    <div
                      className="color-swatch"
                      style={{ backgroundColor: dominantColorHEX }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
