import fs from 'fs'
import { URL } from 'url'
import { promisify } from 'util'

const writeFileAsync = promisify(fs.writeFile)

export async function POST(request: Request) {
  try {
    const data = await request.arrayBuffer()

    const outputName = new URL(request.url).searchParams.get('output')
    const filePath = `encoded-${outputName}-${new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-')}.bin`
    await writeFileAsync(filePath, Buffer.from(data))

    return Response.json({ status: 200 })
  } catch (error) {
    console.error('Error writing file:', error)
    return Response.json({ status: 500, message: error.message })
  }
}
