import fs from 'fs'
import { promisify } from 'util'

const writeFileAsync = promisify(fs.writeFile)

export async function POST(request) {
  try {
    const data = await request.arrayBuffer()

    // Create a Float32Array from the arrayBuffer
    const tempArray = new Float32Array(data)

    // Create a buffer to hold the binary data
    const len = tempArray.length
    const buffer = Buffer.alloc(len * 4) // 4 bytes per float

    // Write the float data to the buffer in Little-Endian format
    for (let i = 0; i < len; i++) {
      buffer.writeFloatLE(tempArray[i], i * 4)
    }

    // Write the buffer to a file asynchronously
    const filePath = `data-${Date.now()}.dat`
    await writeFileAsync(filePath, buffer)

    // Return a successful response
    return Response.json({ status: 200 })
  } catch (error) {
    console.error('Error writing file:', error)
    return Response.json({ status: 500, message: error.message })
  }
}
