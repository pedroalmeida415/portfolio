import { suspend } from 'suspend-react'

const files = [
  {
    path: '/pedro-positions.bin',
    type: Float32Array,
  },
  {
    path: '/pedro-stagger-multipliers.bin',
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
        const dataArray = new file.type(buffer)
        return dataArray
      }),
    )

    return responses
  } catch (error) {
    console.log(error)
  }
}

export const useGetBinary = () => {
  const [positions, staggerMultipliers] = suspend<[], () => Promise<[Float32Array, Uint8Array]>>(getBinaries(), [])

  return [positions, staggerMultipliers] as const
}
