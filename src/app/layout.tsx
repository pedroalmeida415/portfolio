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

const title = 'React Three Next Starter'
const description = 'The easiest and fastest way to create a 3D website using React Three Fiber and NextJS'

// either Static metadata
export const metadata: Metadata = {
  title,
  description,
  keywords: 'Software Engineer,Product Manager,Project Manager,Data Scientist,Computer Scientist',
  robots: 'index,follow',
  authors: {
    name: 'Author',
  },
  twitter: {
    creator: '@pmndrs',
    card: 'summary',
    site: '@pmndrs',
  },
  openGraph: {
    title,
    siteName: title,
    description,
    type: 'website',
    url: 'https://react-three-next.vercel.app/',
    images: [
      {
        url: '/icons/share.png',
        width: 1200,
        height: 630,
        alt: 'Share Image',
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
      color: '#000000',
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
  metadataBase: new URL('http://localhost:3000/'),
  other: {
    language: 'english',
    distribution: 'web',
    HandheldFriendly: 'true',
  },
}
export const viewport: Viewport = {
  minimumScale: 1,
  initialScale: 1.0,
  themeColor: 'black',
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
