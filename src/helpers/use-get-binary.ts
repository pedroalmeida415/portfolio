import { suspend } from 'suspend-react'
import { decompress } from '@blu3r4y/lzma/src/lzma-d-min.mjs'

const files = [
  {
    path: '/pedro-positions.lzma',
    type: Float32Array,
  },
  {
    path: '/pedro-stagger-multipliers.lzma',
    type: Uint8Array,
  },
]

const getBinaries = async () => {
  try {
    const responses = await Promise.all(
      files.map(async (file) => {
        const response = await fetch(
          new Request(file.path, {
            method: 'GET',
          }),
        )

        const buffer = await response.arrayBuffer()

        // Decompress LZMA
        const decompressed = decompress(new Uint8Array(buffer))

        const dataArray = new file.type(new Int8Array(decompressed).buffer)

        return dataArray
      }),
    )

    return responses
  } catch (error) {
    console.log(error)
  }
}

export const useGetBinary = () => {
  const [positions, staggerMultipliers] = suspend(getBinaries, [])

  return [positions, staggerMultipliers]
}
