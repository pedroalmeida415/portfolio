import localFont from 'next/font/local'
import { Layout } from '@/components/dom/Layout'
import '@/global.css'

const neue_montreal = localFont({
  src: './fonts/neue-montreal/PPNeueMontreal-Variable.woff2',
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

export const metadata = {
  title: 'Next.js + Three.js',
  description: 'A minimal starter for Nextjs + React-three-fiber and Threejs.',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={`${neue_montreal.variable}`}>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
