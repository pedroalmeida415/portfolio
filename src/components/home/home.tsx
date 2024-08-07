'use client'

import { useEffect } from 'react'

import clsx from 'clsx'
import { type AnimationSequence, stagger, useAnimate } from 'framer-motion'
import { useAtomValue } from 'jotai'

import { isCanvasCreatedAtom, particlesDataAtom } from '~/store'

import HomeIcon from '~/assets/home-icon.svg'

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
  ['#progress-bar', { opacity: 0 }, { duration: 0.25 }],
  [
    '#progress-bar-wrapper',
    { opacity: 0, backgroundColor: 'transparent', visibility: 'hidden' },
    { duration: 2.5, at: 0, backgroundColor: { duration: 0 } },
  ],
  ['[data-animate]', { y: [100, 0] }, { delay: stagger(0.25), duration: 0.75, ease: [0.33, 1, 0.68, 1], at: 2.5 }],
  ['#navbar', { color: '#000' }, { duration: 0.25, at: '<' }],
] as AnimationSequence

export const Home = () => {
  const particlesData = useAtomValue(particlesDataAtom)
  const isCanvasCreated = useAtomValue(isCanvasCreatedAtom)

  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (!isCanvasCreated) return

    animate(sequence)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCanvasCreated])

  return (
    <section ref={scope} className='relative mx-auto size-full max-w-screen-2xl'>
      <header className='absolute left-0 top-0 flex w-full items-center justify-start p-6 leading-none'>
        <div className='mr-10 overflow-hidden' data-cursor-interactive='segment' data-padding='0.4;0.6'>
          <h1 data-animate className='translate-y-full'>
            Pedro Almeida
          </h1>
        </div>

        <div className='overflow-hidden' data-cursor-interactive='segment' data-padding='0.4;0.6'>
          <div data-animate className='flex translate-y-full items-center'>
            <h3 className='mr-2 font-normal tracking-wide'>Available for new projects</h3>
            <span className='size-2.5 rounded-full bg-lime-500'></span>
          </div>
        </div>

        <ul role='list' className='ml-auto mr-[9.4rem] flex items-center justify-start gap-x-10'>
          {socials.map(({ link, label }) => (
            <div key={label} className='overflow-hidden' data-padding='0.4;0.6' data-cursor-interactive='segment'>
              <li className='translate-y-full' data-animate>
                <a className='underline-offset-4 hover:underline' href={link} target='_blank' rel='noopener noreferrer'>
                  {label}
                </a>
              </li>
            </div>
          ))}
        </ul>
        <div className='overflow-hidden' data-cursor-interactive='segment' data-padding='0.4;0.6'>
          <span data-animate className='block translate-y-full'>
            ©2024
          </span>
        </div>
      </header>
      <div className='absolute left-[10.2rem] top-[66%] overflow-hidden' data-cursor-interactive='center'>
        <h2 id='subtitle' data-animate className='translate-y-full text-5xl font-extralight'>
          Creative Developer
        </h2>
      </div>
      <nav
        id='navbar'
        data-cursor-interactive='segment'
        className='absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full p-2 text-offBlack'
      >
        <ul role='list' className='flex items-center gap-x-2 leading-none'>
          {routes.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <a href={path} className='block rounded-full px-6 py-2 underline-offset-4 hover:underline'>
                {Icon ? <Icon className='size-[1.125rem]' /> : label}
              </a>
            </li>
          ))}
        </ul>
        <div
          id='progress-bar-wrapper'
          className={clsx(
            'progress-wrapper absolute left-0 top-0 size-full rounded-full bg-gray p-2',
            particlesData && 'completed',
          )}
        >
          <div
            id='progress-bar'
            className={clsx('progress-bar size-full rounded-full bg-offBlack', particlesData && 'completed')}
          ></div>
        </div>
      </nav>
    </section>
  )
}
