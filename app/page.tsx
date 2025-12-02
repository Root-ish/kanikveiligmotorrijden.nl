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
    <main className="bg-white rounded-[20px] py-16 px-10 shadow-2xl text-center max-w-[600px] w-full">
      <h1 className="text-4xl font-bold mb-10 text-gray-800 leading-tight">
        Kan ik veilig motor rijden?
      </h1>

      {loading && (
        <div className="text-2xl text-gray-600">
          Weerdata ophalen...
        </div>
      )}

      {error && (
        <div className="text-xl text-red-600 mt-5">
          {error}
        </div>
      )}

      {weather && veilig !== null && (
        <>
          <div className={`text-7xl font-bold mt-8 mb-8 ${
            veilig ? 'text-green-700' : 'text-red-600'
          }`}>
            {veilig ? 'Ja' : 'Nee'}
          </div>

          <div className="text-lg text-gray-600 mt-5 p-5 bg-gray-100 rounded-lg">
            <div className="mb-2.5">
              <strong>Temperatuur:</strong> {weather.temp.toFixed(1)}°C
            </div>
            <div className="mb-2.5">
              <strong>Weersomstandigheden:</strong> {weather.description}
            </div>
            {!veilig && (
              <div className="mt-4 text-red-600 font-bold">
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

