import { useState } from 'react'
import axios from 'axios'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!image) return
    setLoading(true)

    const formData = new FormData()
    formData.append('image', image)

    try {
      const res = await axios.post('http://localhost:5000/detect', formData, {
        responseType: 'blob',
      })

      const url = URL.createObjectURL(res.data)
      setResult(url)
    } catch (err) {
      alert('Failed to process image.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🎨 Color Object Detection</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br />
      <button onClick={handleUpload} disabled={!image || loading} style={{ marginTop: 10 }}>
        {loading ? 'Processing...' : 'Detect Color'}
      </button>

      <div style={{ marginTop: 20 }}>
        {result && <img src={result} alt="Detected" width="400" />}
      </div>
    </div>
  )
}

export default App
