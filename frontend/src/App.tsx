import { useState } from 'react'
import './App.css'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [detectedImage, setDetectedImage] = useState<string | null>(null)
  const [detectedColors, setDetectedColors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setDetectedImage(null)
      setDetectedColors([])
    }
  }

  const handleUpload = async () => {
    if (!image) return

    const formData = new FormData()
    formData.append('image', image)

    try {
      setLoading(true)
      setDetectedColors([])

      const response = await fetch('https://color-detector-ucj3.onrender.com/detect', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error detecting color. Check backend connection.')
      }

      const blob = await response.blob()
      const reader = new FileReader()

      reader.onloadend = () => {
        setDetectedImage(reader.result as string)

        const hexHeader = response.headers.get('X-Dominant-Colors-HEX')
        if (hexHeader) {
          try {
            const hexArray = JSON.parse(hexHeader.replace(/'/g, '"'))
            if (Array.isArray(hexArray)) {
              setDetectedColors(hexArray)
            }
          } catch (err) {
            console.error('Error parsing color data:', err)
          }
        }
      }

      reader.readAsDataURL(blob)
    } catch (error) {
      alert('Error detecting color. Check backend connection.')
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

        {(preview || detectedImage) && (
          <div className="images">
            {preview && (
              <div>
                <h3>Original</h3>
                <img src={preview} alt="Original" />
              </div>
            )}

            {detectedImage && (
              <div>
                <h3>Detected</h3>
                <img src={detectedImage} alt="Detected" />

                {detectedColors.length > 0 && (
                  <div className="color-info-multiple">
                    <h4>Detected Colors:</h4>
                    <div className="color-grid">
                      {detectedColors.map((hex, index) => (
                        <div key={index} className="color-box">
                          <div
                            className="color-swatch"
                            style={{ backgroundColor: hex }}
                          />
                          <p>{hex}</p>
                        </div>
                      ))}
                    </div>
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