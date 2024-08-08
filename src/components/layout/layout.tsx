'use client'

import { type PropsWithChildren, useRef, useEffect } from 'react'

import { useSetAtom } from 'jotai'

import { particlesDataAtom } from '~/store'

import { Canvas } from '~/components/canvas/canvas'

import { LZMA } from '~/helpers/lzma'

let didLayoutInit = false

export const Layout = ({ children }: PropsWithChildren) => {
  const setParticlesData = useSetAtom(particlesDataAtom)

  const eventSourceRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (didLayoutInit) return

    async function fetchParticlesData() {
      try {
        const positionsPromise = getParticlesData('positions')
        const multipliersPromise = getParticlesData('multipliers')
        const [positions, multipliers] = await Promise.all([positionsPromise, multipliersPromise])

        setParticlesData({ positions: new Float32Array(positions.buffer), multipliers })
      } catch (error) {
        console.log(error)
      }
    }
    fetchParticlesData()
    didLayoutInit = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <main ref={eventSourceRef} className='pointer-events-none h-screen w-full touch-auto overflow-auto'>
        {children}
      </main>
      <Canvas eventSource={eventSourceRef} />
    </>
  )
}

async function getParticlesData(type: 'positions' | 'multipliers') {
  const res = await fetch(`/${type}.bin`)
  const buffer = await res.arrayBuffer()
  const decompressedStreamBuffer = LZMA.decompressFile(buffer)
  const rawBytes: Uint8Array = decompressedStreamBuffer.toUint8Array()

  return rawBytes
}
