'use client'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'

// import { Preload } from '@react-three/drei'
import { Canvas as CanvasImpl, useThree } from '@react-three/fiber'
import dynamic from 'next/dynamic'
// import { Perf } from 'r3f-perf'
import { MathUtils, PerspectiveCamera } from 'three'

// import { r3f } from '~/helpers/global'
import { LZMA } from '~/helpers/lzma'

const Particles = dynamic(() => import('~/components/sections/Particles').then((mod) => mod.Particles))

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
        <>
          <main ref={ref} className='h-screen w-full touch-auto overflow-auto'>
            {children}
          </main>
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
            camera={{
              position: [0, 0, 10],
              fov: 50,
              near: 9,
              far: 11,
              manual: true,
            }}
          >
            <CameraHandler />
            <Particles positions={particlesData.positions} staggerMultipliers={particlesData.multipliers} />
            {/* <Perf /> */}
            {/* <r3f.Out /> */}
            {/* <Preload all /> */}
          </CanvasImpl>
        </>
      )}
    </>
  )
}

const CameraHandler = () => {
  const camera = useThree((state) => state.camera as PerspectiveCamera)

  const aspectRatio = 2.1843003033790924
  const defaultFov = 50

  useEffect(() => {
    const handleResize = () => {
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
    }
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [camera])

  return null
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
