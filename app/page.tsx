'use client'

import { useEffect, useState } from 'react'

interface WeatherData {
  temp: number
  feelsLike: number
  condition: string
  description: string
  icon: string
  isGlad?: boolean
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Probeer locatie te krijgen
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            const response = await fetch(
              `/api/weather?lat=${latitude}&lon=${longitude}`
            )
            
            if (!response.ok) {
              throw new Error('Kon weerdata niet ophalen')
            }
            
            const data = await response.json()
            
            if (data.error) {
              setError(data.error)
            } else {
              setWeather(data)
            }
            setLoading(false)
          },
          async () => {
            // Als geolocatie faalt, gebruik default locatie (Amsterdam)
            const response = await fetch('/api/weather')
            
            if (!response.ok) {
              throw new Error('Kon weerdata niet ophalen')
            }
            
            const data = await response.json()
            
            if (data.error) {
              setError(data.error)
            } else {
              setWeather(data)
            }
            setLoading(false)
          }
        )
      } catch (err) {
        setError('Er is een fout opgetreden bij het ophalen van de weerdata')
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  // Bepaal of het veilig is om te motorrijden
  const isVeilig = (): boolean | null => {
    if (!weather) return null
    
    const temp = weather.temp
    const isGlad = weather.isGlad ?? false
    
    // Onder 4 graden of glad = niet veilig
    if (temp < 4 || isGlad) {
      return false
    }
    
    return true
  }

  const veilig = isVeilig()

  return (
    <main style={{
      background: 'white',
      borderRadius: '20px',
      padding: '60px 40px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      textAlign: 'center',
      maxWidth: '600px',
      width: '100%',
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '40px',
        color: '#333',
        lineHeight: '1.2',
      }}>
        Kan ik veilig motor rijden?
      </h1>

      {loading && (
        <div style={{ fontSize: '1.5rem', color: '#666' }}>
          Weerdata ophalen...
        </div>
      )}

      {error && (
        <div style={{ fontSize: '1.2rem', color: '#d32f2f', marginTop: '20px' }}>
          {error}
        </div>
      )}

      {weather && veilig !== null && (
        <>
          <div style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            marginTop: '30px',
            marginBottom: '30px',
            color: veilig ? '#2e7d32' : '#d32f2f',
          }}>
            {veilig ? 'Ja' : 'Nee'}
          </div>

          <div style={{
            fontSize: '1.1rem',
            color: '#666',
            marginTop: '20px',
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '10px',
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Temperatuur:</strong> {weather.temp.toFixed(1)}°C
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Weersomstandigheden:</strong> {weather.description}
            </div>
            {!veilig && (
              <div style={{ marginTop: '15px', color: '#d32f2f', fontWeight: 'bold' }}>
                {weather.temp < 4 
                  ? '⚠️ Temperatuur is onder de 4°C' 
                  : '⚠️ Gladheid door weersomstandigheden'}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  )
}

