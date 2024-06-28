'use client'
import { PropsWithChildren, useRef } from 'react'
import { Canvas as CanvasImpl } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { r3f } from '@/helpers/global'
// import { Perf } from 'r3f-perf'

export default function Canvas({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement | null>()

  return (
    <main
      ref={ref}
      style={{
        position: 'relative',
        width: ' 100%',
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
          pointerEvents: 'none',
          zIndex: '-1',
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
        {/* <Perf /> */}
        {/* @ts-ignore */}
        <r3f.Out />
        <Preload all />
      </CanvasImpl>
    </main>
  )
}
