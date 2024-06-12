'use client'

import dynamic from 'next/dynamic'

import Pedro from '@/assets/pedro.svg'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFBO, useTexture } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GPUComputationRenderer } from '@/components/three/GPUComputationRenderer'
import particlesVertexShader from '@/assets/shaders/gpgpu/vertex.glsl'
import particlesFragmentShader from '@/assets/shaders/gpgpu/fragment.glsl'
import gpgpuParticlesShader from '@/assets/shaders/gpgpu/particles.glsl'
import backgroundFragShader from '@/assets/shaders/reverberation/fragment.glsl'
import backgroundVertShader from '@/assets/shaders/reverberation/vertex.glsl'

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

let isLMBDown = false

const Hero = () => {
  return (
    <section className='relative h-screen p-6'>
      <Pedro id='pedro' className='invisible h-auto w-full opacity-20' />
      <div className='-mt-11 flex w-full justify-end'>
        <h1 className='sr-only'>Pedro Almeida</h1>
        <h2 className='mr-20 text-5xl font-extralight'>Creative Developer</h2>
      </div>
      <View
        onPointerDown={() => (isLMBDown = true)}
        onPointerUp={() => (isLMBDown = false)}
        className='absolute left-0 top-0 size-full'
      >
        <SceneWrapper />
      </View>
    </section>
  )
}

export { Hero }

const SceneWrapper = () => {
  const backgroundRenderTarget = useFBO({
    stencilBuffer: false,
    depthBuffer: false,
  })

  return (
    <Suspense fallback={null}>
      <Background renderTarget={backgroundRenderTarget} />
      <Particles backgroundTexture={backgroundRenderTarget.texture} />
    </Suspense>
  )
}

const Particles = ({ backgroundTexture }: { backgroundTexture: THREE.Texture }) => {
  const renderer = useThree((state) => state.gl)
  const viewport = useThree((state) => state.viewport)
  const pointer = useThree((state) => state.pointer)
  pointer.setY(-100)

  const resolution = useMemo(() => renderer.getDrawingBufferSize(new THREE.Vector2()), [renderer])

  const visibleWidth = viewport.width
  const visibleHeight = viewport.height

  // console.time('canvas')
  // const canvast0 = performance.now()
  const texture = useTexture('/pedro-rgb.png')
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
  const order = []

  const pixelGrouping = 2

  for (let y = 0; y < canvas.height; y += pixelGrouping) {
    if (canvas.height - y <= 24) break

    for (let x = 0; x < canvas.width; x += pixelGrouping) {
      let greenColorSum = 0
      let count = 0

      for (let dy = 0; dy < pixelGrouping; dy++) {
        for (let dx = 0; dx < pixelGrouping; dx++) {
          const index = (x + dx + (y + dy) * canvas.width) * 4
          if (data[index] !== 255) continue
          greenColorSum += data[index + 1]
          count++
        }
      }

      if (count > 0) {
        // Add point position and color
        const textureAspect = texture.image.width / texture.image.height

        const position = new THREE.Vector3(
          ((x + pixelGrouping / 2) / canvas.width) * visibleWidth - visibleWidth / 2,
          -((y + pixelGrouping / 2) / canvas.height) * (visibleWidth / textureAspect) +
            visibleWidth / textureAspect / 2,
          0,
        )
        positions.push(position.x, position.y, position.z)
        order.push(greenColorSum / count / 255) // Normalize the color values
      }
    }
  }

  baseGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  baseGeometry.setAttribute('_order', new THREE.Float32BufferAttribute(order, 1))

  // const canvast1 = performance.now()
  // console.timeEnd('canvas')
  // console.log(`Fetch texture + canvas parsing took ${canvast1 - canvast0} milliseconds.`)

  // useEffect(() => {
  //   const getBinary = async () => {
  //     // console.time('fetch')
  //     const fetcht0 = performance.now()
  //     try {
  //       const response = await fetch('/data.dat')
  //       const data = new DataView(await response.arrayBuffer())
  //       const tempArray = new Float32Array(data.byteLength / Float32Array.BYTES_PER_ELEMENT)
  //       const len = tempArray.length
  //       // Incoming data is raw floating point values
  //       // with little-endian byte ordering.
  //       for (let jj = 0; jj < len; ++jj) {
  //         tempArray[jj] = data.getFloat32(jj * Float32Array.BYTES_PER_ELEMENT, true)
  //       }
  //       console.log(tempArray)
  //     } catch (error) {
  //       console.log(error)
  //     } finally {
  //       // console.timeEnd('fetch')
  //       const fetcht1 = performance.now()
  //       console.log(`Fetch and parsing took ${fetcht1 - fetcht0} milliseconds.`)
  //     }
  //   }

  //   getBinary()
  // }, [])

  // --- Translate base geometry instead of points geometry for accurate raycast ---
  baseGeometry.translate(0, -textureHeight / 2 + visibleHeight / 2, 0)

  const orderAtt = baseGeometry.attributes._order
  const totalStaggerDuration = 3.0

  // --- GPU Compute ---
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
    baseParticlesTexture.image.data[i4 + 3] = totalStaggerDuration * orderAtt.array[i]
  }

  // Particles variable
  const particlesVariable = gpgpuCompute.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
  gpgpuCompute.setVariableDependencies(particlesVariable, [particlesVariable])

  // Uniforms
  particlesVariable.material.uniforms.uIsLMBDown = new THREE.Uniform(isLMBDown)
  particlesVariable.material.uniforms.uMouse = new THREE.Uniform(new THREE.Vector2(0, 100))
  particlesVariable.material.uniforms.uTime = new THREE.Uniform(0)
  particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0)
  particlesVariable.material.uniforms.uBase = new THREE.Uniform(baseParticlesTexture)

  // Init
  gpgpuCompute.init()

  // Geometry
  const particlesUvArray = new Float32Array(baseGeometryCount * 2)

  for (let y = 0; y < gpgpuSize; y++) {
    for (let x = 0; x < gpgpuSize; x++) {
      const i = y * gpgpuSize + x
      const i2 = i * 2

      // UV
      const uvX = (x + 0.5) / gpgpuSize
      const uvY = (y + 0.5) / gpgpuSize

      particlesUvArray[i2 + 0] = uvX
      particlesUvArray[i2 + 1] = uvY
    }
  }

  const particlesGeometry = new THREE.BufferGeometry()
  particlesGeometry.setDrawRange(0, baseGeometryCount)
  particlesGeometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUvArray, 2))

  // ---  Particle shader  ---
  const material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.035),
      uResolution: new THREE.Uniform(new THREE.Vector2(resolution.x, resolution.y)),
      uParticlesTexture: new THREE.Uniform(null),
      uBaseParticlesTexture: new THREE.Uniform(baseParticlesTexture),
      uBackgroundTexture: new THREE.Uniform(backgroundTexture),
    },
    depthTest: false,
    transparent: true,
  })

  const points = new THREE.Points(particlesGeometry, material)
  const planeArea = useRef<THREE.Mesh | null>()

  const uMouseVec = new THREE.Vector2()

  useFrame((state, delta) => {
    state.raycaster.setFromCamera(state.pointer, state.camera)
    const intersects = state.raycaster.intersectObject(planeArea.current)

    if (intersects.length > 0) {
      particlesVariable.material.uniforms.uMouse.value = uMouseVec.set(intersects[0].point.x, intersects[0].point.y)
    }

    // --- Update GPU Compute ---
    particlesVariable.material.uniforms.uTime.value = state.clock.elapsedTime
    particlesVariable.material.uniforms.uDeltaTime.value = delta
    particlesVariable.material.uniforms.uIsLMBDown.value = isLMBDown
    gpgpuCompute.compute()
    material.uniforms.uParticlesTexture.value = gpgpuCompute.getCurrentRenderTarget(particlesVariable).texture
  })

  useEffect(() => {
    return () => gpgpuCompute.dispose()
  }, [gpgpuCompute])

  return (
    <>
      <primitive object={points} position={[0, 0, 0.001]} />
      <mesh ref={planeArea}>
        <planeGeometry args={[visibleWidth, visibleHeight]} />
        <meshBasicMaterial map={backgroundTexture} transparent />
      </mesh>
    </>
  )
}

const Background = ({ renderTarget }: { renderTarget: THREE.WebGLRenderTarget<THREE.Texture> }) => {
  const renderer = useThree((state) => state.gl)

  const resolution = useMemo(() => renderer.getDrawingBufferSize(new THREE.Vector2()), [renderer])
  const cam = useMemo(() => new THREE.OrthographicCamera(), [])
  const scene = useMemo(() => new THREE.Scene(), [])

  const materialRef = useRef<THREE.RawShaderMaterial | null>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }

    state.gl.setRenderTarget(renderTarget)
    state.gl.render(scene, cam)
    state.gl.setRenderTarget(null)
  })

  return createPortal(
    <mesh frustumCulled={false}>
      <bufferGeometry drawRange={{ start: 0, count: 3 }} />
      <rawShaderMaterial
        ref={materialRef}
        glslVersion={THREE.GLSL3}
        vertexShader={backgroundVertShader}
        fragmentShader={backgroundFragShader}
        transparent
        depthTest={false}
        uniforms={{
          uTime: new THREE.Uniform(0),
          uSeed: new THREE.Uniform(Math.random() * 100),
          uResolution: new THREE.Uniform(new THREE.Vector2(resolution.x, resolution.y)),
        }}
      />
    </mesh>,
    scene,
  )
}
