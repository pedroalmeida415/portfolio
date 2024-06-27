import { suspend } from 'suspend-react'

import { LZMA } from '@/helpers/lzma'

async function getBinaries() {
  const files = ['/pedro-positions.lzma', '/pedro-stagger-multipliers.lzma']

  const responses = await Promise.all(
    files.map((path) =>
      fetch(
        new Request(path, {
          method: 'GET',
        }),
      ),
    ),
  )

  const arrAggregated = []

  for (const response of responses) {
    if (!response.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data')
    }
    const buffer = await response.arrayBuffer()

    const outStream = await LZMA.decompressFile(buffer)
    const bytes: Uint8Array = outStream.toUint8Array()

    const typedArray = response.url.includes('positions') ? new Float32Array(bytes.buffer) : bytes

    arrAggregated.push(typedArray)
  }

  return arrAggregated
}

export const useGetBinary = () => {
  const [positions, staggerMultipliers] = suspend(getBinaries, [])

  return [positions, staggerMultipliers]
}
