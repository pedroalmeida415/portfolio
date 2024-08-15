import { memo, useEffect, useMemo, useRef } from 'react'

import { useFrame, useThree, extend } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
import { Points, ShaderMaterial, BufferGeometry, BufferAttribute, Vector2 } from 'three'

import { particlesDataAtom } from '~/store'

import { GPUComputationRenderer } from '~/components/three/GPUComputationRenderer'

import { mapMangledUniforms, setUniform } from '~/helpers/shader.utils'

import { default as computePositionShader } from '~/assets/shaders/particles/compute-position.glsl'
import { default as particlesFragmentShader } from '~/assets/shaders/particles/fragment.glsl'
import { default as particlesVertexShader } from '~/assets/shaders/particles/vertex.glsl'

extend({ Points, ShaderMaterial, BufferGeometry, BufferAttribute })

export const Particles = memo(() => {
  const { positions, multipliers: staggerMultipliers } = useAtomValue(particlesDataAtom)!
  // const gltf = useLoader(GLTFLoader, '/particles-grid.glb')
  // const mesh = gltf.nodes.pedro as Mesh

  // const boundingBox = mesh.geometry.boundingBox as Box3
  // const positionsAtt = mesh.geometry.attributes.position
  // const multipliersAtt = mesh.geometry.attributes.color

  // const meshWidth = boundingBox.max.x
  // const meshHeight = boundingBox.max.y

  // const textSvg = useLoader(SVGLoader, '/pedro-outline.svg')
  // const gradientTextureBitmap = useLoader(ImageBitmapLoader, '/pedro-green-gradient.png')

  const renderer = useThree((state) => state.gl)
  const viewport = useThree((state) => state.viewport)

  const resolution = useMemo(
    () => renderer.getDrawingBufferSize(new Vector2()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

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

    // const positions = new Float32Array(positionsAtt.count * 2)
    // for (let i = 0; i < positionsAtt.count; ++i) {
    //   const i3 = i * 3
    //   let pointX = positionsAtt.array[i3 + 0]
    //   let pointY = positionsAtt.array[i3 + 1]

    //   const ndcX = (pointX / meshWidth) * 2 - 1
    //   const ndcY = (pointY / meshHeight) * 2 - 1

    //   const padding = viewport.width - 0.75

    //   // Adjust the NDC to viewport coordinates considering the aspect ratio
    //   const positionX = (ndcX * padding) / 2
    //   const positionY = (ndcY * meshHeight * padding) / meshWidth / 2

    //   const i2 = i * 2
    //   positions[i2 + 0] = positionX
    //   positions[i2 + 1] = positionY + 1.0
    // }

    // const multipliers = new Float32Array(multipliersAtt.count)
    // for (let i = 0; i < multipliersAtt.count; ++i) {
    //   const i4 = i * 4
    //   multipliers[i] = multipliersAtt.array[i4 + 1]
    // }

    // fetch(
    //   new Request('/api/encode?output=position', {
    //     method: 'POST',
    //     body: positions,
    //   }),
    // )
    // fetch(
    //   new Request('/api/encode?output=multipliers', {
    //     method: 'POST',
    //     body: multipliers,
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
      computePositionShader.sourceCode,
      baseParticlesTexture,
    )
    gpgpuCompute.setVariableDependencies(particlesVariable, [particlesVariable])

    const particlesPointer = new Vector2(0, 0)

    const mappedUniforms = mapMangledUniforms(
      {
        uDeltaTime: { value: 0 },
        uBase: { value: baseParticlesTexture },
        uMouse: { value: particlesPointer },
        uIsLMBDown: { value: false },
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
    setUniform(particlesObjectRef.current, particlesVertexShader, 'uSize', resolution.x * 0.0018)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport])

  useFrame((state, delta) => {
    if (!particlesObjectRef.current) return

    const pointer3D = state.scene.getObjectByName('Pointer3D')!.position
    particlesPointer.copy(pointer3D)

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
          uSize: { value: resolution.x * 0.0018 },
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
