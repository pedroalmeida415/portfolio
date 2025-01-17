import { CanvasTexture, LinearFilter, RedFormat, Vector2 } from 'three'

export const generateTextMask = (textElement: HTMLElement) => {
  const size = document.body.getBoundingClientRect()

  const canvas = document.createElement('canvas')
  canvas.style.position = 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.fontVariationSettings = "'wght' 200"
  canvas.style.display = 'none'
  document.body.appendChild(canvas)

  const font = getComputedStyle(document.body).getPropertyValue('--font-neue-montreal-variable')
  const fontSize = getComputedStyle(textElement).fontSize
  const text = textElement.innerText.replaceAll('\n', '')

  const blurColor = '#ff0000'
  const baseBlur = 1
  const blurRepeatCount = 8
  const blurIncrement = 2

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.font = `${fontSize} ${font}`
  ctx.textBaseline = 'middle'

  const textMeasurements = ctx.measureText(text)
  const textWidth = textMeasurements.width
  const textHeight = textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent

  canvas.width = textWidth + (baseBlur + blurRepeatCount * blurIncrement) * 3
  canvas.height = textHeight + (baseBlur + blurRepeatCount * blurIncrement) * 3

  const topHalfDist = textMeasurements.fontBoundingBoxAscent
  const lowerHalfDist = textMeasurements.fontBoundingBoxDescent
  const textYOffset = Math.abs(topHalfDist - lowerHalfDist) / 2

  const textX = canvas.width / 2 - textWidth / 2
  const textY = canvas.height / 2 + textYOffset

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.shadowColor = blurColor
  ctx.shadowBlur = baseBlur
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  ctx.font = `${fontSize} ${font}`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = blurColor
  ctx.fillText(text, textX, textY)

  for (let i = 0; i < blurRepeatCount; ++i) {
    ctx.shadowBlur += blurIncrement
    ctx.fillText(text, textX, textY)
  }

  const textTexture = new CanvasTexture(canvas)
  textTexture.format = RedFormat
  textTexture.minFilter = LinearFilter
  textTexture.generateMipmaps = false

  const normalizedWidth = textTexture.image.width / size.width
  const uvScalar = 1 / normalizedWidth

  const textureAspect = textTexture.image.width / textTexture.image.height
  const screenAspect = size.width / size.height

  const textTextureScalar = new Vector2(uvScalar, uvScalar * (textureAspect / screenAspect))

  canvas.remove()

  return {
    textTexture,
    textTextureScalar,
  }
}
