import { suspend } from 'suspend-react'

const getBinary = async (filePath: string) => {
  try {
    const request = await fetch(
      new Request(filePath, {
        method: 'GET',
      }),
    )

    const buffer = await request.arrayBuffer()
    const dataArray = new Float32Array(buffer)

    return dataArray
  } catch (error) {
    console.log(error)
  }
}

export const useGetBinary = () => {
  const positions = suspend<[], () => Promise<Float32Array>>(getBinary.bind(null, '/pedro-positions-legacy.bin'), [])

  return positions
}
