'use client'

import SayHello from '@/assets/say-hello.svg'
import PedroOutline from '@/assets/pedro-outline.svg'

const Contact = () => {
  return (
    <section className='overflow-hidden bg-[#1d1d1d] px-6 pt-20 text-white'>
      <div className='mb-6 flex w-full flex-col items-center justify-center border-y border-solid border-t-white py-52'>
        <h1 className='mb-16 text-5xl font-extralight'>Let&apos;s work together!</h1>
        <SayHello className='w-8/12 border-b-2 border-solid border-amber-500 pb-5' />
      </div>
      <footer className='flex justify-between text-sm'>
        <p>© 2024 Pedro Almeida</p>
        <ul className='flex gap-x-6 underline'>
          <li>
            <a href='' target='_blank' rel='noopener noreferrer'>
              X /Twitter
            </a>
          </li>
          <li>
            <a href='' target='_blank' rel='noopener noreferrer'>
              LinkedIn
            </a>
          </li>
          <li>
            <a href='' target='_blank' rel='noopener noreferrer'>
              Read.cv
            </a>
          </li>
        </ul>
        <p>Type: Nova Sans, PP Neue Montreal</p>
      </footer>
      <PedroOutline className='-mt-4' />
    </section>
  )
}

export { Contact }
