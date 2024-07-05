'use client'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { Canvas as CanvasImpl } from '@react-three/fiber'
// import { Preload } from '@react-three/drei'
// import { r3f } from '@/helpers/global'
// import { Perf } from 'r3f-perf'

import { LZMA } from '@/helpers/lzma'
import dynamic from 'next/dynamic'

const Particles = dynamic(() => import('@/components/sections/Particles').then((mod) => mod.Particles))

export default function Canvas({ children }: PropsWithChildren) {
  const [particlesData, setParticlesData] = useState<{ positions: Float32Array; multipliers: Uint8Array }>()
  const ref = useRef<HTMLDivElement | null>()

  useEffect(() => {
    async function getParticlesData() {
      const positionsData = getPositions()
      const multipliersData = getMultipliers()
      const [positions, multipliers] = await Promise.all([positionsData, multipliersData])

      setParticlesData({ positions, multipliers })
    }
    getParticlesData()
  }, [])

  return (
    <>
      {!particlesData && (
        <div className='progress'>
          <div className='progress-value'></div>
        </div>
      )}
      {particlesData && (
        <main
          ref={ref}
          style={{
            position: 'relative',
            width: ' 100%',
            minHeight: '100vh',
            overflow: 'auto',
            touchAction: 'auto',
          }}
        >
          {children}
          <CanvasImpl
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100%',
              height: '100vh',
              // pointerEvents: 'none',
              zIndex: '-1',
            }}
            gl={{
              stencil: false,
              depth: false,
            }}
            flat
            eventSource={ref}
            eventPrefix='client'
            camera={{ position: [0, 0, 10], fov: 50, near: 9, far: 11 }}
          >
            <Particles positions={particlesData.positions} staggerMultipliers={particlesData.multipliers} />
            {/* <Perf /> */}
            {/* @ts-ignore */}
            {/* <r3f.Out />
            <Preload all /> */}
          </CanvasImpl>
        </main>
      )}
    </>
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
