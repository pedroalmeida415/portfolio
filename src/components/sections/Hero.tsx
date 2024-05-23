'use client'

import dynamic from 'next/dynamic'

import Pedro from '@/assets/pedro.svg'
import DownArrow from '@/assets/down-arrow.svg'
import { Suspense, useEffect, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import particlesVertexShader from '@/assets/shaders/gpgpu/vertex.glsl'
import particlesFragmentShader from '@/assets/shaders/gpgpu/fragment.glsl'
import gpgpuParticlesShader from '@/assets/shaders/gpgpu/particles.glsl'

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
          Creative Developer
          <br />& Designer
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
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera)
  const renderer = useThree((state) => state.gl)

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

  // TODO draw image on offscreen canvas i.e. web worker
  context.drawImage(texture.image, 0, 0, texture.image.width, texture.image.height, 0, 0, canvas.width, canvas.height)

  // --- Get canvas data ---
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data // RGBA data (4 values per pixel)

  // --- Create base geomerty ---
  const baseGeometry = new THREE.BufferGeometry()
  const positions = []
  const colors = []

  const pixelGrouping = 6

  for (let y = 0; y < canvas.height; y += pixelGrouping) {
    if (canvas.height - y <= 24) break

    for (let x = 0; x < canvas.width; x += pixelGrouping) {
      let colorSum = { r: 0, g: 0, b: 0 }
      let count = 0

      for (let dy = 0; dy < pixelGrouping; dy++) {
        for (let dx = 0; dx < pixelGrouping; dx++) {
          const index = (x + dx + (y + dy) * canvas.width) * 4
          if (data[index] === 0) continue
          colorSum.r += data[index]
          colorSum.g += data[index + 1]
          colorSum.b += data[index + 2]
          count++
        }
      }

      if (count > 0) {
        let avgColor = {
          r: colorSum.r / count,
          g: colorSum.g / count,
          b: colorSum.b / count,
        }
        if (avgColor.r < 100) continue

        // Add point position and color
        const textureAspect = texture.image.width / texture.image.height

        const position = new THREE.Vector3(
          ((x + pixelGrouping / 2) / canvas.width) * visibleWidth - visibleWidth / 2,
          -((y + pixelGrouping / 2) / canvas.height) * (visibleWidth / textureAspect) +
            visibleWidth / textureAspect / 2,
          0,
        )
        positions.push(position.x, position.y, position.z)
        colors.push(avgColor.r / 255, avgColor.g / 255, avgColor.b / 255, 1.0) // Normalize the color values
      }
    }
  }

  baseGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  baseGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4))

  // --- GPU Compute ---
  const gpgpu = useRef<GPUComputationRenderer>()
  const particlesVariableRef = useRef<Variable>()

  const baseGeometryCount = baseGeometry.attributes.position.count
  const gpgpuSize = Math.ceil(Math.sqrt(baseGeometryCount))

  const gpgpuCompute = new GPUComputationRenderer(gpgpuSize, gpgpuSize, renderer)

  // Texture to store particles position
  const baseParticlesTexture = gpgpuCompute.createTexture()

  // Fill texture with particles values
  for (let i = 0; i < baseGeometryCount; i++) {
    const i3 = i * 3
    const i4 = i * 4

    // RGBA values for FBO texture from base geometry position
    baseParticlesTexture.image.data[i4 + 0] = baseGeometry.attributes.position.array[i3 + 0]
    baseParticlesTexture.image.data[i4 + 1] = baseGeometry.attributes.position.array[i3 + 1]
    baseParticlesTexture.image.data[i4 + 2] = baseGeometry.attributes.position.array[i3 + 2]
    baseParticlesTexture.image.data[i4 + 3] = Math.random()
  }

  // Particles variable
  const particlesVariable = gpgpuCompute.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
  gpgpuCompute.setVariableDependencies(particlesVariable, [particlesVariable])

  // Uniforms
  particlesVariable.material.uniforms.uTime = new THREE.Uniform(0)
  particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0)
  particlesVariable.material.uniforms.uBase = new THREE.Uniform(baseParticlesTexture)
  particlesVariable.material.uniforms.uFlowFieldInfluence = new THREE.Uniform(0.5)
  particlesVariable.material.uniforms.uFlowFieldStrength = new THREE.Uniform(2)
  particlesVariable.material.uniforms.uFlowFieldFrequency = new THREE.Uniform(0.5)

  // Init
  gpgpuCompute.init()

  // Save refs
  gpgpu.current = gpgpuCompute
  particlesVariableRef.current = particlesVariable

  // Geometry
  const particlesUvArray = new Float32Array(baseGeometryCount * 2)
  const sizesArray = new Float32Array(baseGeometryCount)

  for (let y = 0; y < gpgpuSize; y++) {
    for (let x = 0; x < gpgpuSize; x++) {
      const i = y * gpgpuSize + x
      const i2 = i * 2

      // UV
      const uvX = (x + 0.5) / gpgpuSize
      const uvY = (y + 0.5) / gpgpuSize

      particlesUvArray[i2 + 0] = uvX
      particlesUvArray[i2 + 1] = uvY

      // Size
      sizesArray[i] = Math.random()
    }
  }

  const particlesGeometry = new THREE.BufferGeometry()
  particlesGeometry.setDrawRange(0, baseGeometryCount)
  particlesGeometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUvArray, 2))
  particlesGeometry.setAttribute('aColor', baseGeometry.attributes.color)
  particlesGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  }

  // ---  Particle shader  ---
  const material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.135),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio),
      ),
      uParticlesTexture: new THREE.Uniform(null),
    },
  })

  const points = new THREE.Points(particlesGeometry, material)

  useFrame((state, delta) => {
    // --- Update GPU Compute ---
    const elapsedTime = state.clock.getElapsedTime()
    particlesVariableRef.current.material.uniforms.uTime.value = elapsedTime
    particlesVariableRef.current.material.uniforms.uDeltaTime.value = delta
    gpgpu.current.compute()
    material.uniforms.uParticlesTexture.value = gpgpu.current.getCurrentRenderTarget(
      particlesVariableRef.current,
    ).texture
  })

  return (
    <>
      <primitive position={[0, visibleHeight / 2 - textureHeight / 2, 0.001]} object={points} />
    </>
  )
}
