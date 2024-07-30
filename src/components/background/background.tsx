import { useMemo, useRef } from 'react'

import { extend, useFrame, useThree } from '@react-three/fiber'
import { BufferGeometry, Mesh, RawShaderMaterial, Vector2 } from 'three'

import { mapMangledUniforms, setUniform } from '~/helpers/shader.utils'

import { default as backgroundFragmentShader } from '~/assets/shaders/background/fragment.glsl'
import { default as backgroundVertexShader } from '~/assets/shaders/background/vertex.glsl'

extend({ RawShaderMaterial, BufferGeometry, Mesh })

export const Background = () => {
  const renderer = useThree((state) => state.gl)

  const resolution = useMemo(() => renderer.getDrawingBufferSize(new Vector2()), [renderer])

  const backgroundObjectRef = useRef<Mesh<BufferGeometry, RawShaderMaterial> | null>()

  const backgroundInitialUniforms = useMemo(
    () =>
      mapMangledUniforms(
        {
          uTime: { value: 0 },
          uResolution: { value: resolution },
          uMouse: { value: [0, 0] },
          uZoomOffset: { value: 0 },
          uInitialXOffset: { value: 0.0019 },
          uPortfolioScrollPercentage: { value: 0 },
        },
        backgroundFragmentShader.uniforms,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state, delta) =>
    setUniform(backgroundObjectRef.current, backgroundFragmentShader, 'uTime', state.clock.elapsedTime),
  )

  return (
    <mesh ref={backgroundObjectRef} position={[0, 0, 0]} frustumCulled={false} matrixAutoUpdate={false}>
      <bufferGeometry ref={(ref) => ref?.setDrawRange(0, 3)} />
      <rawShaderMaterial
        glslVersion='300 es'
        transparent
        depthTest={false}
        vertexShader={backgroundVertexShader.sourceCode}
        fragmentShader={backgroundFragmentShader.sourceCode}
        uniforms={backgroundInitialUniforms}
      />
    </mesh>
  )
}
