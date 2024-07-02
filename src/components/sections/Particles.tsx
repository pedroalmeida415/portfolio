import { useFrame, useThree, extend } from '@react-three/fiber'
import { GPUComputationRenderer } from '@/components/three/GPUComputationRenderer'

import particlesVertexShader from '@/assets/shaders/gpgpu/vertex.glsl'
import particlesFragmentShader from '@/assets/shaders/gpgpu/fragment.glsl'
import gpgpuParticlesShader from '@/assets/shaders/gpgpu/particles.glsl'

import {
  Mesh,
  Points,
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  PlaneGeometry,
  RawShaderMaterial,
  Vector2,
} from 'three'
import { useEffect, useMemo, useRef } from 'react'
extend({ Mesh, Points, ShaderMaterial, BufferGeometry, BufferAttribute, PlaneGeometry, RawShaderMaterial })

export const Particles = ({
  positions,
  staggerMultipliers,
}: {
  positions: Float32Array
  staggerMultipliers: Uint8Array
}) => {
  const renderer = useThree((state) => state.gl)
  const viewport = useThree((state) => state.viewport)
  const size = useThree((state) => state.size)
  const pointer = useThree((state) => state.pointer)
  pointer.setY(-100)

  const planeAreaRef = useRef<Mesh | null>()
  const pointsRef = useRef<Points<BufferGeometry, ShaderMaterial> | null>()

  const { gpgpuCompute, baseGeometryCount, particlesVariable, particlesUvArray } = useMemo(() => {
    const baseGeometry = new BufferGeometry()
    baseGeometry.setAttribute('position', new BufferAttribute(positions, 2))

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
      const i2 = i * 2
      const i4 = i * 4
      const normalizedMultiplier = staggerMultipliers[i] / 255

      // RGBA values for FBO texture from base geometry position
      baseParticlesTexture.image.data[i4 + 0] = baseGeometry.attributes.position.array[i2 + 0]
      baseParticlesTexture.image.data[i4 + 1] = baseGeometry.attributes.position.array[i2 + 1]
      baseParticlesTexture.image.data[i4 + 2] = 0
      baseParticlesTexture.image.data[i4 + 3] = totalStaggerDuration * normalizedMultiplier
    }
    baseGeometry.dispose()

    // Particles variable
    const particlesVariable = gpgpuCompute.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
    gpgpuCompute.setVariableDependencies(particlesVariable, [particlesVariable])

    // Uniforms
    particlesVariable.material.uniforms.uDeltaTime = { value: 0 }
    particlesVariable.material.uniforms.uBase = { value: baseParticlesTexture }
    particlesVariable.material.uniforms.uMouse = { value: new Vector2(0, -100) }
    particlesVariable.material.uniforms.uIsLMBDown = { value: false }

    // Init
    gpgpuCompute.init()

    return {
      gpgpuCompute,
      baseGeometryCount,
      particlesVariable,
      particlesUvArray,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => gpgpuCompute.dispose(), [gpgpuCompute])

  const uMouseVec = new Vector2()
  useFrame((state, delta) => {
    state.raycaster.setFromCamera(state.pointer, state.camera)
    const intersects = state.raycaster.intersectObject(planeAreaRef.current)

    if (intersects.length) {
      particlesVariable.material.uniforms.uMouse.value = uMouseVec.set(intersects[0].point.x, intersects[0].point.y)
    }

    // --- Update GPU Compute ---
    particlesVariable.material.uniforms.uDeltaTime.value = delta
    particlesVariable.material.uniforms.uIsLMBDown.value = false
    gpgpuCompute.compute()
    pointsRef.current.material.uniforms.uParticlesTexture.value =
      gpgpuCompute.getCurrentRenderTarget(particlesVariable).texture
  })

  return (
    <>
      <points ref={pointsRef} position={[0, 0, 0.001]} frustumCulled={false} matrixAutoUpdate={false}>
        <bufferGeometry
          ref={(ref) => {
            ref?.setDrawRange(0, baseGeometryCount)
            document.getElementById('countdown')?.firstElementChild?.remove()
          }}
        >
          <bufferAttribute attach='attributes-aParticlesUv' array={particlesUvArray} itemSize={2} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthTest={false}
          vertexShader={particlesVertexShader}
          fragmentShader={particlesFragmentShader}
          uniforms={{
            uSize: { value: size.width * 0.002 },
            uParticlesTexture: { value: null },
          }}
        />
      </points>
      <mesh ref={planeAreaRef} visible={false} frustumCulled={false} matrixAutoUpdate={false}>
        <planeGeometry args={[viewport.width + 0.001, viewport.height + 0.001]} />
        <rawShaderMaterial depthTest={false} />
      </mesh>
    </>
  )
}
