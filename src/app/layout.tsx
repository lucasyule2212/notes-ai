import { cn } from '@/lib/utils'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Cookie, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'

const IBMPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex',
})

const CookieSerif = Cookie({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-cookie',
})

export const metadata: Metadata = {
  title: 'CanvaAI',
  description: 'AI powered image generator',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#624cf5',
        },
      }}
    >
      <html lang="en">
        <body
          className={cn(
            'font-IBMPlex antialiased',
            IBMPlex.variable,
            CookieSerif.variable,
          )}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
