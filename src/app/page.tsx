import dynamic from 'next/dynamic'

const Home = dynamic(() => import('@/components/home/home').then((mod) => mod.Home), {
  ssr: false,
  loading: () => (
    <div className='relative h-screen w-full'>
      <div
        id='carregando'
        className='absolute right-1/2 top-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center'
      >
        <svg className='-ml-1 mr-3 size-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      </div>
    </div>
  ),
})

export default function Page() {
  return <Home />
}
