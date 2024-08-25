import { memo, useEffect, useMemo, useRef } from 'react'

import { useFrame, useThree, extend } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
import { Points, ShaderMaterial, BufferGeometry, BufferAttribute, Vector2 } from 'three'

import { isMobileDeviceAtom, particlesDataAtom } from '~/store'

import { GPUComputationRenderer } from '~/components/three/GPUComputationRenderer'

import { mapMangledUniforms, setUniform } from '~/helpers/shader.utils'

import { default as computePositionShader } from '~/assets/shaders/particles/compute-position.glsl'
import { default as particlesFragmentShader } from '~/assets/shaders/particles/fragment.glsl'
import { default as particlesVertexShader } from '~/assets/shaders/particles/vertex.glsl'

extend({ Points, ShaderMaterial, BufferGeometry, BufferAttribute })

export const Particles = memo(() => {
  const { positions, multipliers: staggerMultipliers } = useAtomValue(particlesDataAtom)!
  const isMobile = useAtomValue(isMobileDeviceAtom)

  const renderer = useThree((state) => state.gl)
  const viewport = useThree((state) => state.viewport)

  const resolution = useMemo(
    () => renderer.getDrawingBufferSize(new Vector2()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const particlesObjectRef = useRef<Points<BufferGeometry, ShaderMaterial> | null>(null)
  const particleSizeMultiplier = isMobile ? 0.005 : 0.0018
  const loadingCircleRadius = isMobile ? 1.5 : 2.5

  const { gpgpuCompute, particlesVariable, particlesUvArray, particlesPointer } = useMemo(() => {
    // --- GPU Compute ---
    const baseGeometryCount = positions.length / 2
    const gpgpuSize = Math.ceil(Math.sqrt(baseGeometryCount))

    const particlesUvArray = new Int32Array(positions.length)

    for (let y = 0; y < gpgpuSize; ++y) {
      for (let x = 0; x < gpgpuSize; ++x) {
        const i = y * gpgpuSize + x
        const i2 = i * 2

        particlesUvArray[i2 + 0] = x
        particlesUvArray[i2 + 1] = y
      }
    }

    const gpgpuCompute = new GPUComputationRenderer(gpgpuSize, gpgpuSize, renderer)

    // Texture to store particles position
    const baseParticlesTexture = gpgpuCompute.createTexture()

    const totalStaggerDuration = 3
    // Fill texture with particles values
    for (let i = 0; i < baseGeometryCount; ++i) {
      const i2 = i * 2
      const i4 = i * 4

      // RGBA values for FBO texture from base geometry position
      baseParticlesTexture.image.data[i4 + 0] = positions[i2 + 0]
      baseParticlesTexture.image.data[i4 + 1] = positions[i2 + 1]
      baseParticlesTexture.image.data[i4 + 2] = 0
      baseParticlesTexture.image.data[i4 + 3] = totalStaggerDuration * staggerMultipliers[i]
    }

    // Particles variable
    const particlesVariable = gpgpuCompute.addVariable(
      'uParticles',
      computePositionShader.sourceCode.replace('{PARTICLES_CIRCLE_RADIUS}', loadingCircleRadius.toString(10)),
      baseParticlesTexture,
    )
    gpgpuCompute.setVariableDependencies(particlesVariable, [particlesVariable])

    const particlesPointer = new Vector2(0, 0)

    const mappedUniforms = mapMangledUniforms(
      {
        uDeltaTime: { value: 0 },
        uBase: { value: baseParticlesTexture },
        uMouse: { value: particlesPointer },
      },
      computePositionShader.uniforms,
    )
    particlesVariable.material.uniforms = mappedUniforms

    // Init
    gpgpuCompute.init()

    return {
      gpgpuCompute,
      particlesVariable,
      particlesUvArray,
      particlesPointer,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => () => gpgpuCompute.dispose(), [gpgpuCompute])
  useEffect(() => {
    if (!particlesObjectRef.current) return
    renderer.getDrawingBufferSize(resolution)
    setUniform(particlesObjectRef.current, particlesVertexShader, 'uSize', resolution.x * particleSizeMultiplier)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport])

  useFrame((state, delta) => {
    if (!particlesObjectRef.current) return

    const pointer3D = state.scene.getObjectByName('Pointer3D')!.position
    particlesPointer.copy(pointer3D)

    // --- Update GPU Compute ---
    setUniform(particlesVariable, computePositionShader, 'uDeltaTime', delta % 1)
    gpgpuCompute.compute()
    setUniform(
      particlesObjectRef.current,
      particlesVertexShader,
      'uParticlesTexture',
      gpgpuCompute.getCurrentRenderTarget(particlesVariable).texture,
    )
  })

  const particlesInitialUniforms = useMemo(
    () =>
      mapMangledUniforms(
        {
          uSize: { value: resolution.x * particleSizeMultiplier },
          uParticlesTexture: { value: gpgpuCompute.getCurrentRenderTarget(particlesVariable).texture },
        },
        particlesVertexShader.uniforms,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <points ref={particlesObjectRef} position={[0, 0, 0]} frustumCulled={false} matrixAutoUpdate={false}>
      <bufferGeometry
        ref={(ref) => {
          ref?.setDrawRange(0, positions.length / 2)
        }}
      >
        <bufferAttribute attach='attributes-aParticlesUv' array={particlesUvArray} itemSize={2} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthTest={false}
        depthWrite={false}
        vertexShader={particlesVertexShader.sourceCode}
        fragmentShader={particlesFragmentShader.sourceCode}
        uniforms={particlesInitialUniforms}
      />
    </points>
  )
})
Particles.displayName = 'Particles'
