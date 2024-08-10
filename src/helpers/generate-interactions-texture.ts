import { Viewport } from '@react-three/fiber'
import { DataTexture, FloatType, RGBAFormat } from 'three'

import { getWorldSpaceCoords } from './shader.utils'

type InteractionType = 'segment' | 'center' | 'circle'

export const generateInteractionsTexture = (viewport: Viewport, textureToUpdate?: DataTexture) => {
  const interactiveElements = document.querySelectorAll('[data-cursor-interactive]')
  const elementsCount = interactiveElements.length
  const data = textureToUpdate ? textureToUpdate.image.data : new Float32Array(elementsCount * 4)

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

    if (type === 'circle') {
      data[i4 + 0] = elementData.centerX
      data[i4 + 1] = elementData.centerY
      data[i4 + 2] = elementData.width
      data[i4 + 3] = 0
    }
  })

  if (textureToUpdate) {
    textureToUpdate.needsUpdate = true
    return textureToUpdate
  }

  const texture = new DataTexture(data, elementsCount, 1, RGBAFormat, FloatType)
  texture.needsUpdate = true
  return texture
}
