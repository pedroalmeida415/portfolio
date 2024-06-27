import localFont from 'next/font/local'
import { Layout } from '@/components/dom/Layout'
import { Navbar } from '@/components/navbar/navbar'
import './global.css'

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

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={`${neue_montreal.variable}`}>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <Navbar />
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
