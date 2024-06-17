'use client'

import dynamic from 'next/dynamic'

import Pedro from '@/assets/pedro.svg'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
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
      <Pedro id='pedro' className='visible h-auto w-full opacity-20' />
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
  return (
    <Suspense fallback={null}>
      {/* <Background /> */}
      <Particles />
    </Suspense>
  )
}

const Particles = () => {
  const texture = useTexture('/pedro-rgb.png')

  const renderer = useThree((state) => state.gl)
  const viewport = useThree((state) => state.viewport)
  const pointer = useThree((state) => state.pointer)
  pointer.setY(-100)

  const resolution = useMemo(() => renderer.getDrawingBufferSize(new THREE.Vector2()), [renderer])

  const planeAreaRef = useRef<THREE.Mesh | null>()
  const pointsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null>()

  const { gpgpuCompute, baseGeometryCount, baseParticlesTexture, particlesVariable, particlesUvArray } = useMemo(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = texture.image.width
    canvas.height = texture.image.height

    // TODO draw image on offscreen canvas i.e. web worker
    context.drawImage(texture.image, 0, 0, canvas.width, canvas.height)

    // --- Get canvas data ---
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data // RGBA data (4 values per pixel)

    // --- Create base geomerty ---
    const textureHeightInViewport = (canvas.height * viewport.width) / canvas.width
    const positions = []

    const pixelGrouping = 2

    for (let y = 0; y < canvas.height; y += pixelGrouping) {
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
          // Calculate the normalized device coordinates (NDC)
          const ndcX = ((x + pixelGrouping / 2) / canvas.width) * 2 - 1
          const ndcY = (-(y + pixelGrouping / 2) / canvas.height) * 2 + 1

          // Adjust the NDC to viewport coordinates considering the aspect ratio
          const position = new THREE.Vector3(
            (ndcX * viewport.width) / 2,
            (ndcY * textureHeightInViewport) / 2,
            greenColorSum / count / 255,
          )

          positions.push(position.x, position.y, position.z)
        }
      }
    }
    canvas.remove()

    const baseGeometry = new THREE.BufferGeometry()
    baseGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    // --- Translate base geometry instead of points geometry for accurate raycast ---
    baseGeometry.translate(0, -textureHeightInViewport / 2 + viewport.height / 2, 0)

    // --- GPU Compute ---
    const baseGeometryCount = baseGeometry.attributes.position.count
    const gpgpuSize = Math.ceil(Math.sqrt(baseGeometryCount))

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

    const gpgpuCompute = new GPUComputationRenderer(gpgpuSize, gpgpuSize, renderer)

    // Texture to store particles position
    const baseParticlesTexture = gpgpuCompute.createTexture()

    const totalStaggerDuration = 2.5
    // Fill texture with particles values
    for (let i = 0; i < baseGeometryCount; i++) {
      const i3 = i * 3
      const i4 = i * 4

      // RGBA values for FBO texture from base geometry position
      baseParticlesTexture.image.data[i4 + 0] = baseGeometry.attributes.position.array[i3 + 0]
      baseParticlesTexture.image.data[i4 + 1] = baseGeometry.attributes.position.array[i3 + 1]
      baseParticlesTexture.image.data[i4 + 2] = 0
      baseParticlesTexture.image.data[i4 + 3] = totalStaggerDuration * baseGeometry.attributes.position.array[i3 + 2]
    }
    baseGeometry.dispose()

    // Particles variable
    const particlesVariable = gpgpuCompute.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
    gpgpuCompute.setVariableDependencies(particlesVariable, [particlesVariable])

    // Uniforms
    particlesVariable.material.uniforms.uIsLMBDown = { value: isLMBDown }
    particlesVariable.material.uniforms.uMouse = { value: new THREE.Vector2(0, -100) }
    particlesVariable.material.uniforms.uTime = { value: 0 }
    particlesVariable.material.uniforms.uDeltaTime = { value: 0 }
    particlesVariable.material.uniforms.uBase = { value: baseParticlesTexture }

    // Init
    gpgpuCompute.init()

    return {
      gpgpuCompute,
      baseGeometryCount,
      baseParticlesTexture,
      particlesVariable,
      particlesUvArray,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => gpgpuCompute.dispose(), [gpgpuCompute])

  const uMouseVec = new THREE.Vector2()
  useFrame((state, delta) => {
    state.raycaster.setFromCamera(state.pointer, state.camera)
    const intersects = state.raycaster.intersectObject(planeAreaRef.current)

    if (intersects.length) {
      particlesVariable.material.uniforms.uMouse.value = uMouseVec.set(intersects[0].point.x, intersects[0].point.y)
    }

    // --- Update GPU Compute ---
    particlesVariable.material.uniforms.uTime.value = state.clock.elapsedTime
    particlesVariable.material.uniforms.uDeltaTime.value = delta
    particlesVariable.material.uniforms.uIsLMBDown.value = isLMBDown
    gpgpuCompute.compute()
    pointsRef.current.material.uniforms.uParticlesTexture.value =
      gpgpuCompute.getCurrentRenderTarget(particlesVariable).texture
  })

  return (
    <>
      <points ref={pointsRef} position={[0, 0, 0.001]} frustumCulled={false}>
        <bufferGeometry ref={(ref) => ref?.setDrawRange(0, baseGeometryCount)}>
          <bufferAttribute attach='attributes-aParticlesUv' array={particlesUvArray} itemSize={2} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthTest={false}
          vertexShader={particlesVertexShader}
          fragmentShader={particlesFragmentShader}
          uniforms={{
            uSize: { value: resolution.x * 0.017 },
            uParticlesTexture: { value: null },
            uBaseParticlesTexture: { value: baseParticlesTexture },
          }}
        />
      </points>
      <mesh ref={planeAreaRef} visible={false}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <rawShaderMaterial />
      </mesh>
    </>
  )
}

const Background = () => {
  const renderer = useThree((state) => state.gl)

  const resolution = useMemo(() => renderer.getDrawingBufferSize(new THREE.Vector2()), [renderer])
  const materialRef = useRef<THREE.RawShaderMaterial | null>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh>
      <bufferGeometry ref={(ref) => ref?.setDrawRange(0, 3)} />
      <rawShaderMaterial
        ref={materialRef}
        glslVersion={THREE.GLSL3}
        vertexShader={backgroundVertShader}
        fragmentShader={backgroundFragShader}
        transparent
        depthTest={false}
        uniforms={{
          uTime: { value: 0 },
          uSeed: { value: Math.random() * 100 },
          uResolution: { value: [resolution.x, resolution.y] },
        }}
      />
    </mesh>
  )
}
