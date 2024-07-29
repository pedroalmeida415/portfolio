import { useEffect, useMemo, useRef } from 'react'

import { useFrame, useThree, extend } from '@react-three/fiber'
import { Mesh, Points, ShaderMaterial, BufferGeometry, BufferAttribute, PlaneGeometry, Vector2, Vector3 } from 'three'
import { GlslVariableMap } from 'webpack-glsl-minify'

import { GPUComputationRenderer } from '~/components/three/GPUComputationRenderer'

import { generateInteractionsTexture } from '~/helpers/generate-interactions-texture'
import { generateTextMask } from '~/helpers/generate-text-mask'

import { default as cursorFragmentShader } from '~/assets/shaders/cursor/fragment.glsl'
import { default as cursorVertexShader } from '~/assets/shaders/cursor/vertex.glsl'
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
  // const textSvg = useLoader(SVGLoader, '/pedro-outline.svg')
  // const gradientTextureBitmap = useLoader(ImageBitmapLoader, '/pedro-green-gradient.png')

  const renderer = useThree((state) => state.gl)
  const viewport = useThree((state) => state.viewport)
  const pointer = useThree((state) => state.pointer)
  pointer.set(0, -4.0435247)

  const resolution = useMemo(() => renderer.getDrawingBufferSize(new Vector2()), [renderer])

  const cursorObjectRef = useRef<Mesh<PlaneGeometry, ShaderMaterial> | null>()
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

  useEffect(() => {
    if (cursorObjectRef.current) {
      setUniform(cursorObjectRef.current, cursorFragmentShader, 'uUvScalar', [viewport.width / 2, viewport.height / 2])
      setUniform(
        cursorObjectRef.current,
        cursorFragmentShader,
        'uInteractionsTexture',
        generateInteractionsTexture(viewport),
      )
    }
  }, [viewport])

  const { textTexture, textTextureScalar } = useMemo(() => generateTextMask(), [])

  let bufferIndex = 0
  const bufferSize = 5 // Number of frames to delay
  const middleBufferIndex = Math.floor(bufferSize / 2)

  const P1 = useMemo(() => new Vector2(), [])
  const mousePositions = useMemo(
    () => Array.from({ length: bufferSize }, () => new Vector2(pointer.x, pointer.y)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state, delta) => {
    state.raycaster.setFromCamera(state.pointer, state.camera)
    const intersects = state.raycaster.intersectObject(cursorObjectRef.current)

    if (intersects.length) {
      const { point } = intersects[0]

      mousePositions[bufferIndex].set(point.x, point.y)
      bufferIndex = (bufferIndex + 1) % bufferSize
      const PT = mousePositions[(bufferIndex + middleBufferIndex) % bufferSize]
      const P2 = mousePositions[bufferIndex]

      calculateP1(point, P2, PT, P1)

      setUniform(cursorObjectRef.current, cursorFragmentShader, 'uMouse', point)
      setUniform(cursorObjectRef.current, cursorFragmentShader, 'uP1', P1)
      setUniform(cursorObjectRef.current, cursorFragmentShader, 'uP2', P2)

      setUniform(particlesVariable, gpgpuParticlesShader, 'uMouse', point)
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

  const cursorInitialUniforms = useMemo(
    () =>
      mapMangledUniforms(
        {
          uMouse: { value: pointer },
          uP1: { value: pointer },
          uP2: { value: pointer },
          uUvScalar: { value: [viewport.width / 2, viewport.height / 2] },
          uTextTexture: { value: textTexture },
          uTextTextureScalar: { value: textTextureScalar },
          uInteractionsTexture: { value: generateInteractionsTexture(viewport) },
        },
        cursorFragmentShader.uniforms,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

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
    <>
      <mesh ref={cursorObjectRef} frustumCulled={false} matrixAutoUpdate={false} position={[0, 0, 0]}>
        <planeGeometry args={[viewport.width + 0.001, viewport.height + 0.001]} />
        <shaderMaterial
          depthTest={false}
          vertexShader={cursorVertexShader.sourceCode}
          fragmentShader={cursorFragmentShader.sourceCode}
          uniforms={cursorInitialUniforms}
        />
      </mesh>
      <points ref={particlesObjectRef} position={[0, 0, 0.001]} frustumCulled={false} matrixAutoUpdate={false}>
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
    </>
  )
}

function mapMangledUniforms(uniforms, map: GlslVariableMap) {
  return Object.entries(uniforms).reduce((acc, [key, value]) => {
    const mangledKey = map[key].variableName
    acc[mangledKey] = value
    return acc
  }, {})
}

function setUniform(mesh, shader, uniformName, value) {
  mesh.material.uniforms[shader.uniforms[uniformName].variableName].value = value
}

// P1=2P(0.5)−0.5P0−0.5P2
function calculateP1(P0: Vector3, P2: Vector2, Pt: Vector2, P1: Vector2) {
  const x = Pt.x * 2 - P0.x * 0.5 - P2.x * 0.5,
    y = Pt.y * 2 - P0.y * 0.5 - P2.y * 0.5

  P1.set(x, y)
}
