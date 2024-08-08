import { useEffect, useMemo, useRef } from 'react'

import { extend, useFrame, useThree } from '@react-three/fiber'
import { BufferGeometry, Mesh, type Object3D, ShaderMaterial, Vector2 } from 'three'

import { generateInteractionsTexture } from '~/helpers/generate-interactions-texture'
import { generateTextMask } from '~/helpers/generate-text-mask'
import { getWorldSpaceCoords, mapMangledUniforms, setUniform } from '~/helpers/shader.utils'

import { default as cursorFragmentShader } from '~/assets/shaders/cursor/fragment.glsl'
import { default as cursorVertexShader } from '~/assets/shaders/cursor/vertex.glsl'

extend({ Mesh, BufferGeometry, ShaderMaterial })

let previousViewportAspect: number | undefined
let pointerBufferInitilized = false

export const Cursor = () => {
  const viewport = useThree((state) => state.viewport)
  const size = useThree((state) => state.size)
  const renderer = useThree((state) => state.gl)

  const cursorMeshRef = useRef<Mesh<BufferGeometry, ShaderMaterial> | null>(null)

  useEffect(() => {
    if (!cursorMeshRef.current) return
    if (!previousViewportAspect) previousViewportAspect = viewport.aspect
    if (previousViewportAspect === viewport.aspect) return

    setUniform(cursorMeshRef.current, cursorFragmentShader, 'uUvScalar', [viewport.width / 2, viewport.height / 2])
    setUniform(
      cursorMeshRef.current,
      cursorFragmentShader,
      'uInteractionsTexture',
      generateInteractionsTexture(viewport),
    )

    const subtitle = document.getElementById('subtitle') as HTMLElement
    const { textTexture, textTextureScalar } = generateTextMask(subtitle, size)
    setUniform(cursorMeshRef.current, cursorFragmentShader, 'uTextTexture', textTexture)
    setUniform(cursorMeshRef.current, cursorFragmentShader, 'uTextTextureScalar', textTextureScalar)

    const resolution = renderer.getDrawingBufferSize(new Vector2())
    setUniform(cursorMeshRef.current, cursorFragmentShader, 'uResolution', resolution)

    previousViewportAspect = viewport.aspect
  }, [viewport, size, renderer])

  let bufferIndex = 0
  const bufferSize = 5 // Number of frames to delay
  const middleBufferIndex = Math.floor(bufferSize / 2)
  const { P0, P1, P2, pointerBuffer } = useMemo(
    () => {
      const navbar = document.getElementById('navbar') as HTMLElement
      const navbarCoords = getWorldSpaceCoords(navbar, viewport)

      const cursorPointer = new Vector2(0, navbarCoords.centerY)

      return {
        P0: cursorPointer,
        P1: cursorPointer.clone(),
        P2: cursorPointer.clone(),
        pointerBuffer: Array.from({ length: bufferSize }, () => cursorPointer.clone()),
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state) => {
    if (!cursorMeshRef.current || state.raycaster.ray.direction.z === -1) return

    const pointer3D = state.scene.getObjectByName('Pointer3D')!.position

    if (!pointerBufferInitilized) {
      for (let i = 0; i < bufferSize; ++i) {
        pointerBuffer[i].copy(pointer3D)
      }
      pointerBufferInitilized = true
    }

    P0.copy(pointer3D)

    pointerBuffer[bufferIndex].copy(P0)
    bufferIndex = (bufferIndex + 1) % bufferSize

    P2.copy(pointerBuffer[bufferIndex])

    const PT = pointerBuffer[(bufferIndex + middleBufferIndex) % bufferSize]
    calculateP1(P0, P2, PT, P1)
  })

  const cursorInitialUniforms = useMemo(
    () => {
      const subtitle = document.getElementById('subtitle') as HTMLElement
      const { textTexture, textTextureScalar } = generateTextMask(subtitle, size)

      const interactionsTexture = generateInteractionsTexture(viewport)
      const uvScalar = new Vector2(viewport.width / 2, viewport.height / 2)

      const resolution = renderer.getDrawingBufferSize(new Vector2())

      return mapMangledUniforms(
        {
          uMouse: { value: P0 },
          uP1: { value: P1 },
          uP2: { value: P2 },
          uUvScalar: { value: uvScalar },
          uTextTexture: { value: textTexture },
          uTextTextureScalar: { value: textTextureScalar },
          uInteractionsTexture: { value: interactionsTexture },
          uResolution: { value: resolution },
        },
        cursorFragmentShader.uniforms,
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return (
    <mesh ref={cursorMeshRef} frustumCulled={false} matrixAutoUpdate={false} position={[0, 0, 0]}>
      <bufferGeometry ref={(ref) => ref?.setDrawRange(0, 3)} />
      <shaderMaterial
        transparent
        depthTest={false}
        vertexShader={cursorVertexShader.sourceCode}
        fragmentShader={cursorFragmentShader.sourceCode}
        uniforms={cursorInitialUniforms}
      />
    </mesh>
  )
}

// P1=2P(0.5)−0.5P0−0.5P2
function calculateP1(P0: Vector2, P2: Vector2, Pt: Vector2, P1: Vector2) {
  P1.set(Pt.x * 2 - P0.x * 0.5 - P2.x * 0.5, Pt.y * 2 - P0.y * 0.5 - P2.y * 0.5)
}
