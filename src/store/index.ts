import { atom } from 'jotai'

export const isHomeLoadedAtom = atom(false)

export const particlesDataAtom = atom<{
  positions: Float32Array
  multipliers: Uint8Array
}>()
