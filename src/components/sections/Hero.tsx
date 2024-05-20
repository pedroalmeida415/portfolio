'use client'

import dynamic from 'next/dynamic'

import Pedro from '@/assets/pedro.svg'
import DownArrow from '@/assets/down-arrow.svg'
import { Suspense, useEffect, useRef } from 'react'
import { Center, MeshDistortMaterial } from '@react-three/drei'
import { useLoader, useThree } from '@react-three/fiber'
import {
  Mesh,
  PlaneGeometry,
  CanvasTexture,
  MeshBasicMaterial,
  BufferGeometry,
  Vector3,
  PerspectiveCamera,
} from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 size-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

const TEXTURE_ASPECT_RATIO = 3.053232333713811

const Hero = () => {
  return (
    <section className='relative h-screen p-6'>
      <Pedro id='pedro' className='invisible mt-1 h-auto w-full' />
      <div className='-mt-11 flex w-full justify-end'>
        <h1 className='sr-only'>Pedro Almeida</h1>
        <h2 className='mr-8 text-5xl font-extralight'>
          Creative <br />
          Developer & Designer
        </h2>
      </div>
      <p className='absolute bottom-6 left-1/2 -translate-x-1/2 text-sm uppercase leading-none'>
        Keep Scrolling
        <DownArrow className='absolute -left-12 top-0 h-full w-auto' />
        <DownArrow className='absolute -right-12 top-0 h-full w-auto' />
      </p>

      <View className='absolute left-0 top-0 -z-10 size-full'>
        <Suspense fallback={null}>
          <ThreeComponent />
        </Suspense>
      </View>
    </section>
  )
}

export { Hero }

const ThreeComponent = () => {
  const { camera, size } = useThree(({ camera, size }) => {
    return {
      camera: camera as PerspectiveCamera,
      size,
    }
  })
  const result = useLoader(SVGLoader, '/pedro.svg')

  const viewBox: string[] = (result.xml as any).attributes.viewBox.value.split(' ') // ['0','0','1493','489']

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  // Determine canvas size and set it
  const svgWidth = Number(viewBox[2])
  const svgHeight = Number(viewBox[3])
  const svgAspectRatio = svgWidth / svgHeight
  canvas.width = size.width
  canvas.height = size.width / svgAspectRatio

  // Set canvas background (optional)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = '#000000'

  // Render each path from the SVG into the canvas
  result.paths.forEach((path) => {
    const shapes = path.toShapes(true)
    shapes.forEach((shape) => {
      context.beginPath()
      const points = shape.getPoints(64)
      points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y)
        } else {
          context.lineTo(point.x, point.y)
        }
      })
      context.closePath()
      context.fill()

      // Handle holes
      if (shape.holes.length > 0) {
        shape.holes.forEach((hole) => {
          context.beginPath()
          const holePoints = hole.getPoints()
          holePoints.forEach((point, index) => {
            if (index === 0) {
              context.moveTo(point.x, point.y)
            } else {
              context.lineTo(point.x, point.y)
            }
          })
          context.closePath()
          context.fillStyle = '#ffffff'

          context.fill()
        })
      }
    })
  })

  // Create a Texture from the Canvas
  const texture = new CanvasTexture(canvas)

  // ---  Calculate mesh dimensions for full screen ---
  const fovInRadians = (camera.fov * Math.PI) / 180
  const dist = camera.position.z
  const height = 2 * Math.tan(fovInRadians / 2) * dist // visible height
  const width = height * camera.aspect // visible width

  const geometry = new PlaneGeometry(width, width / svgAspectRatio)
  const material = new MeshBasicMaterial({ map: texture })
  const mesh = new Mesh(geometry, material)

  return (
    <>
      <Common color={0xf1efeb} />
      <primitive object={mesh} />
      <gridHelper args={[10, 10]} rotation={[1.5707963267948966, 0, 0]} />
    </>
  )
}
