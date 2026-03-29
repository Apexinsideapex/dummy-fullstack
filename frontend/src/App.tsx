import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState<string>('Loading...')
  const [healthStatus, setHealthStatus] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error('Error fetching data:', err)
        setMessage('Error connecting to backend')
      })
  }, [])

  const testConnectivity = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/health')
      if (response.ok) {
        setHealthStatus('OK')
      } else {
        setHealthStatus('Error: ' + response.status)
      }
    } catch (err) {
      setHealthStatus('Error: Connection failed')
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <h1>Fullstack App</h1>
      <p>Backend Message: <strong>{message}</strong></p>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={testConnectivity}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Test Connectivity
        </button>
        {healthStatus && (
          <p style={{ 
            marginTop: '10px', 
            color: healthStatus.startsWith('OK') ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            Status: {healthStatus}
          </p>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>Built with React (Bun) & FastAPI (UV)</p>
      </div>
    </div>
  )
}

export default App
