'use client'

import { useEffect, useState } from 'react'

interface WeatherData {
  temp: number
  feelsLike: number
  condition: string
  description: string
  icon: string
  weatherCode?: number
  heeftRegen?: boolean
  heeftSneeuw?: boolean
  heeftBevriezendeRegen?: boolean
  heeftMist?: boolean
  heeftOnweer?: boolean
}

interface SafetyCheck {
  label: string
  passed: boolean
  reason: string
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

  // Bepaal veiligheidschecks
  const getSafetyChecks = (): SafetyCheck[] => {
    if (!weather) return []
    
    const temp = weather.temp
    const checks: SafetyCheck[] = []
    
    // Check 1: Temperatuur
    const tempOk = temp >= 4
    checks.push({
      label: 'Temperatuur boven 4°C',
      passed: tempOk,
      reason: tempOk 
        ? `Temperatuur is ${temp.toFixed(1)}°C (veilig)` 
        : `Temperatuur is ${temp.toFixed(1)}°C (te koud, risico op gladheid)`
    })
    
    // Check 2: Regen
    const geenRegen = !weather.heeftRegen
    checks.push({
      label: 'Geen regen',
      passed: geenRegen,
      reason: geenRegen 
        ? 'Geen regen (veilig)' 
        : 'Regen veroorzaakt gladheid en verminderd zicht'
    })
    
    // Check 3: Sneeuw
    const geenSneeuw = !weather.heeftSneeuw
    checks.push({
      label: 'Geen sneeuw',
      passed: geenSneeuw,
      reason: geenSneeuw 
        ? 'Geen sneeuw (veilig)' 
        : 'Sneeuw veroorzaakt extreme gladheid en zeer slecht zicht'
    })
    
    // Check 4: Bevriezende regen
    const geenBevriezendeRegen = !weather.heeftBevriezendeRegen
    checks.push({
      label: 'Geen bevriezende regen',
      passed: geenBevriezendeRegen,
      reason: geenBevriezendeRegen 
        ? 'Geen bevriezende regen (veilig)' 
        : 'Bevriezende regen veroorzaakt zeer gevaarlijke gladheid (ijzel)'
    })
    
    // Check 5: Mist
    const geenMist = !weather.heeftMist
    checks.push({
      label: 'Geen mist',
      passed: geenMist,
      reason: geenMist 
        ? 'Geen mist (veilig)' 
        : 'Mist vermindert zicht aanzienlijk, zeer gevaarlijk voor motorrijders'
    })
    
    // Check 6: Onweer
    const geenOnweer = !weather.heeftOnweer
    checks.push({
      label: 'Geen onweer',
      passed: geenOnweer,
      reason: geenOnweer 
        ? 'Geen onweer (veilig)' 
        : 'Onweer is gevaarlijk door harde wind, regen en slecht zicht'
    })
    
    return checks
  }

  const safetyChecks = getSafetyChecks()
  const veilig = safetyChecks.length > 0 ? safetyChecks.every(check => check.passed) : null

  return (
    <main className="bg-white rounded-[20px] py-16 px-10 shadow-2xl text-center max-w-[600px] w-full">
      <h1 className="mb-10 text-4xl font-bold leading-tight text-gray-800">
        Kan ik veilig motor rijden?
      </h1>

      {loading && (
        <div className="text-2xl text-gray-600">
          Weerdata ophalen...
        </div>
      )}

      {error && (
        <div className="mt-5 text-xl text-red-600">
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

          <div className="p-5 mt-5 text-lg text-gray-600 bg-gray-100 rounded-lg">
            <div className="mb-2.5">
              <strong>Temperatuur:</strong> {weather.temp.toFixed(1)}°C
            </div>
            <div className="mb-5">
              <strong>Weersomstandigheden:</strong> {weather.description}
            </div>
            
            <div className="pt-5 mt-6 border-t border-gray-300">
              <h2 className="mb-4 text-xl font-bold text-gray-800">Veiligheidschecklist</h2>
              <div className="space-y-3 text-left">
                {safetyChecks.map((check, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start p-3 rounded-lg ${
                      check.passed 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5 mr-3">
                      {check.passed ? (
                        <span className="text-xl text-green-600">✓</span>
                      ) : (
                        <span className="text-xl text-red-600">✗</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        check.passed ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {check.label}
                      </div>
                      <div className={`text-sm mt-1 ${
                        check.passed ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {check.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}

