import fs from 'fs'
import { promisify } from 'util'

const writeFileAsync = promisify(fs.writeFile)

export async function POST(request: Request) {
  try {
    const data = await request.arrayBuffer()

    const dataArray = new Int32Array(data)

    const packedArray = new Uint8Array(dataArray.length / 4) // 4 bytes per Uint32
    const mask = 0xff

    for (let i = 0; i < packedArray.length; i++) {
      const i4 = i * 4

      const value =
        (dataArray[i4 + 3] & (mask << 24)) |
        (dataArray[i4 + 2] & (mask << 16)) |
        (dataArray[i4 + 1] & (mask << 8)) |
        (dataArray[i4 + 0] & (mask << 0))

      packedArray[i] = value
    }

    const filePath = `pedro-delay-${Date.now()}.bin`
    await writeFileAsync(filePath, packedArray)

    return Response.json({ status: 200 })
  } catch (error) {
    console.error('Error writing file:', error)
    return Response.json({ status: 500, message: error.message })
  }
}

// // decoding
// packedArray[byteIndex++] = value & 0xff // Least significant byte
// packedArray[byteIndex++] = (value >> 8) & 0xff // Second byte
// packedArray[byteIndex++] = (value >> 16) & 0xff // Third byte
// packedArray[byteIndex++] = (value >> 24) & 0xff // Most significant byte
