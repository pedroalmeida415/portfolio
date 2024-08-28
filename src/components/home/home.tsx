'use client'

import { useEffect } from 'react'

import clsx from 'clsx'
import { type AnimationSequence, stagger, useAnimate } from 'framer-motion'
import { useAtomValue } from 'jotai'

import { isCanvasCreatedAtom, particlesDataAtom } from '~/store'

const socials = [
  {
    link: 'https://x.com/pedro_almeiding',
    label: 'X / Twitter',
  },
  {
    link: 'https://linkedin.com/in/pedrohlalmeida',
    label: 'LinkedIn',
  },
  {
    link: 'https://read.cv/pedroalmeida',
    label: 'Read.cv',
  },
]

const mainSequence = [
  ['#countdown', { opacity: 0, visibility: 'hidden' }, { duration: 2.0, ease: 'linear' }],
  ['#countdown-circle', { visibility: 'hidden' }, { duration: 0, at: '<' }],
  [
    '[data-animate="subtitle"]',
    { y: [100, 0] },
    { delay: stagger(0.25, { startDelay: 0 }), duration: 0.75, ease: 'circOut', at: 3.0 },
  ],
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
      document.querySelectorAll('[data-ping-wrapper]').forEach((el) => el.classList.remove('overflow-hidden'))
    }

    triggerAnimations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCanvasCreated])

  return (
    <section ref={scope} className='relative mx-auto size-full max-w-md text-sm lg:max-w-screen-2xl lg:text-base'>
      <header className='absolute left-0 top-0 flex w-full items-start justify-between px-4 py-3 lg:px-8 lg:py-6'>
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
      </header>

      <div className='absolute bottom-1/2 right-3 translate-y-1/2 pt-[65%] lg:bottom-16 lg:right-1/2 lg:translate-x-1/2 lg:translate-y-0 lg:p-0'>
        <h2
          id='subtitle'
          className='whitespace-nowrap text-[12vw] font-thin leading-none lg:flex lg:text-7xl'
          data-cursor-interactive='center'
        >
          <div className='overflow-hidden'>
            <div data-animate='subtitle' className='translate-y-full'>
              Creative&nbsp;
            </div>
          </div>
          <div className='ml-12 overflow-hidden lg:ml-0'>
            <div data-animate='subtitle' className='translate-y-full'>
              Developer
            </div>
          </div>
        </h2>
        <div data-ping-wrapper className='mr-1 mt-1 overflow-hidden lg:hidden'>
          <div data-animate='subtitle' className='flex translate-y-full items-center justify-end'>
            <h3 className='mr-2 text-[3.2558vw] font-normal tracking-wide'>Available for new projects</h3>
            <span className='relative flex size-3 items-center justify-center'>
              <span className='absolute inline-flex size-full animate-ping self-center rounded-full bg-[#2c731f]'></span>
              <span className='relative inline-flex size-2 rounded-full bg-[#2c731f]'></span>
            </span>
          </div>
        </div>
      </div>

      <footer className='absolute bottom-0 left-0 flex w-full grid-cols-[1fr_max-content_1fr] grid-rows-1 justify-center px-0 py-3 lg:grid lg:px-8 lg:py-6'>
        <div
          data-ping-wrapper
          className='hidden justify-self-start overflow-hidden lg:block'
          data-cursor-interactive='segment'
          data-padding='0.4;0.2'
        >
          <div data-animate='footer' className='flex translate-y-full items-center'>
            <h3 className='mr-2 font-normal tracking-wide'>Available for new projects</h3>
            <span className='relative flex size-3 items-center justify-center'>
              <span className='absolute inline-flex size-full animate-ping self-center rounded-full bg-[#2c731f]'></span>
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
          <li className='overflow-hidden lg:hidden'>
            <div className='underline-animated translate-y-full lg:hidden' data-animate='footer'>
              <a href='mailto:hello@pedroalmeida.io'>Email</a>
            </div>
          </li>
        </ul>
        <div
          className='hidden justify-self-end overflow-hidden lg:block'
          data-cursor-interactive='segment'
          data-padding='0.4;0.2'
        >
          <div data-animate='footer' className='underline-animated translate-y-full'>
            <a href='mailto:hello@pedroalmeida.io'>hello@pedroalmeida.io</a>
          </div>
        </div>
      </footer>
      <div id='countdown' className={clsx('countdown', particlesData && 'stopped [--counter:100]')}>
        <svg id='countdown-circle' viewBox='-50 -50 100 100' strokeWidth='1' fill='none'>
          <circle fill='none' stroke='#c0c0c0' r='45'></circle>
          <circle data-progress stroke='#1d1d1d' fill='none' strokeLinecap='square' r='45' pathLength='100'></circle>
        </svg>
      </div>
    </section>
  )
}
