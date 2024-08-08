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
    link: '',
    label: 'X / Twitter',
  },
  {
    link: '',
    label: 'LinkedIn',
  },
  {
    link: '',
    label: 'Read.cv',
  },
]

const sequence = [
  ['[data-animate]', { y: [100, 0] }, { delay: stagger(0.25), duration: 0.75, ease: [0.33, 1, 0.68, 1], at: 2.5 }],
] as AnimationSequence

export const Home = () => {
  const particlesData = useAtomValue(particlesDataAtom)
  const isCanvasCreated = useAtomValue(isCanvasCreatedAtom)

  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (!isCanvasCreated) return

    const triggerAnimations = async () => {
      await animate(sequence)
      document.querySelector('main')?.classList.remove('pointer-events-none')
      document.querySelector('#ping-wrapper')?.classList.remove('overflow-hidden')
    }

    triggerAnimations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCanvasCreated])

  return (
    <section ref={scope} className='relative mx-auto size-full max-w-screen-2xl'>
      <header className='absolute left-0 top-0 flex w-full items-center justify-between px-6 py-8 leading-none'>
        <div className='overflow-hidden' data-cursor-interactive='segment' data-padding='0.4;0.6'>
          <h1 data-animate className='translate-y-full'>
            <a href='/'>Pedro Almeida</a>
          </h1>
        </div>

        <nav>
          <ul role='list' className='flex items-center gap-x-10 leading-none'>
            {routes.map(({ path, label }) => (
              <li
                key={path}
                data-cursor-interactive='segment'
                data-padding='0.4;0.6'
                className='underline-animated overflow-hidden'
              >
                <a href={path} className='block translate-y-full' data-animate>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className='absolute bottom-16 left-1/2 -translate-x-1/2 overflow-hidden' data-cursor-interactive='center'>
        <h2 id='subtitle' data-animate className='translate-y-full text-7xl font-thin'>
          Creative Developer
        </h2>
      </div>

      <footer className='absolute bottom-0 left-0 grid w-full grid-cols-[1fr_max-content_1fr] grid-rows-1 p-6 leading-none'>
        <div
          id='ping-wrapper'
          className='justify-self-start overflow-hidden'
          data-cursor-interactive='segment'
          data-padding='0.4;0.6'
        >
          <div data-animate className='flex translate-y-full items-center'>
            <h3 className='mr-2 font-normal tracking-wide'>Available for new projects</h3>
            <span className='relative flex size-3 items-center justify-center'>
              <span className='absolute inline-flex size-full animate-ping self-center rounded-full bg-[#2c731f]'></span>
              <span className='relative inline-flex size-2.5 rounded-full bg-[#2c731f]'></span>
            </span>
          </div>
        </div>

        <ul role='list' className='flex items-center justify-start gap-x-10'>
          <div className='overflow-hidden' data-padding='0.4;0.6' data-cursor-interactive='segment'>
            <li className='underline-animated translate-y-full' data-animate>
              <a href='mailto:pedroalmeida.415@gmail.com'>hello@pedroalmeida.dev</a>
            </li>
          </div>
          {socials.map(({ link, label }) => (
            <div key={label} className='overflow-hidden' data-padding='0.4;0.6' data-cursor-interactive='segment'>
              <li className='underline-animated translate-y-full' data-animate>
                <a href={link} target='_blank' rel='noopener noreferrer'>
                  {label}
                </a>
              </li>
            </div>
          ))}
        </ul>
        <div className='justify-self-end overflow-hidden' data-cursor-interactive='segment' data-padding='0.4;0.6'>
          <span data-animate className='block translate-y-full'>
            ©2024
          </span>
        </div>
      </footer>
    </section>
  )
}
