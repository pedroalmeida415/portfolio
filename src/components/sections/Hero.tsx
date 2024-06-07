'use client'

import dynamic from 'next/dynamic'

import Pedro from '@/assets/pedro.svg'
import DownArrow from '@/assets/down-arrow.svg'
import { Suspense, useRef } from 'react'
import { ScreenQuad, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
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
      <p className='absolute bottom-6 left-1/2 -translate-x-1/2 text-sm uppercase leading-none'>
        Keep Scrolling
        <DownArrow className='absolute -left-12 top-0 h-full w-auto' />
        <DownArrow className='absolute -right-12 top-0 h-full w-auto' />
      </p>
      <View
        onPointerDown={() => (isLMBDown = true)}
        onPointerUp={() => (isLMBDown = false)}
        className='absolute left-0 top-0 size-full'
      >
        <Suspense fallback={null}>
          <Background />
          <Particles />
        </Suspense>
      </View>
    </section>
  )
}

export { Hero }

const Particles = () => {
  const size = useThree((state) => state.size)
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera)
  const renderer = useThree((state) => state.gl)

  // console.time('canvas')
  // const canvast0 = performance.now()
  const texture = useTexture('/pedro-rgb.png')

  // ---  Calculate screen dimensions ---
  const fovInRadians = (camera.fov * Math.PI) / 180
  const dist = camera.position.z
  const visibleHeight = 2 * Math.tan(fovInRadians / 2) * Math.abs(dist)
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
  const order = []

  const pixelGrouping = 3

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
  particlesVariable.material.uniforms.uMouse = new THREE.Uniform(new THREE.Vector2(0, 0))
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
      uSize: new THREE.Uniform(0.05),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(size.width * renderer.getPixelRatio(), size.height * renderer.getPixelRatio()),
      ),
      uParticlesTexture: new THREE.Uniform(null),
    },
    depthWrite: false,
    transparent: true,
  })

  const points = new THREE.Points(particlesGeometry, material)

  // Raycaster and plane for interaction
  const raycaster = new THREE.Raycaster()

  const mouseIntersectionRef = useRef(new THREE.Vector2(-0.75, -0.75))
  const planeArea = useRef<THREE.Mesh | null>()

  const onMouseMove = (e) => {
    mouseIntersectionRef.current.x = (e.clientX / size.width) * 2 - 1
    mouseIntersectionRef.current.y = -(e.clientY / size.height) * 2 + 1
  }

  const uMouseVec = new THREE.Vector2()

  useFrame((state, delta) => {
    raycaster.setFromCamera(mouseIntersectionRef.current, camera)
    const intersects = raycaster.intersectObject(planeArea.current)

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

  return (
    <>
      <primitive object={points} />
      <mesh ref={planeArea} onPointerMove={onMouseMove}>
        <planeGeometry args={[visibleWidth, visibleHeight]} />
        <meshBasicMaterial color={0x00ff00} visible={false} />
      </mesh>
      {/* <mesh>
        <planeGeometry args={[visibleWidth, visibleHeight]} />
        <meshBasicMaterial map={gpgpuCompute.getCurrentRenderTarget(particlesVariable).texture} />
      </mesh> */}
    </>
  )
}

const Background = () => {
  const size = useThree((state) => state.size)
  const renderer = useThree((state) => state.gl)

  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uDeltaTime.value = delta
    }
  })

  return (
    <ScreenQuad position={[0, 0, -1]} scale={[11, 11, 0]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={backgroundVertShader}
        fragmentShader={backgroundFragShader}
        transparent
        depthTest={false}
        depthWrite={false}
        uniforms={{
          uTime: new THREE.Uniform(0),
          uDeltaTime: new THREE.Uniform(0),
          uSeed: new THREE.Uniform(Math.random() * 100),
          uResolution: new THREE.Uniform(
            new THREE.Vector2(size.width * renderer.getPixelRatio(), size.height * renderer.getPixelRatio()),
          ),
        }}
      />
    </ScreenQuad>
  )
}