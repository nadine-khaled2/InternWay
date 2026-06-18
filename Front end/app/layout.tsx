import type { Metadata } from 'next'
import './globalStyles.css'

export const metadata: Metadata = {
  title: 'Welcome Back - InternWay',
  description: 'Your journey to the perfect internship starts here',
}

import { AppProvider } from './context/AppContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          <div className="global-glow-container" aria-hidden="true">
            <div className="glow-1"></div>
            <div className="glow-2"></div>
            <div className="glow-3"></div>
          </div>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}

