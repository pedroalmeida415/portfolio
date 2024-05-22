'use client'

import dynamic from 'next/dynamic'

import Pedro from '@/assets/pedro.svg'
import DownArrow from '@/assets/down-arrow.svg'
import { Suspense } from 'react'
import { Center, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, PerspectiveCamera, Points, PointsMaterial, Vector3 } from 'three'

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
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const texture = useTexture('/pedro-rgb.png')

  // ---  Calculate screen dimensions ---
  const fovInRadians = (camera.fov * Math.PI) / 180
  const dist = camera.position.z
  const visibleHeight = 2 * Math.tan(fovInRadians / 2) * dist
  const visibleWidth = visibleHeight * camera.aspect

  const textureHeight = (texture.image.height * visibleWidth) / texture.image.width

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = texture.image.width
  canvas.height = texture.image.height

  // draw image on offscreen canvas i.e. web worker
  context.drawImage(texture.image, 0, 0, texture.image.width, texture.image.height, 0, 0, canvas.width, canvas.height)

  // --- Get canvas data ---
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data // RGBA data (4 values per pixel)

  // --- Create points for Three.js ---
  const geometry = new BufferGeometry()
  const positions = []
  const colors = []

  const pixelGrouping = 6

  for (let y = 0; y < canvas.height; y += pixelGrouping) {
    for (let x = 0; x < canvas.width; x += pixelGrouping) {
      let hasColoredPixel = false
      let offsetY = y

      if (offsetY + pixelGrouping * 2 >= canvas.height) break

      for (let i = 0; i < pixelGrouping ** 2; i++) {
        const clampedX = x + (i % pixelGrouping)

        if (i > 0 && clampedX === x) {
          offsetY++
        }

        const index = (clampedX + offsetY * canvas.width) * 4

        if (data[index] !== 0) {
          hasColoredPixel = true // Found non-black pixel
          break
        }
      }

      if (hasColoredPixel) {
        // Add point position and color
        const textureAspect = texture.image.width / texture.image.height

        const position = new Vector3(
          ((x + pixelGrouping / 2) / canvas.width) * visibleWidth - visibleWidth / 2,
          -((y + pixelGrouping / 2) / canvas.height) * (visibleWidth / textureAspect) +
            visibleWidth / textureAspect / 2,
          0,
        )
        positions.push(position.x, position.y, position.z)
        colors.push(0.239, 0.341, 0.855, 1.0)
      }
    }
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 4))

  const material = new PointsMaterial({
    size: 0.135, // Adjust particle size
    vertexColors: true, // Enable vertex colors
  })

  const points = new Points(geometry, material)

  return (
    <>
      {/* <mesh position={[0, visibleHeight / 2 - textureHeight / 2, 0]}>
        <planeGeometry args={[visibleWidth, textureHeight]} />
        <meshBasicMaterial map={texture} />
      </mesh> */}
      <primitive position={[0, visibleHeight / 2 - textureHeight / 2, 0.001]} object={points} />
      {/* <gridHelper args={[visibleHeight, 10]} rotation={[1.5707963267948966, 0, 0]} /> */}
    </>
  )
}
