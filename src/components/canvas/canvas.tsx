'use client'

import { memo, useEffect, useLayoutEffect, useMemo, type MutableRefObject } from 'react'

// import { Preload } from '@react-three/drei'
import { Canvas as CanvasImpl, useThree } from '@react-three/fiber'
// import { Perf } from 'r3f-perf'
import { useAtomValue } from 'jotai'

// import { r3f } from '~/helpers/global'
import { getParticlesDataAtom } from '~/store'

import { Background } from '~/components/background/background'
import { Cursor } from '~/components/cursor/cursor'
import { Particles } from '~/components/particles/particles'

import { getWorldSpaceCoords } from '~/helpers/shader.utils'

type Props = {
  eventSource: MutableRefObject<HTMLElement | null>
}

export const Canvas = memo(({ eventSource }: Props) => {
  const particlesRequest = useAtomValue(getParticlesDataAtom)

  if (!eventSource.current || particlesRequest.state !== 'hasData') return null
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
      eventSource={eventSource.current}
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
        <Particles positions={particlesRequest.data.positions} staggerMultipliers={particlesRequest.data.multipliers} />

      {/* <Perf /> */}
      {/* <r3f.Out /> */}
      {/* <Preload all /> */}
    </CanvasImpl>
  )
})
Canvas.displayName = 'Canvas'
