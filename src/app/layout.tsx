import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NeatPC - Smart Device Recommendations',
  description: 'Find the perfect laptop or phone tailored to your needs using AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
