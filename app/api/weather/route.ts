import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') || '52.3676' // Default: Amsterdam
  const lon = searchParams.get('lon') || '4.9041'

  try {
    // Gebruik Open-Meteo API (gratis, geen API key nodig)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Europe/Amsterdam`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Weather API error')
    }
    
    const data = await response.json()
    const temp = data.current.temperature_2m
    const weatherCode = data.current.weather_code
    
    // Weather codes: https://open-meteo.com/en/docs
    // Codes die gladheid kunnen veroorzaken: regen, sneeuw, etc.
    const gladheidCodes = [
      51, 53, 55, // Lichte/matige/sterke motregen
      61, 63, 65, // Lichte/matige/sterke regen
      66, 67, // Bevriezende regen
      71, 73, 75, // Lichte/matige/sterke sneeuw
      77, // Sneeuwkorrels
      80, 81, 82, // Lichte/matige/sterke regenbuien
      85, 86, // Lichte/sterke sneeuwbuien
      95, 96, 99 // Onweer
    ]
    
    const isGlad = gladheidCodes.includes(weatherCode)
    
    // Bepaal beschrijving op basis van weather code
    let description = 'Onbekend'
    if (weatherCode === 0) description = 'Helder'
    else if ([1, 2, 3].includes(weatherCode)) description = 'Gedeeltelijk bewolkt'
    else if ([45, 48].includes(weatherCode)) description = 'Mist'
    else if ([51, 53, 55].includes(weatherCode)) description = 'Motregen'
    else if ([61, 63, 65].includes(weatherCode)) description = 'Regen'
    else if ([66, 67].includes(weatherCode)) description = 'Bevriezende regen'
    else if ([71, 73, 75].includes(weatherCode)) description = 'Sneeuw'
    else if ([80, 81, 82].includes(weatherCode)) description = 'Regenbuien'
    else if ([85, 86].includes(weatherCode)) description = 'Sneeuwbuien'
    else if ([95, 96, 99].includes(weatherCode)) description = 'Onweer'
    
    return NextResponse.json({
      temp: temp,
      feelsLike: temp, // Open-Meteo heeft geen feels_like, gebruik temp
      condition: isGlad ? 'rain' : 'clear',
      description: description,
      icon: '01d', // Placeholder
      isGlad: isGlad,
    })
  } catch (error) {
    console.error('Weather fetch error:', error)
    return NextResponse.json(
      { error: 'Kon weerdata niet ophalen' },
      { status: 500 }
    )
  }
}

