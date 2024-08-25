'use client'

import { useEffect } from 'react'

import clsx from 'clsx'
import { type AnimationSequence, stagger, useAnimate } from 'framer-motion'
import { useAtomValue } from 'jotai'

import { isCanvasCreatedAtom, particlesDataAtom } from '~/store'

import HomeIcon from '~/assets/home-icon.svg'

const routes = [
  {
    path: '/projects',
    label: 'Projects',
  },
  {
    path: '/about',
    label: 'About',
  },
]

const socials = [
  {
    link: 'https://twitter.com/',
    label: 'X / Twitter',
  },
  {
    link: 'https://www.linkedin.com/',
    label: 'LinkedIn',
  },
  {
    link: 'https://read.cv/',
    label: 'Read.cv',
  },
]

const mainSequence = [
  ['#countdown', { opacity: 0, visibility: 'hidden' }, { duration: 2.0, ease: 'linear' }],
  ['#countdown-circle', { visibility: 'hidden' }, { duration: 0, at: '<' }],
  ['#subtitle', { y: [100, 0] }, { duration: 0.75, ease: 'circOut', at: 3.0 }],
  [
    '[data-animate="footer"]',
    { y: [100, 0] },
    { delay: stagger(0.25, { startDelay: 0, from: 'center' }), duration: 0.75, ease: 'circOut', at: '<' },
  ],
  ['[data-animate="header"]', { y: [100, 0] }, { duration: 0.75, ease: 'circOut', at: '-0.5' }],
] as AnimationSequence

export const Home = () => {
  const particlesData = useAtomValue(particlesDataAtom)
  const isCanvasCreated = useAtomValue(isCanvasCreatedAtom)

  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (!isCanvasCreated) return

    const triggerAnimations = async () => {
      setTimeout(() => {
        document.querySelector('main')?.classList.remove('pointer-events-none')
      }, 3000)
      await animate(mainSequence)
      document.querySelector('[data-ping]')?.classList.add('animate-ping')
      document.querySelector('#ping-wrapper')?.classList.remove('overflow-hidden')
    }

    triggerAnimations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCanvasCreated])

  return (
    <section ref={scope} className='relative mx-auto size-full max-w-screen-2xl'>
      <header className='absolute left-0 top-0 flex w-full items-start justify-between px-8 py-6'>
        <div className='overflow-hidden' data-cursor-interactive='segment' data-padding='0.4;0.2'>
          <h1 data-animate='header' className='translate-y-full'>
            Pedro Almeida
          </h1>
        </div>
        <div className='overflow-hidden' data-cursor-interactive='segment' data-padding='0.4;0.2'>
          <p data-animate='header' className='block translate-y-full'>
            ©2024
          </p>
        </div>

        {/* <nav>
          <ul role='list' className='flex items-center gap-x-10'>
            {routes.map(({ path, label }) => (
              <li key={path} data-cursor-interactive='segment' data-padding='0.4;0.2' className='overflow-hidden'>
                <div className='underline-animated translate-y-full' data-animate='header'>
                  <a href={path}>{label}</a>
                </div>
              </li>
            ))}
          </ul>
        </nav> */}
      </header>

      <div className='absolute bottom-16 left-1/2 -translate-x-1/2 overflow-hidden' data-cursor-interactive='center'>
        <h2 id='subtitle' className='translate-y-full whitespace-nowrap text-7xl font-thin'>
          Creative Developer
        </h2>
      </div>

      <footer className='absolute bottom-0 left-0 grid w-full grid-cols-[1fr_max-content_1fr] grid-rows-1 px-8 py-6'>
        <div
          id='ping-wrapper'
          className='justify-self-start overflow-hidden'
          data-cursor-interactive='segment'
          data-padding='0.4;0.2'
        >
          <div data-animate='footer' className='flex translate-y-full items-center'>
            <h3 className='mr-2 font-normal tracking-wide'>Available for new projects</h3>
            <span className='relative flex size-3 items-center justify-center'>
              <span data-ping className='absolute inline-flex size-full self-center rounded-full bg-[#2c731f]'></span>
              <span className='relative inline-flex size-2.5 rounded-full bg-[#2c731f]'></span>
            </span>
          </div>
        </div>

        <ul role='list' className='flex items-center justify-start gap-x-10'>
          {socials.map(({ link, label }) => (
            <li key={label} className='overflow-hidden' data-padding='0.4;0.2' data-cursor-interactive='segment'>
              <div className='underline-animated translate-y-full' data-animate='footer'>
                <a href={link} target='_blank' rel='noopener noreferrer'>
                  {label}
                </a>
              </div>
            </li>
          ))}
        </ul>
        <div className='justify-self-end overflow-hidden' data-cursor-interactive='segment' data-padding='0.4;0.2'>
          <div data-animate='footer' className='underline-animated translate-y-full'>
            <a href='mailto:pedroalmeida.415@gmail.com'>hello@pedroalmeida.dev</a>
          </div>
        </div>
      </footer>
      <div id='countdown' className={clsx('countdown', particlesData && 'stopped [--counter:100]')}>
        <svg id='countdown-circle' viewBox='-50 -50 100 100' strokeWidth='1'>
          <circle r='45'></circle>
          <circle r='45' pathLength='1'></circle>
        </svg>
      </div>
    </section>
  )
}
