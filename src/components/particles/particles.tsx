import { useEffect, useMemo, useRef } from 'react'

import { useFrame, useThree, extend } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
import { Mesh, Points, ShaderMaterial, BufferGeometry, BufferAttribute, PlaneGeometry, Vector2 } from 'three'

import { cursorMeshAtom } from '~/store'

import { GPUComputationRenderer } from '~/components/three/GPUComputationRenderer'

import { mapMangledUniforms, setUniform } from '~/helpers/shader.utils'

import { default as particlesFragmentShader } from '~/assets/shaders/gpgpu/fragment.glsl'
import { default as gpgpuParticlesShader } from '~/assets/shaders/gpgpu/particles.glsl'
import { default as particlesVertexShader } from '~/assets/shaders/gpgpu/vertex.glsl'

extend({ Mesh, Points, ShaderMaterial, BufferGeometry, BufferAttribute, PlaneGeometry })

export const Particles = ({
  positions,
  staggerMultipliers,
}: {
  positions: Float32Array
  staggerMultipliers: Uint8Array
}) => {
  const cursorMeshRef = useAtomValue(cursorMeshAtom)
  // const textSvg = useLoader(SVGLoader, '/pedro-outline.svg')
  // const gradientTextureBitmap = useLoader(ImageBitmapLoader, '/pedro-green-gradient.png')

  const renderer = useThree((state) => state.gl)
  const pointer = useThree((state) => state.pointer)

  const resolution = useMemo(() => renderer.getDrawingBufferSize(new Vector2()), [renderer])

  const particlesObjectRef = useRef<Points<BufferGeometry, ShaderMaterial> | null>()

  const { gpgpuCompute, baseGeometryCount, particlesVariable, particlesUvArray } = useMemo(() => {
    // const svgWidth = Number((textSvg.xml as any).attributes.width.value)
    // const svgHeight = Number((textSvg.xml as any).attributes.height.value)
    // const svgHeightInViewport = (svgHeight * viewport.width) / svgWidth

    // const [positions] = generateGeometryPoints(textSvg, viewport, gradientTextureBitmap)

    // const baseGeometry = new BufferGeometry()
    // baseGeometry.setAttribute('position', new Float32BufferAttribute(positions, 2))

    // // --- Translate base geometry instead of points geometry for accurate raycast ---
    // baseGeometry.translate(0, -svgHeightInViewport / 2 + viewport.height / 2, 0)

    // fetch(
    //   new Request('/api/encode?output=position', {
    //     method: 'POST',
    //     body: baseGeometry.attributes.position.array,
    //   }),
    // )

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

    const totalStaggerDuration = 2.5
    // Fill texture with particles values
    for (let i = 0; i < baseGeometryCount; ++i) {
      const i2 = i * 2
      const i4 = i * 4
      const normalizedMultiplier = staggerMultipliers[i] / 255

      // RGBA values for FBO texture from base geometry position
      baseParticlesTexture.image.data[i4 + 0] = positions[i2 + 0]
      baseParticlesTexture.image.data[i4 + 1] = positions[i2 + 1]
      baseParticlesTexture.image.data[i4 + 2] = 0
      baseParticlesTexture.image.data[i4 + 3] = totalStaggerDuration * normalizedMultiplier
    }

    // Particles variable
    const particlesVariable = gpgpuCompute.addVariable(
      'uParticles',
      gpgpuParticlesShader.sourceCode,
      baseParticlesTexture,
    )
    gpgpuCompute.setVariableDependencies(particlesVariable, [particlesVariable])

    // Uniforms
    const mangledUniforms = mapMangledUniforms(
      {
        uDeltaTime: { value: 0 },
        uBase: { value: baseParticlesTexture },
        uMouse: { value: pointer },
        uIsLMBDown: { value: false },
      },
      gpgpuParticlesShader.uniforms,
    )
    particlesVariable.material.uniforms = mangledUniforms

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

  useFrame((state, delta) => {
    if (cursorMeshRef) {
      state.raycaster.setFromCamera(state.pointer, state.camera)
      const intersects = state.raycaster.intersectObject(cursorMeshRef)

      if (intersects.length) {
        const { point } = intersects[0]
        setUniform(particlesVariable, gpgpuParticlesShader, 'uMouse', point)
      }
    }

    // --- Update GPU Compute ---
    setUniform(particlesVariable, gpgpuParticlesShader, 'uDeltaTime', delta)
    setUniform(particlesVariable, gpgpuParticlesShader, 'uIsLMBDown', false)
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
          uSize: { value: resolution.x * 0.0016 },
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
          ref?.setDrawRange(0, baseGeometryCount)
        }}
      >
        <bufferAttribute attach='attributes-aParticlesUv' array={particlesUvArray} itemSize={2} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthTest={false}
        vertexShader={particlesVertexShader.sourceCode}
        fragmentShader={particlesFragmentShader.sourceCode}
        uniforms={particlesInitialUniforms}
      />
    </points>
  )
}