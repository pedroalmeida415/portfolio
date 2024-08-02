'use client'

import { type MutableRefObject, useCallback } from 'react'

// import { Preload } from '@react-three/drei'
import { PerspectiveCamera } from '@react-three/drei'
import { Canvas as CanvasImpl } from '@react-three/fiber'
// import { Perf } from 'r3f-perf'
import { useAtomValue } from 'jotai'
import { MathUtils, type PerspectiveCamera as PerspectiveCameraType } from 'three'

// import { r3f } from '~/helpers/global'
import { getParticlesDataAtom } from '~/store'

import { Background } from '~/components/background/background'
import { Cursor } from '~/components/cursor/cursor'
import { Particles } from '~/components/particles/particles'

const aspectRatio = 2.1843003033790924
const defaultFov = 50

type Props = {
  eventSource: MutableRefObject<HTMLElement | null>
}

export default function Canvas({ eventSource }: Props) {
  const particlesRequest = useAtomValue(getParticlesDataAtom)

  const handleResize = useCallback((camera: PerspectiveCameraType) => {
    camera.aspect = window.innerWidth / window.innerHeight

    if (camera.aspect > aspectRatio) {
      // window too narrow
      camera.fov = defaultFov
    } else {
      // window too large
      const cameraHeight = Math.tan(MathUtils.degToRad(defaultFov / 2))
      const ratio = camera.aspect / aspectRatio
      const newCameraHeight = cameraHeight / ratio
      camera.fov = MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2
    }
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  }, [])

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
        // manual: true,
        fov: 50,
        position: [0, 0, 10],
        near: 9,
        far: 11,
      }}
    >
      {/* <PerspectiveCamera
        makeDefault
        position={[0, 0, 10]}
        fov={50}
        near={9}
        far={11}
        manual
        ref={(cameraRef) => {
          if (cameraRef) {
            window.addEventListener('resize', handleResize.bind(null, cameraRef))
          }
        }}
      /> */}
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
