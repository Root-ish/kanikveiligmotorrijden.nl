import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kan ik veilig motor rijden?',
  description: 'Check of je veilig kunt motorrijden op basis van het weer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}

