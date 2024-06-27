import { suspend } from 'suspend-react'

import { LZMA } from '@/helpers/lzma'

const files = [
  {
    name: 'multipliers',
  },
  {
    name: 'positions',
    type: Float32Array,
  },
]

async function getBinaries() {
  const responses = await Promise.all(
    files.map((file) =>
      fetch(
        new Request(`/${file.name}.bin`, {
          method: 'GET',
        }),
      )
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          const decompressedStreamBuffer = LZMA.decompressFile(buffer)
          const rawBytes: Uint8Array = decompressedStreamBuffer.toUint8Array()

          return {
            fileName: file.name,
            data: file.type ? new file.type(rawBytes.buffer) : rawBytes,
          }
        }),
    ),
  )

  return responses.reduce(
    (acc, response) => {
      acc[response.fileName] = response.data
      return acc
    },
    {} as Record<string, any>,
  )
}

export const useGetBinary = () => {
  const { positions, multipliers } = suspend(getBinaries, [])

  return [positions, multipliers]
}
