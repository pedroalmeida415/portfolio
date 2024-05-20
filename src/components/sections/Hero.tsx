'use client'

import dynamic from 'next/dynamic'

import Pedro from '@/assets/pedro.svg'
import DownArrow from '@/assets/down-arrow.svg'
import { Suspense, useEffect, useRef } from 'react'
import { Center, MeshDistortMaterial, Svg } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

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

      <View className='absolute left-0 top-0 size-full'>
        <ThreeComponent />
      </View>
    </section>
  )
}

export { Hero }

const ThreeComponent = () => {
  const { viewport } = useThree(({ viewport }) => ({ viewport }))

  return (
    <>
      <Center
        onCentered={({ container, width }) => {
          container.scale.setScalar(viewport.width / (width + 48.0))
        }}
      >
        <Svg
          fillMaterial={{
            wireframe: false,
          }}
          src='/pedro.svg'
          strokeMaterial={{
            wireframe: false,
          }}
        />
      </Center>
      <gridHelper args={[10, 10]} rotation={[1.5707963267948966, 0, 0]} />
      <Common color={0xf1efeb} />
    </>
  )
}

// I want to render a particle-based text in my react web app. To achieve this, I'll be using Three.js along with @react-three/fiber and @react-three/drei. The particles are going to fill up the text entirely, hence I'm using GPGPU particles to get better performance.

// To make the particles, I'm using a really high-poly 3D model of the text made in Blender, then extracting its geometry and using each vertex to generate a particle. The problem lies in that, not only I have to load heavy models just for generating the point cloud, the outline of the text isn't as sharp as if I was using a font.

// Since i'm already using an FBO to generate the particles, I want to know how I can skip the load of the model and use a texture that has the format of the text already, and then use that base texture as a mask to hide particles that are not within the text shape, thus make it more sharp as if using a font.
