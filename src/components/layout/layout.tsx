'use client'

import { type PropsWithChildren, useRef, useEffect } from 'react'

import { useAtom, useSetAtom } from 'jotai'

import { particlesDataAtom } from '~/store'

import { Canvas } from '~/components/canvas/canvas'

import { LZMA } from '~/helpers/lzma'

export const Layout = ({ children }: PropsWithChildren) => {
  const [particlesData, setParticlesData] = useAtom(particlesDataAtom)

  const eventSourceRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function fetchParticlesData() {
      try {
        const positionsPromise = getParticlesData('positions', controller.signal)
        const multipliersPromise = getParticlesData('multipliers', controller.signal)
        const [positions, multipliers] = await Promise.all([positionsPromise, multipliersPromise])

        setParticlesData({ positions: new Float32Array(positions.buffer), multipliers })
      } catch (error) {
        console.log(error)
      }
    }
    fetchParticlesData()

    return () => {
      controller.abort('Fetching particles data was aborted')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <main ref={eventSourceRef} className='h-screen w-full touch-auto overflow-auto'>
        {!particlesData && (
          <div className='progress'>
            <div className='progress-value'></div>
          </div>
        )}
        {particlesData && children}
      </main>
      <Canvas eventSource={eventSourceRef} />
    </>
  )
}

async function getParticlesData(type: 'positions' | 'multipliers', signal: AbortSignal) {
  const res = await fetch(`/${type}.bin`, { signal })
  const buffer = await res.arrayBuffer()
  const decompressedStreamBuffer = LZMA.decompressFile(buffer)
  const rawBytes: Uint8Array = decompressedStreamBuffer.toUint8Array()

  return rawBytes
}
