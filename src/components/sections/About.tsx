import Image from 'next/image'
import profilePic from '@/assets/profile-pic.png'

const About = () => {
  return (
    <section className='flex items-start justify-start px-6 py-20'>
      <div className='w-3/12'>
        <h1 className='text-5xl font-extralight'>About me</h1>
      </div>
      <div className='w-5/12 pr-9'>
        <p className='text-[21.6px] leading-[1.75]'>
          Hi, I’m Pedro Almeida — pseudo-gamer, average AI enjoyer, and wannabe programming wizard based in Brazil.{' '}
          <br /> <br /> I’ve been working in the web industries for the past 5 years, which was mostly just me messing
          around and navigating through my career, but still allowed me to develop a crisp eye for details and adopt an
          iterative workflow that enables me to deliver with confidence. <br /> <br /> Since late 2023, I strive towards
          making great, personality-rich, “absolute cinema” digital experiences. <br />
          <br /> That said, deep down my biggest passion is getting to know other like-minded people who also aim for
          the long-term game.
        </p>
      </div>
      <div className='ml-auto w-3/12'>
        <Image
          className='h-auto w-full'
          src={profilePic}
          alt='Pedro staring at nothing, but thinking about everything.'
        />
      </div>
    </section>
  )
}

export { About }
