'use client'

import Image from 'next/image'
import Pedro from './assets/pedro.svg'
import DownArrow from './assets/down-arrow.svg'
import logo from './assets/logo.png'

const Hero = () => {
  return (
    <>
      <header className='absolute left-0 top-0 z-10 w-full p-6'>
        <nav className='flex w-full justify-start text-sm uppercase'>
          <div className='mr-1 flex w-1/12 items-center'>
            <Image height={14} src={logo} alt='Website Logo' />
          </div>
          <div className='flex items-center'>
            <em className='mr-2 not-italic'>Available for new projects</em>
            <span className='size-[10px] rounded-full bg-lime-500'></span>
          </div>
          <ul className='ml-auto flex w-2/12 items-center justify-between'>
            <li>
              <a href='#about'>About</a>
            </li>
            <li>
              <a href='#about'>Work</a>
            </li>
            <li>
              <a href='#about'>Contact</a>
            </li>
          </ul>
        </nav>
      </header>
      <section className='relative h-screen p-6'>
        <Pedro className='mt-1 h-auto w-full' />
        <div className='-mt-11 flex w-full justify-end'>
          <h1 className='sr-only'>Pedro Almeida</h1>
          <h2 className='mr-8 text-5xl font-extralight'>
            Creative <br />
            Developer & Designer
          </h2>
        </div>
        <p className='absolute bottom-6 left-1/2 -translate-x-1/2 text-sm uppercase leading-none'>
          Keep Scrolling
          <DownArrow className='absolute -left-12 top-0 h-full w-auto' />
          <DownArrow className='absolute -right-12 top-0 h-full w-auto' />
        </p>
      </section>
    </>
  )
}

export { Hero }
