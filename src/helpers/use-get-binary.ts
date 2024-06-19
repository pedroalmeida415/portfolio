import { suspend } from 'suspend-react'

const getBinary = async () => {
  try {
    const response = await fetch(
      new Request('/data-1718784804218.dat', {
        method: 'GET',
      }),
    )
    const data = new DataView(await response.arrayBuffer())
    const tempArray = new Float32Array(data.byteLength / Float32Array.BYTES_PER_ELEMENT)
    const len = tempArray.length
    // Incoming data is raw floating point values
    // with little-endian byte ordering.
    for (let jj = 0; jj < len; ++jj) {
      tempArray[jj] = data.getFloat32(jj * Float32Array.BYTES_PER_ELEMENT, true)
    }
    return tempArray
  } catch (error) {
    console.log(error)
  }
}

export const useGetBinary = () => {
  const data = suspend(getBinary)

  return data
}
