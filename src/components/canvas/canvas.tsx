'use client'
import { PropsWithChildren, useRef } from 'react'
import { Canvas as CanvasImpl } from '@react-three/fiber'
import { Particles } from '../sections/Particles'
// import { Preload } from '@react-three/drei'
// import { r3f } from '@/helpers/global'
// import { Perf } from 'r3f-perf'

import { suspend } from 'suspend-react'
import { LZMA } from '@/helpers/lzma'

export default function Canvas({ children }: PropsWithChildren) {
  const { positions, multipliers } = suspend(async () => {
    // Initiate both requests in parallel
    const positionsData = getPositions()
    const multipliersData = getMultipliers()

    const [positions, multipliers] = await Promise.all([positionsData, multipliersData])

    return { positions, multipliers }
  }, [])
  const ref = useRef<HTMLDivElement | null>()

  return (
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
          // zIndex: '-1',
        }}
        gl={{
          stencil: false,
          depth: false,
        }}
        flat
        eventSource={ref}
        eventPrefix='client'
        camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 1000 }}
      >
        <Particles positions={positions} staggerMultipliers={multipliers} />
        {/* <Perf /> */}
        {/* @ts-ignore */}
        {/* <r3f.Out />
        <Preload all /> */}
      </CanvasImpl>
    </main>
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
