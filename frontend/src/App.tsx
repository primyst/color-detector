import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [detectedColors, setDetectedColors] = useState<{ rgb: number[]; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setDetectedColors([])
    }
  }

  const handleUpload = async () => {
    if (!image) return
    setLoading(true)

    const formData = new FormData()
    formData.append('image', image)

    try {
      const res = await axios.post(`${apiBaseUrl}/detect`, formData)
      setResult(res.data.detectedImage)
      setDetectedColors(res.data.detectedColors || [])
    } catch (error) {
      alert('Detection failed!')
    } finally {
      setLoading(false)
    }
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
                {detectedColors.length > 0 ? (
                  <div className="color-info">
                    <h4>Detected Colors:</h4>
                    <ul>
  {detectedColors.map((color, index) => (
    <li
      key={index}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        marginBottom: '6px',
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: `rgb(${color.rgb.join(',')})`,
          border: '1px solid #ccc',
          flexShrink: 0,
        }}
      ></div>
      <span>
        <strong>{color.name}</strong> — RGB: ({color.rgb.join(', ')})
      </span>
    </li>
  ))}
</ul>
                  </div>
                ) : (
                  <p>No colors found.</p>
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