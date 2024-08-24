'use client'

import { type PropsWithChildren, useRef, useEffect } from 'react'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'

import { isMobileDeviceAtom, isPointerDownAtom, particlesDataAtom } from '~/store'

import { Canvas } from '~/components/canvas/canvas'

import { LZMA } from '~/helpers/lzma'

let didLayoutInit = false

export const Layout = ({ children }: PropsWithChildren) => {
  const isMobile = useAtomValue(isMobileDeviceAtom)
  const setParticlesData = useSetAtom(particlesDataAtom)
  const setIsPointerDown = useSetAtom(isPointerDownAtom)

  const eventSourceRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (didLayoutInit) return

    async function fetchParticlesData() {
      try {
        const positionsPromise = getParticlesData('positions', isMobile)
        const multipliersPromise = getParticlesData('multipliers', isMobile)
        const [positions, multipliers] = await Promise.all([positionsPromise, multipliersPromise])

        setParticlesData({ positions, multipliers })
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
      <main
        onPointerUp={() => {
          if (isMobile) {
            setIsPointerDown(false)
          }
        }}
        onPointerDown={() => {
          if (isMobile) {
            setIsPointerDown(true)
          }
        }}
        ref={eventSourceRef}
        className='pointer-events-none size-full touch-none'
      >
        {children}
      </main>
      <Canvas eventSource={eventSourceRef} />
    </>
  )
}

async function getParticlesData(type: 'positions' | 'multipliers', isMobile: boolean) {
  const res = await fetch(`/${type}${isMobile ? '-mobile' : ''}.bin`)
  const buffer = await res.arrayBuffer()
  const decompressedStreamBuffer = LZMA.decompressFile(buffer)
  const rawBytes: Uint8Array = decompressedStreamBuffer.toUint8Array()

  return new Float32Array(rawBytes.buffer)
}
