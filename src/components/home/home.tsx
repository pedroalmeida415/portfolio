'use client'
import { useRef } from 'react'

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

export const Home = () => {
  const subtitleRef = useRef<HTMLHeadingElement | null>()

  return (
    <section className='relative mx-auto size-full max-w-screen-2xl'>
      <header className='absolute left-0 top-0 flex w-full items-center justify-start p-6 leading-none'>
        <h1 data-cursor-interactive='segment' data-padding='0.4;0.6'>
          Pedro Almeida
        </h1>
        <ul className='ml-auto mr-[9.4rem] flex items-center justify-start gap-x-10'>
          {socials.map(({ link, label }) => (
            <li data-cursor-interactive='segment' key={label} data-padding='0.4;0.6'>
              <a className='underline-offset-4 hover:underline' href={link} target='_blank' rel='noopener noreferrer'>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <span data-cursor-interactive='segment' data-padding='0.4;0.6'>
          ©2024
        </span>
      </header>
      <div className='absolute left-[10%] top-[66%]'>
        <h2 data-cursor-interactive='center' ref={subtitleRef} className='mb-1 text-5xl font-extralight'>
          Creative Developer
        </h2>
        <div className='ml-1 flex items-center'>
          <h3 data-cursor-interactive='segment' data-padding='0.4;0.0' className='mr-2 font-normal tracking-wide'>
            Available for new projects
          </h3>
          <span id='ping' className='size-2.5 rounded-full bg-lime-500'></span>
        </div>
      </div>
      <nav data-cursor-interactive='segment' className='absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full p-2'>
        <ul className='flex items-center gap-x-2 leading-none'>
          {routes.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <a href={path} className='block rounded-full px-6 py-2 underline-offset-4 hover:underline'>
                {Icon ? <Icon className='size-[1.125rem]' /> : label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
