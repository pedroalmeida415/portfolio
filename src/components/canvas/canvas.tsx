'use client'

import { useMemo, useRef, type MutableRefObject } from 'react'

// import { Preload } from '@react-three/drei'

import { PerspectiveCamera } from '@react-three/drei'
import { Canvas as CanvasImpl, extend, useFrame, useThree } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
// import { Perf } from 'r3f-perf'
// import { r3f } from '~/helpers/global'
import { Group, MathUtils, Object3D, Plane, Vector3 } from 'three'

import { isHomeLoadedAtom } from '~/store'

import { Background } from '~/components/background/background'
import { Cursor } from '~/components/cursor/cursor'
import { Particles } from '~/components/particles/particles'

import { getWorldSpaceCoords } from '~/helpers/shader.utils'

extend({ Object3D, PerspectiveCamera, Group })

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

export const Canvas = ({ eventSource }: Props) => {
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
      <Pointer3D />
      <Camera />

      {/* <Background /> */}
      <Cursor />
      <Particles />

      {/* <Perf /> */}
      {/* <r3f.Out /> */}
      {/* <Preload all /> */}
    </CanvasImpl>
  )
}

const Camera = () => {
  const viewport = useThree((state) => state.viewport)

  return (
    <PerspectiveCamera
      manual
      makeDefault
      far={11}
      near={9}
      position={[0, 0, 10]}
      aspect={viewport.aspect}
      fov={calculateFov(viewport.aspect)}
    />
  )
}

const Pointer3D = () => {
  const viewport = useThree((state) => state.viewport)

  const pointer3DRef = useRef<Object3D | null>(null)
  const normalPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), [])

  useFrame((state) => {
    if (!pointer3DRef.current || state.raycaster.ray.direction.z === -1) return
    state.raycaster.ray.intersectPlane(normalPlane, pointer3DRef.current.position)
  }, -1)

  const initialYPosition = useMemo(() => {
    const navbar = document.getElementById('navbar') as HTMLElement
    const navbarCoords = getWorldSpaceCoords(navbar, viewport)

    return navbarCoords.centerY
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <object3D
      name='Pointer3D'
      ref={pointer3DRef}
      visible={false}
      renderOrder={-1}
      frustumCulled={false}
      matrixAutoUpdate={false}
      position={[0, initialYPosition, 0]}
    />
  )
}
