import { useEffect, useMemo, useRef } from 'react'

import { useFrame, useThree, extend } from '@react-three/fiber'
import {
  Mesh,
  Points,
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  PlaneGeometry,
  RawShaderMaterial,
  Vector2,
  Vector3,
  CanvasTexture,
} from 'three'

import cursorFragmentShader from '@/assets/shaders/cursor/fragment.glsl'
import cursorVertexShader from '@/assets/shaders/cursor/vertex.glsl'
import particlesFragmentShader from '@/assets/shaders/gpgpu/fragment.glsl'
import gpgpuParticlesShader from '@/assets/shaders/gpgpu/particles.glsl'
import particlesVertexShader from '@/assets/shaders/gpgpu/vertex.glsl'

import { GPUComputationRenderer } from '@/components/three/GPUComputationRenderer'
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
  pointer.set(0, -4.0435247)

  const planeAreaRef = useRef<Mesh<PlaneGeometry, ShaderMaterial> | null>()
  const pointsRef = useRef<Points<BufferGeometry, ShaderMaterial> | null>()

  const { gpgpuCompute, baseGeometryCount, particlesVariable, particlesUvArray, textTexture } = useMemo(() => {
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
    particlesVariable.material.uniforms.uMouse = { value: pointer }
    particlesVariable.material.uniforms.uIsLMBDown = { value: false }

    // Init
    gpgpuCompute.init()

    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.fontVariationSettings = "'wght' 200"
    canvas.style.display = 'none'
    document.body.appendChild(canvas)

    const text = 'Creative Developer'
    const font = getComputedStyle(document.body).getPropertyValue('--font-neue-montreal-variable')
    const fontSize = 48

    const blurColor = '#ff0000'
    const baseBlur = 1
    const blurRepeatCount = 10
    const blurIncrement = 1

    const ctx = canvas.getContext('2d')
    ctx.font = `${fontSize}px ${font}`
    ctx.textBaseline = 'middle'

    const textMeasurements = ctx.measureText(text)
    const textWidth = textMeasurements.width
    const textHeight = textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent

    canvas.width = textWidth + (baseBlur + blurRepeatCount * blurIncrement) * 3
    canvas.height = textHeight + (baseBlur + blurRepeatCount * blurIncrement) * 3

    const topHalfDist = canvas.height / 2 - textMeasurements.actualBoundingBoxAscent
    const lowerHalfDist = canvas.height / 2 - textMeasurements.actualBoundingBoxDescent
    const textYOffset = topHalfDist - lowerHalfDist

    const textX = canvas.width / 2 - textWidth / 2
    const textY = canvas.height / 2 + textYOffset

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.shadowColor = blurColor
    ctx.shadowBlur = baseBlur
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    ctx.font = `${fontSize}px ${font}`
    ctx.textBaseline = 'middle'
    ctx.fillStyle = blurColor
    ctx.fillText(text, textX, textY)

    for (let i = 0; i < blurRepeatCount; i++) {
      ctx.shadowBlur += blurIncrement
      ctx.fillText(text, textX, textY)
    }

    const textTexture = new CanvasTexture(canvas)
    textTexture.generateMipmaps = false

    return {
      gpgpuCompute,
      baseGeometryCount,
      particlesVariable,
      particlesUvArray,
      textTexture,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => () => gpgpuCompute.dispose(), [gpgpuCompute])

  let bufferIndex = 0
  const bufferSize = 7 // Number of frames to delay
  const middleBufferIndex = Math.floor(bufferSize / 2)

  const P1 = useMemo(() => new Vector2(), [])
  const mousePositions = useMemo(
    () => Array.from({ length: bufferSize }, () => new Vector2(pointer.x, pointer.y)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state, delta) => {
    state.raycaster.setFromCamera(state.pointer, state.camera)
    const intersects = state.raycaster.intersectObject(planeAreaRef.current)

    if (intersects.length) {
      const { point } = intersects[0]

      mousePositions[bufferIndex].set(point.x, point.y)
      bufferIndex = (bufferIndex + 1) % bufferSize
      const PT = mousePositions[(bufferIndex + middleBufferIndex) % bufferSize]
      const P2 = mousePositions[bufferIndex]

      calculateP1(point, P2, PT, P1)

      if (PT.distanceTo(P1) > PT.distanceTo(P2)) {
        P1.set(P2.x, P2.y)
      }

      particlesVariable.material.uniforms.uMouse.value = point

      planeAreaRef.current.material.uniforms.uMouse.value = point
      planeAreaRef.current.material.uniforms.uP1.value = P1
      planeAreaRef.current.material.uniforms.uP2.value = P2
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
      <mesh ref={planeAreaRef} frustumCulled={false} matrixAutoUpdate={false} position={[0, 0, 0]}>
        <planeGeometry args={[viewport.width + 0.001, viewport.height + 0.001]} />
        <shaderMaterial
          depthTest={false}
          vertexShader={cursorVertexShader}
          fragmentShader={cursorFragmentShader}
          uniforms={{
            uMouse: { value: pointer },
            uP1: { value: pointer },
            uP2: { value: pointer },
            uUvScalar: { value: [viewport.width / 2, viewport.height / 2] },
            uTextTexture: { value: textTexture },
            uTextTextureSize: { value: [textTexture.image.width, textTexture.image.height] },
          }}
        />
      </mesh>
      <points ref={pointsRef} position={[0, 0, 0.001]} frustumCulled={false} matrixAutoUpdate={false}>
        <bufferGeometry
          ref={(ref) => {
            ref?.setDrawRange(0, baseGeometryCount)
            document.getElementById('progress-bar')?.firstElementChild?.remove()
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
    </>
  )
}

function getWorldSpaceCoords(element, paddingX = 0, paddingY = 0, trimEnds = false) {
  const box = element.getBoundingClientRect()
  const bodyBoundingRect = document.body.getBoundingClientRect()
  const bodyWidth = bodyBoundingRect.width
  const bodyHeight = bodyBoundingRect.height

  const centerX = (box.left + box.right) / 2
  const centerY = (box.top + box.bottom) / 2

  const ndcX = (centerX / bodyWidth) * 2 - 1
  const ndcY = -(centerY / bodyHeight) * 2 + 1

  const heightOffset = trimEnds ? -box.height : 0
  paddingX += heightOffset
  const ndcWidth = (box.width + paddingX) / bodyWidth
  const ndcHeight = (box.height + paddingY) / bodyHeight

  const viewportWidth = 19.42105551423707
  const viewportHeight = 9.326153163099972

  const ndcX2 = (ndcX * viewportWidth) / 2
  const ndcY2 = (ndcY * viewportHeight) / 2

  const ndcWidth2 = (ndcWidth * viewportWidth) / 2
  const ndcHeight2 = (ndcHeight * viewportHeight) / 2

  const pointX1 = ndcX2 - ndcWidth2
  const pointX2 = ndcX2 + ndcWidth2

  return {
    pointX1: Number(pointX1.toFixed(7)),
    pointX2: Number(pointX2.toFixed(7)),
    centerY: Number(ndcY2.toFixed(7)),
    centerX: Number(ndcX2.toFixed(7)),
    width: Number(ndcWidth2.toFixed(7)),
    height: Number(ndcHeight2.toFixed(7)),
  }
}

// P1=2P(0.5)−0.5P0−0.5P2
function calculateP1(P0: Vector3, P2: Vector2, Pt: Vector2, P1: Vector2) {
  let PtX = Pt.x,
    PtY = Pt.y,
    P0X = P0.x,
    P0Y = P0.y,
    P2X = P2.x,
    P2Y = P2.y

  PtX *= 2
  PtY *= 2
  P0X *= 0.5
  P0Y *= 0.5
  P2X *= 0.5
  P2Y *= 0.5

  const x = PtX - P0X - P2X
  const y = PtY - P0Y - P2Y

  P1.set(x, y)
}
