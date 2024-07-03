'use client'
import gsap from 'gsap'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'

import HomeIcon from '@/assets/home-icon.svg'

const routes = [
  {
    path: '/',
    label: 'home',
    icon: HomeIcon,
  },
  {
    path: '/work',
    label: 'work',
  },
  {
    path: '/about',
    label: 'about',
  },
  {
    path: '/contact',
    label: 'contact',
  },
]

export const Home = () => {
  const subtitleRef = useRef<HTMLHeadingElement | null>()
  const countdownRef = useRef<HTMLHeadingElement | null>()

  useGSAP(() => {
    gsap.fromTo(
      subtitleRef.current,
      { yPercent: 120 },
      { autoAlpha: 1, yPercent: 0, duration: 1, ease: 'power3.out', delay: 3.5 },
    )

    gsap.to('#ping', { rotateX: 180, rotateY: 180, duration: 0.75, ease: 'power1.inOut', repeat: -1, yoyo: true })

    gsap.to(countdownRef.current, { autoAlpha: 0, duration: 2.5, ease: 'none' })
  })

  const countdownVars = {
    '--s': 100,
  } as React.CSSProperties

  return (
    <section className='relative flex h-screen w-full items-end justify-start p-6'>
      <div ref={countdownRef} id='countdown' className='countdown stopped' style={countdownVars}>
        <svg viewBox='-50 -50 100 100' strokeWidth='1.5'>
          <circle r='45'></circle>
          <circle r='45' pathLength='1'></circle>
        </svg>
      </div>
      <div className='absolute left-[10%] top-[62.55%]'>
        <h1 className='sr-only'>Pedro Almeida</h1>
        <h2 ref={subtitleRef} className='invisible mb-1 text-5xl font-extralight opacity-0'>
          Creative Developer
        </h2>
        <div className='ml-1 flex items-center'>
          <h3>
            <strong className='mr-2 font-normal tracking-wide'>Available for new projects</strong>
          </h3>
          <span id='ping' className='size-[10px] rounded-full bg-lime-500'></span>
        </div>
      </div>
      <nav className='absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[#D9D9D9] p-2'>
        <ul className='flex items-center gap-x-2 leading-none'>
          {routes.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <a href={path} className='block rounded-full px-6 py-2 hover:bg-orange-600 hover:text-white'>
                {Icon ? <Icon /> : label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
