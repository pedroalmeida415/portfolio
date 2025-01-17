'use client'

import { memo, use, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'

// import { Preload } from '@react-three/drei'

import { PerformanceMonitor, PerspectiveCamera } from '@react-three/drei'
import { Canvas as CanvasImpl, extend, useFrame, useThree } from '@react-three/fiber'
import { useAtomValue, useSetAtom } from 'jotai'
import { Perf } from 'r3f-perf'
// import { r3f } from '~/helpers/global'
import { Group, MathUtils, Object3D, Plane, Ray, Vector3 } from 'three'

import { isCanvasCreatedAtom, isMobileDeviceAtom, isPointerDownAtom, particlesDataAtom } from '~/store'

import { Background } from '~/components/background/background'
import { Cursor } from '~/components/cursor/cursor'
import { Particles } from '~/components/particles/particles'

extend({ Object3D, PerspectiveCamera, Group })

type Props = {
  eventSource: MutableRefObject<HTMLElement | null>
}

const calculateFov = (viewportAspect: number) => {
  const defaultFov = 50
  let aspectRatio
  const desktopAspect = 2.1843003033790924
  const mobileAspect = 0.6035537635668909

  const isMobile = window.matchMedia('(max-width: 768px)').matches

  aspectRatio = isMobile ? mobileAspect : desktopAspect

  if (viewportAspect > aspectRatio) return defaultFov
  const cameraHeight = Math.tan(MathUtils.degToRad(defaultFov / 2))
  const ratio = viewportAspect / aspectRatio
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
        height: '100%',
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
        factor={1}
        flipflops={1}
        onDecline={({ factor }) => {
          setDpr(initialDpr.current * factor)
        }}
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
  const setSize = useThree((state) => state.setSize)
  const raycaster = useThree((state) => state.raycaster)

  const isPointerDown = useAtomValue(isPointerDownAtom)
  const isMobile = useAtomValue(isMobileDeviceAtom)

  const pointer3DRef = useRef<Object3D | null>(null)
  const normalPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), [])
  const defaultRay = useMemo(
    () => raycaster.ray.clone(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state) => {
    if (!pointer3DRef.current || state.raycaster.ray.direction.z === -1) return
    state.raycaster.ray.intersectPlane(normalPlane, pointer3DRef.current.position)
  }, -1)

  useEffect(() => {
    if (!pointer3DRef.current || !isMobile) return
    if (isPointerDown) {
      setSize(window.innerWidth, window.innerHeight)
      return
    }
    raycaster.ray.copy(defaultRay)
    pointer3DRef.current.position.set(0, 100, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPointerDown])

  return (
    <object3D
      name='Pointer3D'
      ref={pointer3DRef}
      visible={false}
      frustumCulled={false}
      matrixAutoUpdate={false}
      position={[0, 100, 0]}
    />
  )
})
Pointer3D.displayName = 'Pointer3D'
