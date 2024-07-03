import localFont from 'next/font/local'
import './global.css'
import { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'

const neue_montreal = localFont({
  src: '../assets/fonts/neue-montreal/PPNeueMontreal-Variable.woff2',
  display: 'swap',
  variable: '--font-neue-montreal-variable',
  fallback: ['sans-serif'],
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

const Canvas = dynamic(() => import('@/components/canvas/canvas'), {
  ssr: false,
  loading: () => (
    <div className='countdown'>
      <svg viewBox='-50 -50 100 100' strokeWidth='1.5'>
        <circle r='45'></circle>
        <circle r='45' pathLength='1'></circle>
      </svg>
    </div>
  ),
})

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={`${neue_montreal.variable}`}>
      <body>
        <Canvas>{children}</Canvas>
      </body>
    </html>
  )
}
