import fs from 'fs'
import { promisify } from 'util'
import { URL } from 'url'

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
