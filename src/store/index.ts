import { atom } from 'jotai'
import { loadable } from 'jotai/utils'
import { type Mesh, type PlaneGeometry, type ShaderMaterial } from 'three'

import { LZMA } from '~/helpers/lzma'

export const cursorMeshAtom = atom<Mesh<PlaneGeometry, ShaderMaterial>>()

export const getParticlesDataAtom = loadable(
  atom(async () => {
    const positionsPromise = getParticlesData('positions')
    const multipliersPromise = getParticlesData('multipliers')
    const [positions, multipliers] = await Promise.all([positionsPromise, multipliersPromise])

    return { positions: new Float32Array(positions.buffer), multipliers }
  }),
)

async function getParticlesData(type: 'positions' | 'multipliers') {
  const res = await fetch(`/${type}.bin`)
  const buffer = await res.arrayBuffer()
  const decompressedStreamBuffer = LZMA.decompressFile(buffer)
  const rawBytes: Uint8Array = decompressedStreamBuffer.toUint8Array()

  return rawBytes
}
