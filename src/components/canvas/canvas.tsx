'use client'

import { type MutableRefObject } from 'react'

// import { Preload } from '@react-three/drei'
import { Canvas as CanvasImpl } from '@react-three/fiber'
// import { Perf } from 'r3f-perf'
import { useAtomValue } from 'jotai'

// import { r3f } from '~/helpers/global'
import { getParticlesDataAtom } from '~/store'

import { Background } from '~/components/background/background'
import { Cursor } from '~/components/cursor/cursor'
import { Particles } from '~/components/particles/particles'

type Props = {
  eventSource: MutableRefObject<HTMLElement | null>
}

export default function Canvas({ eventSource }: Props) {
  const particlesRequest = useAtomValue(getParticlesDataAtom)

  return (
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
      eventSource={eventSource.current ?? undefined}
      eventPrefix='client'
      camera={{
        fov: 50,
        position: [0, 0, 10],
        near: 9,
        far: 11,
      }}
    >
      {/* <Background /> */}
      <Cursor />
      {particlesRequest.state === 'hasData' && (
        <Particles positions={particlesRequest.data.positions} staggerMultipliers={particlesRequest.data.multipliers} />
      )}

      {/* <Perf /> */}
      {/* <r3f.Out /> */}
      {/* <Preload all /> */}
    </CanvasImpl>
  )
}
