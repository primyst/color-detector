import { useState } from 'react'
import axios from 'axios'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setImage(file)
      setResult(null)
      setColor(null)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!image) return
    setLoading(true)
    const formData = new FormData()
    formData.append('image', image)

    try {
      const res = await axios.post(`${apiBaseUrl}/detect`, formData)
      const imageUrl = `${apiBaseUrl}${res.data.image}`
      setResult(imageUrl)
      setColor(res.data.color)
    } catch (err) {
      alert('Failed to detect color. Check backend URL.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          🎨 Color Object Detector
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:border file:rounded-lg file:bg-blue-100 file:text-blue-700"
        />

        <button
          onClick={handleUpload}
          disabled={!image || loading}
          className={`w-full py-2 rounded-lg font-semibold transition-colors ${
            loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Processing...' : 'Detect Color'}
        </button>

        {(preview || result) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 items-start">
            {preview && (
              <div className="text-center">
                <h2 className="font-medium text-gray-700 mb-2">Original</h2>
                <img
                  src={preview}
                  alt="Original"
                  className="rounded-lg shadow border"
                />
              </div>
            )}
            {result && (
              <div className="text-center">
                <h2 className="font-medium text-gray-700 mb-2">Detected</h2>
                <img
                  src={result}
                  alt="Detected"
                  className="rounded-lg shadow border"
                />
                {color && (
                  <p className="mt-2 text-lg font-semibold" style={{ color: color.toLowerCase() }}>
                    Detected Color: {color}
                  </p>
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
