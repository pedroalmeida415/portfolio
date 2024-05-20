'use client'

import Pedro from '@/assets/pedro.svg'
import DownArrow from '@/assets/down-arrow.svg'

const Hero = () => {
  return (
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
  )
}

export { Hero }
