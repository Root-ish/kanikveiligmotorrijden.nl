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
    // Categoriseer verschillende gevaarlijke condities
    const regenCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82] // Regen en motregen
    const sneeuwCodes = [71, 73, 75, 77, 85, 86] // Sneeuw en sneeuwbuien
    const bevriezendeRegenCodes = [66, 67] // Bevriezende regen
    const mistCodes = [45, 48] // Mist en bevriezende mist
    const onweerCodes = [95, 96, 99] // Onweer
    
    const heeftRegen = regenCodes.includes(weatherCode)
    const heeftSneeuw = sneeuwCodes.includes(weatherCode)
    const heeftBevriezendeRegen = bevriezendeRegenCodes.includes(weatherCode)
    const heeftMist = mistCodes.includes(weatherCode)
    const heeftOnweer = onweerCodes.includes(weatherCode)
    
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
      condition: heeftRegen || heeftSneeuw ? 'rain' : 'clear',
      description: description,
      icon: '01d', // Placeholder
      weatherCode: weatherCode,
      heeftRegen: heeftRegen,
      heeftSneeuw: heeftSneeuw,
      heeftBevriezendeRegen: heeftBevriezendeRegen,
      heeftMist: heeftMist,
      heeftOnweer: heeftOnweer,
    })
  } catch (error) {
    console.error('Weather fetch error:', error)
    return NextResponse.json(
      { error: 'Kon weerdata niet ophalen' },
      { status: 500 }
    )
  }
}

