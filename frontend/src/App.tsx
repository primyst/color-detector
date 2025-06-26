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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">🎨 Color Object Detector</h1>

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

        {result && (
          <div className="mt-6 text-center">
            <h2 className="text-lg font-medium mb-2 text-gray-700">Detected Result</h2>
            <img
              src={result}
              alt="Detected"
              className="rounded-lg shadow-md border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
