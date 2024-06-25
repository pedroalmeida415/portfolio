'use client'

import { Canvas, CanvasProps } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { r3f } from '@/helpers/global'

type CanvasPropsWithoutChildren = Omit<CanvasProps, 'children'>

export default function Scene({ ...props }: CanvasPropsWithoutChildren) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props}>
      {/* @ts-ignore */}
      <r3f.Out />
      <Preload all />
    </Canvas>
  )
}
