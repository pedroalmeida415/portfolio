import dynamic from 'next/dynamic'

const Home = dynamic(() => import('@/components/home/home').then((mod) => mod.Home), {
  ssr: false,
  loading: () => (
    <div className='countdown'>
      <svg viewBox='-50 -50 100 100' strokeWidth='1.5'>
        <circle r='45'></circle>
        <circle r='45' pathLength='1'></circle>
      </svg>
    </div>
  ),
})

export default function Page() {
  return <Home />
}
