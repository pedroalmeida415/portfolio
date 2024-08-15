import { atom } from 'jotai'

export const isCanvasCreatedAtom = atom(false)

export const particlesDataAtom = atom<{
  positions: Float32Array
  multipliers: Float32Array
}>()
