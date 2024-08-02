import { type Viewport } from '@react-three/fiber'
import { type GlslVariableMap } from 'webpack-glsl-minify'

export function mapMangledUniforms(uniforms, map: GlslVariableMap) {
  return Object.entries(uniforms).reduce((acc, [key, value]) => {
    const mangledKey = map[key]?.variableName || key
    acc[mangledKey] = value
    return acc
  }, {})
}

export function setUniform(mesh, shader, uniformName, value) {
  if (shader.uniforms[uniformName]) {
    mesh.material.uniforms[shader.uniforms[uniformName].variableName].value = value
  } else {
    mesh.material.uniforms[uniformName].value = value
  }
}

export function getWorldSpaceCoords(element: Element, viewport: Viewport) {
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
