import { type PropsWithChildren } from 'react'

import { Provider } from 'jotai'
import { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { Layout } from '~/components/layout/layout'

import './global.css'

const neue_montreal = localFont({
  src: '../assets/fonts/neue-montreal/PPNeueMontreal-Variable.woff2',
  display: 'swap',
  variable: '--font-neue-montreal-variable',
  declarations: [
    {
      prop: 'font-variation-settings',
      value: '"wght" 450',
    },
  ],
})

const title = 'Pedro Almeida | Creative Developer'
const description = 'Focused on creating great, personality-rich, “absolute cinema” digital experiences. ✋🤯🤚'

export const metadata: Metadata = {
  title,
  description,
  keywords: 'Creative Developer,Frontend Developer,WebGL,3D,Animation',
  robots: 'index,follow',
  authors: {
    name: 'Pedro Almeida',
  },
  twitter: {
    creator: '@pedro_almeiding',
    card: 'summary',
    site: '@pedro_almeiding',
  },
  openGraph: {
    title,
    siteName: title,
    description,
    type: 'website',
    url: 'https://pedroalmeida.io/',
    images: [
      {
        url: '/icons/share-desktop.png',
        width: 1920,
        height: 921,
        alt: 'Share Image Desktop',
      },
      {
        url: '/icons/share-mobile.png',
        width: 749,
        height: 1333,
        alt: 'Share Image Mobile',
      },
    ],
  },
  icons: [
    {
      type: 'shortcut icon',
      url: '/icons/apple-touch-icon.png',
    },
    {
      sizes: '16x16',
      url: '/icons/favicon-16x16.png',
      type: 'apple-touch-icon',
    },
    {
      sizes: '32x32',
      url: '/icons/favicon-32x32.png',
      type: 'apple-touch-icon',
    },
    {
      sizes: '192x192',
      url: '/icons/apple-touch-icon.png',
      type: 'apple-touch-icon',
    },
    {
      type: 'mask-icon',
      color: '#1d1d1d',
      url: '/icons/safari-pinned-tab.svg',
    },
    {
      type: 'apple-touch-icon',
      url: '/icons/apple-touch-icon.png',
    },
  ],
  manifest: '/manifest.json',
  formatDetection: {
    telephone: true,
  },
  metadataBase: new URL('https://pedroalmeida.io/'),
  other: {
    language: 'english',
    distribution: 'web',
    HandheldFriendly: 'true',
  },
}
export const viewport: Viewport = {
  minimumScale: 1,
  initialScale: 1.0,
  themeColor: '#1f5673',
  width: 'device-width',
  userScalable: false,
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en' className='h-full overscroll-none'>
      <body
        className={`${neue_montreal.variable} flex size-full max-h-screen min-h-full flex-col overflow-hidden overscroll-none bg-offWhite font-neue-montreal font-normal text-black antialiased`}
      >
        <Provider>
          <Layout>{children}</Layout>
        </Provider>
      </body>
    </html>
  )
}
