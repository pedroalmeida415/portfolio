import { Viewport } from '@react-three/fiber'
import { DataTexture, FloatType, RGBAFormat } from 'three'

type InteractionType = 'segment' | 'center'

export const generateInteractionsTexture = (viewport: Viewport) => {
  const interactiveElements = document.querySelectorAll('[data-cursor-interactive]')
  const elementsCount = interactiveElements.length
  const data = new Float32Array(elementsCount * 4)

  interactiveElements.forEach((element, i) => {
    const type = element.getAttribute('data-cursor-interactive') as InteractionType

    const elementData = getWorldSpaceCoords(element, viewport)

    const i4 = i * 4

    if (type === 'segment') {
      data[i4 + 0] = elementData.pointX1
      data[i4 + 1] = elementData.pointX2
      data[i4 + 2] = elementData.centerY
      data[i4 + 3] = elementData.height
    }

    if (type === 'center') {
      data[i4 + 0] = elementData.centerX
      data[i4 + 1] = elementData.centerY
      data[i4 + 2] = 0
      data[i4 + 3] = 0
    }
  })

  const texture = new DataTexture(data, elementsCount, 1, RGBAFormat, FloatType)
  texture.needsUpdate = true
  return texture
}

function getWorldSpaceCoords(element: Element, viewport: Viewport) {
  const padding = element.getAttribute('data-padding')?.split(';').map(Number)

  const bodyBoundingRect = document.body.getBoundingClientRect()
  const bodyWidth = bodyBoundingRect.width
  const bodyHeight = bodyBoundingRect.height

  const box = element.getBoundingClientRect()

  const centerX = (box.left + box.right) / 2
  const centerY = (box.top + box.bottom) / 2

  const ndcX = (centerX / bodyWidth) * 2 - 1
  const ndcY = -(centerY / bodyHeight) * 2 + 1

  box.width -= box.height
  if (padding) {
    box.width += box.height * padding[0]
    box.height += box.height * padding[1]
  }

  const ndcWidth = box.width / bodyWidth
  const ndcHeight = box.height / bodyHeight

  const viewportWidth = viewport.width
  const viewportHeight = viewport.height

  const ndcX2 = (ndcX * viewportWidth) / 2
  const ndcY2 = (ndcY * viewportHeight) / 2

  const ndcWidth2 = (ndcWidth * viewportWidth) / 2
  const ndcHeight2 = (ndcHeight * viewportHeight) / 2

  const pointX1 = ndcX2 - ndcWidth2
  const pointX2 = ndcX2 + ndcWidth2

  return {
    pointX1: Number(pointX1.toFixed(7)),
    pointX2: Number(pointX2.toFixed(7)),
    centerY: Number(ndcY2.toFixed(7)),
    centerX: Number(ndcX2.toFixed(7)),
    width: Number(ndcWidth2.toFixed(7)),
    height: Number(ndcHeight2.toFixed(7)),
  }
}
