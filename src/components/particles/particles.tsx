import { useEffect, useMemo, useRef } from 'react'

import { useFrame, useThree, extend } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
import { Points, ShaderMaterial, BufferGeometry, BufferAttribute, Vector2, type Object3D } from 'three'

import { particlesDataAtom } from '~/store'

import { GPUComputationRenderer } from '~/components/three/GPUComputationRenderer'

import { getWorldSpaceCoords, mapMangledUniforms, setUniform } from '~/helpers/shader.utils'

import { default as computePositionShader } from '~/assets/shaders/particles/compute-position.glsl'
import { default as particlesFragmentShader } from '~/assets/shaders/particles/fragment.glsl'
import { default as particlesVertexShader } from '~/assets/shaders/particles/vertex.glsl'

extend({ Points, ShaderMaterial, BufferGeometry, BufferAttribute })

export const Particles = () => {
  const { positions, multipliers: staggerMultipliers } = useAtomValue(particlesDataAtom)!
  // const textSvg = useLoader(SVGLoader, '/pedro-outline.svg')
  // const gradientTextureBitmap = useLoader(ImageBitmapLoader, '/pedro-green-gradient.png')

  const renderer = useThree((state) => state.gl)
  const viewport = useThree((state) => state.viewport)
  const size = useThree((state) => state.size)

  const particlesObjectRef = useRef<Points<BufferGeometry, ShaderMaterial> | null>(null)

  const { gpgpuCompute, particlesVariable, particlesUvArray, particlesPointer } = useMemo(() => {
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
      computePositionShader.sourceCode,
      baseParticlesTexture,
    )
    gpgpuCompute.setVariableDependencies(particlesVariable, [particlesVariable])

    const progressBar = document.getElementById('progress-bar') as HTMLElement
    const progressBarCoords = getWorldSpaceCoords(progressBar, viewport)

    const particlesPointer = new Vector2(0, progressBarCoords.centerY)

    const mappedUniforms = mapMangledUniforms(
      {
        uDeltaTime: { value: 0 },
        uBase: { value: baseParticlesTexture },
        uMouse: { value: particlesPointer },
        uIsLMBDown: { value: false },
        initialCoords: {
          value: [
            progressBarCoords.pointX1,
            progressBarCoords.pointX2,
            progressBarCoords.centerY,
            progressBarCoords.height,
          ],
        },
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

  useFrame((state, delta) => {
    if (!particlesObjectRef.current) return

    const pointer3D = state.scene.getObjectByName('Pointer3D') as Object3D
    particlesPointer.copy(pointer3D.position)

    // --- Update GPU Compute ---
    setUniform(particlesVariable, computePositionShader, 'uDeltaTime', delta)
    setUniform(particlesVariable, computePositionShader, 'uIsLMBDown', false)
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
          uSize: { value: size.width * 0.002 },
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
        vertexShader={particlesVertexShader.sourceCode}
        fragmentShader={particlesFragmentShader.sourceCode}
        uniforms={particlesInitialUniforms}
      />
    </points>
  )
}
