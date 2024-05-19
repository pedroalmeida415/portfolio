'use client'

import Concept from './assets/concept.svg'

const Services = () => {
  return (
    <section className='h-screen px-6 pt-20'>
      <div className='mb-10 flex'>
        <span className='w-3/12'></span>
        <h1 className='text-5xl font-light'>What I do</h1>
      </div>
      <div className='mb-12 flex'>
        <span className='w-2/12'></span>
        <Concept className='h-auto w-8/12' />
      </div>
      <div className='flex text-[21.6px] leading-[1.50]'>
        <span className='w-2/12'></span>
        <p className='w-1/12'>01</p>
        <div className='w-3/12'>
          <p className='mb-9'>It’s all about taking ideas and refining them into something excellent.</p>
          <button className='flex h-[70px] items-center justify-start rounded-full bg-[#3D57DA] px-8 text-lg text-white'>
            Get in touch
            <span className='ml-8 size-[10px] rounded-full bg-white'></span>
          </button>
        </div>
        <span className='w-1/12'></span>
        <ul className='w-2/12 *:mb-3'>
          <li>/ Web Design</li>
          <li>/ Interaction Design</li>
          <li>/ Creative Ideation</li>
          <li>/ Storytelling</li>
        </ul>
      </div>
    </section>
  )
}

export { Services }
