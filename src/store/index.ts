import { atom } from 'jotai'

export const isCanvasCreatedAtom = atom(false)

export const particlesDataAtom = atom<{
  positions: Float32Array
  multipliers: Float32Array
}>()

export const isPointerDownAtom = atom(false)

export const isMobileDeviceAtom = atom(typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)
