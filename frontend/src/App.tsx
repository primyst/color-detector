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
    if (!image) return
    setLoading(true)

    const formData = new FormData()
    formData.append('image', image)

    try {
      const res = await axios.post(`${apiBaseUrl}/detect`, formData, {
        responseType: 'blob',
      })

      const blobUrl = URL.createObjectURL(res.data)
      setResult(blobUrl)

      const rgb = res.headers['x-dominant-color-rgb']
      const hex = res.headers['x-dominant-color-hex']
      setDominantColorRGB(rgb || null)
      setDominantColorHEX(hex || null)
    } catch (error) {
      alert('Error detecting color. Check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🎨 Color Object Detector</h1>

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
