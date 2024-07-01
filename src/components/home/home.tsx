'use client'
import gsap from 'gsap'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import dynamic from 'next/dynamic'
import { suspend } from 'suspend-react'
import { Particles } from '@/components/sections/Particles'

import { LZMA } from '@/helpers/lzma'

// useful during development to reload view, otherwise it goes blank
const View = dynamic(() => import('@/components/view/view').then((mod) => mod.View), { ssr: false })

export const Home = () => {
  const { positions, multipliers } = suspend(async () => {
    // Initiate both requests in parallel
    const positionsData = getPositions()
    const multipliersData = getMultipliers()

    const [positions, multipliers] = await Promise.all([positionsData, multipliersData])

    return { positions, multipliers }
  }, [])

  const subtitleRef = useRef<HTMLHeadingElement | null>()
  const countdownRef = useRef<HTMLHeadingElement | null>()

  useGSAP(() => {
    gsap.fromTo(
      subtitleRef.current,
      { yPercent: 120 },
      { autoAlpha: 1, yPercent: 0, duration: 1, ease: 'power3.out', delay: 3.5 },
    )

    gsap.to('#ping', { rotateX: 180, rotateY: 180, duration: 0.75, ease: 'power1.inOut', repeat: -1, yoyo: true })

    gsap.to(countdownRef.current, { autoAlpha: 0, duration: 2.5, ease: 'none' })
  })

  const countdownVars = {
    '--s': 100,
  } as React.CSSProperties

  return (
    <section className='relative flex h-screen w-full flex-col p-6'>
      <div ref={countdownRef} id='countdown' className='countdown stopped' style={countdownVars}>
        <svg viewBox='-50 -50 100 100' strokeWidth='1.5'>
          <circle r='45'></circle>
          <circle r='45' pathLength='1'></circle>
        </svg>
      </div>
      <div className='mt-auto flex w-full justify-start'>
        <div className='w-1/12'></div>
        <div>
          <h1 className='sr-only'>Pedro Almeida</h1>
          <h2 ref={subtitleRef} className='invisible mb-5 text-5xl font-extralight opacity-0'>
            Creative Developer
          </h2>

          <nav>
            <ul className='mb-14 flex flex-col gap-y-4 leading-none *:z-10'>
              <li>
                <span className='block size-2 rounded-full bg-[#1d1d1d]'></span>
              </li>
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
          <div className='flex items-center'>
            <h3>
              <strong className='mr-2 font-normal tracking-wide'>Available for new projects</strong>
            </h3>
            <span id='ping' className='size-[10px] rounded-full bg-lime-500'></span>
          </div>
        </div>
      </div>
      <View className='absolute left-0 top-0 size-full'>
        <Particles positions={positions} staggerMultipliers={multipliers} />
      </View>
    </section>
  )
}

async function getPositions() {
  const res = await fetch(`/positions.bin`)
  const buffer = await res.arrayBuffer()
  const decompressedStreamBuffer = LZMA.decompressFile(buffer)
  const rawBytes: Uint8Array = decompressedStreamBuffer.toUint8Array()

  return new Float32Array(rawBytes.buffer)
}

async function getMultipliers() {
  const res = await fetch(`/multipliers.bin`)
  const buffer = await res.arrayBuffer()
  const decompressedStreamBuffer = LZMA.decompressFile(buffer)
  const rawBytes: Uint8Array = decompressedStreamBuffer.toUint8Array()

  return rawBytes
}
