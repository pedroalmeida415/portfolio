import Image from 'next/image'
import logo from '@/assets/logo.png'

const Navbar = () => {
  return (
    <header className='absolute left-0 top-0 w-full p-6'>
      <nav className='flex w-full justify-start text-sm uppercase'>
        <div className='mr-1 flex w-1/12 items-center'>
          <Image height={14} src={logo} alt='Website Logo' />
        </div>
        <div className='flex items-center'>
          <em className='mr-2 not-italic'>Available for new projects</em>
          <span className='size-[10px] rounded-full bg-lime-500'></span>
        </div>
        <ul className='ml-auto flex w-2/12 items-center justify-between *:z-10'>
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
  )
}

export { Navbar }
