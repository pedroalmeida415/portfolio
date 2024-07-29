import { atom } from 'jotai'
import { type BufferGeometry, type Points, type Mesh, type PlaneGeometry, type ShaderMaterial } from 'three'

export const cursorMeshAtom = atom<Mesh<PlaneGeometry, ShaderMaterial>>()

export const particlesMeshAtom = atom<Points<BufferGeometry, ShaderMaterial>>()
