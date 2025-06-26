import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImage(file)
      setResult(null)
      setPreview(URL.createObjectURL(file))
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
      const url = URL.createObjectURL(res.data)
      setResult(url)
    } catch (err) {
      alert('Failed to detect color. Check backend URL.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">🎨 Color Object Detector</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />

        <button
          onClick={handleUpload}
          disabled={!image || loading}
          className={`submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Processing...' : 'Detect Color'}
        </button>

        {(preview || result) && (
          <div className="image-grid">
            {preview && (
              <div className="image-block">
                <h2>Original</h2>
                <img src={preview} alt="Original" />
              </div>
            )}
            {result && (
              <div className="image-block">
                <h2>Detected</h2>
                <img src={result} alt="Detected" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
