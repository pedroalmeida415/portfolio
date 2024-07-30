import { useEffect, useMemo, useRef } from 'react'

import { extend, useFrame, useThree } from '@react-three/fiber'
import { useSetAtom } from 'jotai'
import { Mesh, PlaneGeometry, ShaderMaterial, Vector2, type Vector3 } from 'three'

import { cursorMeshAtom } from '~/store'

import { generateInteractionsTexture } from '~/helpers/generate-interactions-texture'
import { generateTextMask } from '~/helpers/generate-text-mask'
import { mapMangledUniforms, setUniform } from '~/helpers/shader.utils'

import { default as cursorFragmentShader } from '~/assets/shaders/cursor/fragment.glsl'
import { default as cursorVertexShader } from '~/assets/shaders/cursor/vertex.glsl'

extend({ Mesh, PlaneGeometry, ShaderMaterial })

export const Cursor = () => {
  const setCursorMeshAtom = useSetAtom(cursorMeshAtom)

  const viewport = useThree((state) => state.viewport)
  const pointer = useThree((state) => state.pointer)
  pointer.set(0, -4.0435247)

  const cursorMeshRef = useRef<Mesh<PlaneGeometry, ShaderMaterial> | null>()

  useEffect(() => {
    if (cursorMeshRef.current) setCursorMeshAtom(cursorMeshRef.current)
  }, [setCursorMeshAtom])

  useEffect(() => {
    if (cursorMeshRef.current) {
      setUniform(cursorMeshRef.current, cursorFragmentShader, 'uUvScalar', [viewport.width / 2, viewport.height / 2])
      setUniform(
        cursorMeshRef.current,
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
    const intersects = state.raycaster.intersectObject(cursorMeshRef.current)

    if (intersects.length) {
      const { point } = intersects[0]

      mousePositions[bufferIndex].set(point.x, point.y)
      bufferIndex = (bufferIndex + 1) % bufferSize
      const PT = mousePositions[(bufferIndex + middleBufferIndex) % bufferSize]
      const P2 = mousePositions[bufferIndex]

      calculateP1(point, P2, PT, P1)

      setUniform(cursorMeshRef.current, cursorFragmentShader, 'uMouse', point)
      setUniform(cursorMeshRef.current, cursorFragmentShader, 'uP1', P1)
      setUniform(cursorMeshRef.current, cursorFragmentShader, 'uP2', P2)
    }
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
  return (
    <mesh ref={cursorMeshRef} frustumCulled={false} matrixAutoUpdate={false} position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width + 0.01, viewport.height + 0.01]} />
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
function calculateP1(P0: Vector3, P2: Vector2, Pt: Vector2, P1: Vector2) {
  const x = Pt.x * 2 - P0.x * 0.5 - P2.x * 0.5,
    y = Pt.y * 2 - P0.y * 0.5 - P2.y * 0.5

  P1.set(x, y)
}
