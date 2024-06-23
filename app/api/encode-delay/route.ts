import fs from 'fs'
import { promisify } from 'util'

const writeFileAsync = promisify(fs.writeFile)

export async function POST(request: Request) {
  try {
    const data = await request.arrayBuffer()

    // Write the 8-bit array to the file
    const filePath = `pedro-delay-${Date.now()}.bin`
    await writeFileAsync(filePath, Buffer.from(data))

    return Response.json({ status: 200 })
  } catch (error) {
    console.error('Error writing file:', error)
    return Response.json({ status: 500, message: error.message })
  }
}
