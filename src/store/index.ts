import { atom } from 'jotai'
import { type Mesh, type PlaneGeometry, type ShaderMaterial } from 'three'

export const isHomeLoadedAtom = atom(false)

export const cursorMeshAtom = atom<Mesh<PlaneGeometry, ShaderMaterial>>()

export const particlesDataAtom = atom<{
  positions: Float32Array
  multipliers: Uint8Array
}>()
