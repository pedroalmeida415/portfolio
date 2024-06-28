'use client'
import gsap from 'gsap'
import Pedro from '@/assets/pedro.svg'
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

    // Initiate both requests in parallel
    const positionsData = getPositions()
    const multipliersData = getMultipliers()

    const [positions, multipliers] = await Promise.all([positionsData, multipliersData])

    return { positions, multipliers }
  }, [])

  const subtitleRef = useRef<HTMLHeadingElement | null>()

  useGSAP(() => {
    gsap.fromTo(
      subtitleRef.current,
      { yPercent: 120 },
      { autoAlpha: 1, yPercent: 0, duration: 1, ease: 'power3.out', delay: 3.5 },
    )
  })

  return (
    <section className='relative h-screen p-6'>
      <Pedro id='pedro' className='invisible h-auto w-full opacity-20' />
      <div className='-mt-11 flex w-full justify-end'>
        <h1 className='sr-only'>Pedro Almeida</h1>
        <h2 ref={subtitleRef} className='invisible mr-20 text-5xl font-extralight opacity-0'>
          Creative Developer
        </h2>
      </div>
      <View className='absolute left-0 top-0 size-full'>
        <Particles positions={positions} staggerMultipliers={multipliers} />
      </View>
    </section>
  )
}
