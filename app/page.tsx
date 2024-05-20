'use client'

import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('@/components/sections/Hero').then((mod) => mod.Hero), { ssr: false })
const About = dynamic(() => import('@/components/sections/About').then((mod) => mod.About), { ssr: false })
const Services = dynamic(() => import('@/components/sections/Services').then((mod) => mod.Services), { ssr: false })
const Showcase = dynamic(() => import('@/components/sections/Showcase').then((mod) => mod.Showcase), { ssr: false })
const Contact = dynamic(() => import('@/components/sections/Contact').then((mod) => mod.Contact), { ssr: false })

export default function Page() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Showcase />
      <Contact />
    </>
  )
}
