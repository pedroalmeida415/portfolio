import Image from 'next/image'

import collamapImg from '~/assets/collamap.png'
import freshland from '~/assets/freshland.png'
import paretoImg from '~/assets/pareto.png'
import rivellaImg from '~/assets/rivella.jpg'
import ShowcaseTitle from '~/assets/showcase.svg'

const Showcase = () => {
  return (
    <section className='overflow-hidden bg-offBlack px-6 py-20'>
      <h1 className='sr-only'>Showcase</h1>
      <ShowcaseTitle
        style={{
          width: '177%',
        }}
        className='mb-32 h-auto'
      />

      <div className='flex'>
        <div className='grid w-9/12 grid-flow-row grid-cols-2 gap-[6px]'>
          <Image src={collamapImg} alt='Website Logo' />
          <Image src={rivellaImg} alt='Website Logo' />
          <Image src={freshland} alt='Website Logo' />
          <Image src={paretoImg} alt='Website Logo' />
        </div>
        <div className='w-3/12 pl-6 text-white'>
          <ul>
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className={`mb-9 ${index !== 0 ? 'opacity-20' : ''}`}>
                <h3 className='mb-2 text-5xl uppercase'>Collamap</h3>
                <p className='mb-4'>Front-end / Performance / Interaction</p>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export { Showcase }
