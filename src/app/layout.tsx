import './globals.css'
import type { Metadata } from 'next'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'NeatPC - Smart Device Recommendations',
  description: 'Find the perfect laptop or phone tailored to your needs using AI. Cross-references prices from Amazon, Best Buy, Newegg, and more.',
  keywords: ['laptop deals', 'phone deals', 'PC recommendations', 'AI shopping', 'price comparison'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
