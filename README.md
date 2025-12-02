# kanikveiligmotorrijden.nl

Een Next.js applicatie die bepaalt of je veilig kunt motorrijden op basis van het huidige weer.

## Functionaliteit

- Toont "Kan ik veilig motor rijden?" met het antwoord
- Controleert temperatuur (moet boven 4°C zijn)
- Controleert gladheid (regen, sneeuw, etc.)
- Gebruikt je huidige locatie of Amsterdam als standaard

## Installatie

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Build

```bash
npm run build
npm start
```

## Hoe het werkt

De applicatie gebruikt de Open-Meteo API (gratis, geen API key nodig) om het huidige weer op te halen. Het antwoord is "Nee" als:
- De temperatuur onder de 4°C is, OF
- Er gladheid is door regen, sneeuw, of andere winterse omstandigheden

Anders is het antwoord "Ja".