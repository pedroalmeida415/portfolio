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
    label: 'twitter',
  },
  {
    link: '',
    label: 'linkedIn',
  },
  {
    link: '',
    label: 'read.cv',
  },
]

export const Home = () => {
  const subtitleRef = useRef<HTMLHeadingElement | null>()

  return (
    <section className='relative flex h-screen w-full items-end justify-start p-6'>
      <h1 className='absolute left-6 top-6 leading-none'>Pedro Almeida</h1>
      <ul className='absolute right-[16.5rem] top-6 flex items-center justify-start gap-x-10 leading-none'>
        {socials.map(({ link, label }) => (
          <li key={label}>
            <a className='underline-offset-4 hover:underline' href={link} target='_blank' rel='noopener noreferrer'>
              {label}
            </a>
          </li>
        ))}
      </ul>
      <span className='absolute right-6 top-6 leading-none'>©2024</span>
      <div className='absolute left-[10%] top-[62.55%]'>
        <h2 ref={subtitleRef} className='mb-1 text-5xl font-extralight'>
          Creative Developer
        </h2>
        <div className='ml-1 flex items-center'>
          <h3>
            <strong className='mr-2 font-normal tracking-wide'>Available for new projects</strong>
          </h3>
          <span id='ping' className='size-2.5 rounded-full bg-lime-500'></span>
        </div>
      </div>
      <nav className='absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full p-2'>
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
