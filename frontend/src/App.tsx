import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [dominantColors, setDominantColors] = useState<
  { name: string; hex: string; rgb: string }[]
>([])
  const [loading, setLoading] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setDominantColors([])
    }
  }

  const handleUpload = async () => {
  if (!image) return
  setLoading(true)

  const formData = new FormData()
  formData.append('image', image)

  try {
    const res = await axios.post(`${apiBaseUrl}/detect`, formData)

    // Store base64 string
    setResult(res.data.detectedImage)

    // Store colors
    setDominantColors(res.data.dominantColors || [])
  } catch (error: any) {
  console.error('Upload error:', error)

  const message =
    error?.response?.data?.error || error.message || 'Upload failed!'

  alert(`Upload failed: ${message}`)
}

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
        <img src={`data:image/png;base64,${result}`} alt="Detected" />
        {dominantColors.length > 0 ? (
          <div className="color-info">
            <h4>Detected Colors:</h4>
            <div className="color-grid">
              {dominantColors.map((color, index) => (
  <div key={index} className="color-box">
    <div className="color-swatch" style={{ backgroundColor: color.hex }} />
    <p><strong>{color.name}</strong></p>
    <p>{color.hex}</p>
    <p>{color.rgb}</p>
  </div>
))}
            </div>
          </div>
        ) : (
          <p>No dominant colors detected.</p>
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