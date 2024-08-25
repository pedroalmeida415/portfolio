import { memo, useEffect, useMemo, useRef } from 'react'

import { extend, useFrame, useThree } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
import { BufferGeometry, Mesh, ShaderMaterial, Vector2 } from 'three'

import { isMobileDeviceAtom, isPointerDownAtom } from '~/store'

import { generateInteractionsTexture } from '~/helpers/generate-interactions-texture'
import { generateTextMask } from '~/helpers/generate-text-mask'
import { getUniform, mapMangledUniforms, setUniform } from '~/helpers/shader.utils'

import { default as cursorFragmentShader } from '~/assets/shaders/cursor/fragment.glsl'
import { default as cursorVertexShader } from '~/assets/shaders/cursor/vertex.glsl'

extend({ Mesh, BufferGeometry, ShaderMaterial })

let previousViewportAspect: number | undefined
let pointerBufferInitilized = false

export const Cursor = memo(() => {
  const isPointerDown = useAtomValue(isPointerDownAtom)
  const isMobile = useAtomValue(isMobileDeviceAtom)

  const viewport = useThree((state) => state.viewport)
  const renderer = useThree((state) => state.gl)

  const cursorMeshRef = useRef<Mesh<BufferGeometry, ShaderMaterial> | null>(null)

  const { resolution, uvScalar, interactionsTexture } = useMemo(
    () => {
      const interactionsTexture = generateInteractionsTexture(viewport)

      return {
        resolution: renderer.getDrawingBufferSize(new Vector2()),
        uvScalar: new Vector2(viewport.width / 2, viewport.height / 2),
        interactionsTexture,
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    if (!cursorMeshRef.current || isMobile) return
    if (!previousViewportAspect) previousViewportAspect = viewport.aspect
    if (previousViewportAspect === viewport.aspect) return

    // Dispose of current texture
    getUniform(cursorMeshRef.current, cursorFragmentShader, 'uTextTexture').dispose()

    // Generate new one for more accurate result
    const subtitle = document.getElementById('subtitle') as HTMLElement
    const { textTexture: newTextTexture, textTextureScalar: newTextTextureScalar } = generateTextMask(subtitle)
    setUniform(cursorMeshRef.current, cursorFragmentShader, 'uTextTexture', newTextTexture)
    setUniform(cursorMeshRef.current, cursorFragmentShader, 'uTextTextureScalar', newTextTextureScalar)

    generateInteractionsTexture(viewport, interactionsTexture)

    previousViewportAspect = viewport.aspect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport])

  useEffect(() => {
    if (!cursorMeshRef.current) return
    uvScalar.set(viewport.width / 2, viewport.height / 2)
    renderer.getDrawingBufferSize(resolution)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport])

  let bufferIndex = 0
  const bufferSize = 5 // Number of frames to delay
  const middleBufferIndex = Math.floor(bufferSize / 2)
  const { P0, P1, P2, pointerBuffer } = useMemo(
    () => {
      const cursorPointer = new Vector2(0, 100)

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

  useEffect(() => {
    if (!cursorMeshRef.current || !isMobile || isPointerDown) return
    pointerBufferInitilized = false
    P0.set(0, 100)
    P1.copy(P0)
    P2.copy(P0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPointerDown])

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
      let desktopUniforms: Record<string, unknown> = {}

      if (!isMobile) {
        const subtitle = document.getElementById('subtitle') as HTMLElement
        const { textTexture, textTextureScalar } = generateTextMask(subtitle)

        desktopUniforms.uTextTexture = { value: textTexture }
        desktopUniforms.uTextTextureScalar = { value: textTextureScalar }
        desktopUniforms.uInteractionsTexture = { value: interactionsTexture }
      }

      return mapMangledUniforms(
        {
          uMouse: { value: P0 },
          uP1: { value: P1 },
          uP2: { value: P2 },
          uUvScalar: { value: uvScalar },
          uResolution: { value: resolution },
          ...desktopUniforms,
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
        depthWrite={false}
        vertexShader={cursorVertexShader.sourceCode}
        fragmentShader={cursorFragmentShader.sourceCode.replace('INTERPOLATE_IS_MOBILE', isMobile ? '1' : '0')}
        uniforms={cursorInitialUniforms}
      />
    </mesh>
  )
})
Cursor.displayName = 'Cursor'

// P1=2P(0.5)−0.5P0−0.5P2
function calculateP1(P0: Vector2, P2: Vector2, Pt: Vector2, P1: Vector2) {
  P1.set(Pt.x * 2 - P0.x * 0.5 - P2.x * 0.5, Pt.y * 2 - P0.y * 0.5 - P2.y * 0.5)
}
