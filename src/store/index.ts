import { atom } from 'jotai'

export const homeAnimationsControlAtom = atom<() => void>()

export const particlesDataAtom = atom<{
  positions: Float32Array
  multipliers: Uint8Array
}>()
