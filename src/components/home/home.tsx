'use client'

import clsx from 'clsx'
import { type AnimationSequence, stagger, useAnimate } from 'framer-motion'
import { useAtomValue, useSetAtom } from 'jotai'

import { homeAnimationsControlAtom, particlesDataAtom } from '~/store'

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
  ['[data-animate]', { opacity: [0, 1] }, { delay: stagger(0.25), duration: 1 }],
  ['#progress', { opacity: 0 }, { delay: 0.25, duration: 0.25, at: 0 }],
] as AnimationSequence

export const Home = () => {
  const particlesData = useAtomValue(particlesDataAtom)
  const setHomeAnimationsControl = useSetAtom(homeAnimationsControlAtom)

  const [scope, animate] = useAnimate()

  return (
    <section ref={scope} className='relative mx-auto size-full max-w-screen-2xl'>
      <header className='absolute left-0 top-0 flex w-full items-center justify-start p-6 leading-none'>
        <h1 data-animate data-cursor-interactive='segment' data-padding='0.4;0.6' className='opacity-0'>
          Pedro Almeida
        </h1>
        <ul role='list' className='ml-auto mr-[9.4rem] flex items-center justify-start gap-x-10'>
          {socials.map(({ link, label }) => (
            <li data-animate data-cursor-interactive='segment' key={label} data-padding='0.4;0.6' className='opacity-0'>
              <a className='underline-offset-4 hover:underline' href={link} target='_blank' rel='noopener noreferrer'>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <span data-animate data-cursor-interactive='segment' data-padding='0.4;0.6' className='opacity-0'>
          ©2024
        </span>
      </header>
      <div className='absolute left-[10%] top-[66%]'>
        <h2
          data-animate
          data-cursor-interactive='center'
          id='subtitle'
          className='mb-1 text-5xl font-extralight opacity-0'
        >
          Creative Developer
        </h2>
        <div data-animate className='ml-1 flex items-center opacity-0'>
          <h3 data-cursor-interactive='segment' data-padding='0.4;0.0' className='mr-2 font-normal tracking-wide'>
            Available for new projects
          </h3>
          <span id='ping' className='size-2.5 rounded-full bg-lime-500'></span>
        </div>
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
          className={clsx(
            'progress-wrapper absolute left-0 top-0 size-full rounded-full p-2',
            particlesData && 'completed bg-transparent',
            !particlesData && 'bg-gray',
          )}
        >
          <div
            id='progress-bar'
            className={clsx(
              'progress-bar size-full rounded-full bg-offBlack',
              particlesData && 'completed bg-transparent',
            )}
          ></div>
        </div>
      </nav>
    </section>
  )
}
