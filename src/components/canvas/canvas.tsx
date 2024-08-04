'use client'

import { memo, useCallback, type MutableRefObject } from 'react'

// import { Preload } from '@react-three/drei'

import { PerspectiveCamera } from '@react-three/drei'
import { Canvas as CanvasImpl, useFrame, useThree } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
// import { Perf } from 'r3f-perf'
// import { r3f } from '~/helpers/global'
import { MathUtils } from 'three'

import { isHomeLoadedAtom } from '~/store'

import { Background } from '~/components/background/background'
import { Cursor } from '~/components/cursor/cursor'
import { Particles } from '~/components/particles/particles'

type Props = {
  eventSource: MutableRefObject<HTMLElement | null>
}

const calculateFov = (viewportAspect: number) => {
  const defaultFov = 50
  const particlesAspectRatio = 2.1843003033790924
  if (viewportAspect > particlesAspectRatio) return defaultFov
  const cameraHeight = Math.tan(MathUtils.degToRad(defaultFov / 2))
  const ratio = viewportAspect / particlesAspectRatio
  const newCameraHeight = cameraHeight / ratio
  return MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2
}

export const Canvas = memo(({ eventSource }: Props) => {
  const isHomeLoaded = useAtomValue(isHomeLoadedAtom)

  if (!isHomeLoaded) return null
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
      resize={{ scroll: false, debounce: 50 }}
      eventSource={eventSource.current!}
      eventPrefix='client'
      camera={{
        fov: calculateFov(window.innerWidth / window.innerHeight),
        aspect: window.innerWidth / window.innerHeight,
        position: [0, 0, 10],
        near: 9,
        far: 11,
      }}
    >
      <Camera />
      {/* <Background /> */}
      <Cursor />
      <Particles />

      {/* <Perf /> */}
      {/* <r3f.Out /> */}
      {/* <Preload all /> */}
    </CanvasImpl>
  )
})
Canvas.displayName = 'Canvas'

const Camera = memo(() => {
  const viewport = useThree((state) => state.viewport)

  const getFov = useCallback(() => calculateFov(viewport.aspect), [viewport.aspect])

  let distance: number
  useFrame((state) => {
    distance = -state.camera.position.z / state.raycaster.ray.direction.z
    state.raycaster.ray.direction.multiplyScalar(distance)
  }, -1)

  return (
    <PerspectiveCamera
      makeDefault
      manual
      position={[0, 0, 10]}
      fov={getFov()}
      aspect={viewport.aspect}
      near={9}
      far={11}
    />
  )
})
Camera.displayName = 'Camera'
