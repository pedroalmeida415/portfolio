'use client'

import { memo, useMemo, useRef, useState, type MutableRefObject } from 'react'

// import { Preload } from '@react-three/drei'

import { PerformanceMonitor, PerspectiveCamera } from '@react-three/drei'
import { Canvas as CanvasImpl, extend, useFrame, useThree } from '@react-three/fiber'
import { useAtomValue, useSetAtom } from 'jotai'
import { Perf } from 'r3f-perf'
// import { r3f } from '~/helpers/global'
import { Group, MathUtils, Object3D, Plane, Vector3 } from 'three'

import { isCanvasCreatedAtom, particlesDataAtom } from '~/store'

import { Background } from '~/components/background/background'
import { Cursor } from '~/components/cursor/cursor'
import { Particles } from '~/components/particles/particles'

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
  const particlesData = useAtomValue(particlesDataAtom)
  const setIsCanvasCreated = useSetAtom(isCanvasCreatedAtom)

  const initialDpr = useRef(typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1)

  const [dpr, setDpr] = useState(initialDpr.current)

  if (!particlesData) return null
  return (
    <CanvasImpl
      dpr={dpr}
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
      resize={{ scroll: false }}
      eventSource={eventSource.current!}
      eventPrefix='client'
      camera={{
        fov: calculateFov(window.innerWidth / window.innerHeight),
        aspect: window.innerWidth / window.innerHeight,
        position: [0, 0, 10],
        near: 9,
        far: 11,
      }}
      onCreated={({ gl, scene, camera }) => {
        gl.render(scene, camera)
        setIsCanvasCreated(true)
      }}
    >
      <PerformanceMonitor
        bounds={() => [57, Infinity]}
        iterations={7}
        factor={1}
        onDecline={({ factor }) => setDpr(0.5 + (initialDpr.current - 0.5) * factor)}
      />
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

const Camera = memo(() => {
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
})
Camera.displayName = 'Camera'

const Pointer3D = memo(() => {
  const pointer3DRef = useRef<Object3D | null>(null)
  const normalPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), [])

  useFrame((state) => {
    if (!pointer3DRef.current || state.raycaster.ray.direction.z === -1) return
    state.raycaster.ray.intersectPlane(normalPlane, pointer3DRef.current.position)
  }, -1)

  return (
    <object3D
      name='Pointer3D'
      ref={pointer3DRef}
      visible={false}
      renderOrder={-1}
      frustumCulled={false}
      matrixAutoUpdate={false}
      position={[0, 0, 0]}
    />
  )
})
Pointer3D.displayName = 'Pointer3D'
