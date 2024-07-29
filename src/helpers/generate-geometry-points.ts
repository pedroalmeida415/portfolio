import { Box2 } from 'three'

export const generateGeometryPoints = (textSvg, viewport, gradientTextureBitmap) => {
  // Create a canvas element
  const canvas = document.createElement('canvas')
  canvas.width = gradientTextureBitmap.width
  canvas.height = gradientTextureBitmap.height

  // Get the 2D drawing context
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
  })

  // Draw the ImageBitmap onto the canvas
  ctx.drawImage(gradientTextureBitmap, 0, 0)

  const svgWidth = Number((textSvg.xml as any).attributes.width.value)
  const svgHeight = Number((textSvg.xml as any).attributes.height.value)
  const svgHeightInViewport = (svgHeight * viewport.width) / svgWidth

  const positions = []
  const delays = []

  let inner_o_shape_points

  textSvg.paths.forEach((path, index) => {
    const shape = path.toShapes(false)[0]

    // Outline
    const points = shape.getSpacedPoints(1500)
    points.forEach((point) => {
      const ndcX = (point.x / svgWidth) * 2 - 1
      const ndcY = (-point.y / svgHeight) * 2 + 1

      const gradientImageData = ctx.getImageData(point.x, point.y, 1, 1).data

      // Adjust the NDC to viewport coordinates considering the aspect ratio
      const positionX = (ndcX * viewport.width) / 2
      const positionY = (ndcY * svgHeightInViewport) / 2

      positions.push(positionX, positionY)
      delays.push(gradientImageData[1]) // green content of pixel
    })

    if (index === 0) {
      inner_o_shape_points = shape.getPoints(60)
      return
    }

    const boundingBox = new Box2().setFromPoints(shape.getPoints())

    // Fill shape without adding doubles on outline
    for (let y = boundingBox.min.y; y < boundingBox.max.y; ++y) {
      for (let x = boundingBox.min.x; x < boundingBox.max.x; ++x) {
        const shapePoints = shape.getPoints(60)

        const isOriginalInside = isPointInPolygon({ x, y }, shapePoints)
        if (!isOriginalInside) continue

        if (index === 1) {
          const isInsideInner = isPointInPolygon({ x, y }, inner_o_shape_points)
          if (isInsideInner) continue
        }

        let isInsideAndNotOverlapWithPath
        if (index === 1) {
          isInsideAndNotOverlapWithPath =
            isPointInPolygon({ x: x - 0.5, y: y - 0.5 }, shapePoints) &&
            isPointInPolygon({ x: x - 0.5, y: y + 0.5 }, shapePoints) &&
            isPointInPolygon({ x: x + 0.5, y: y - 0.5 }, shapePoints) &&
            isPointInPolygon({ x: x + 0.5, y: y + 0.5 }, shapePoints) &&
            !isPointInPolygon({ x: x - 0.5, y: y - 0.5 }, inner_o_shape_points) &&
            !isPointInPolygon({ x: x - 0.5, y: y + 0.5 }, inner_o_shape_points) &&
            !isPointInPolygon({ x: x + 0.5, y: y - 0.5 }, inner_o_shape_points) &&
            !isPointInPolygon({ x: x + 0.5, y: y + 0.5 }, inner_o_shape_points)
        } else {
          isInsideAndNotOverlapWithPath =
            isPointInPolygon({ x: x - 0.5, y: y - 0.5 }, shapePoints) &&
            isPointInPolygon({ x: x - 0.5, y: y + 0.5 }, shapePoints) &&
            isPointInPolygon({ x: x + 0.5, y: y - 0.5 }, shapePoints) &&
            isPointInPolygon({ x: x + 0.5, y: y + 0.5 }, shapePoints)
        }

        if (isInsideAndNotOverlapWithPath) {
          // Calculate the normalized device coordinates (NDC)
          const ndcX = ((x + 0.5) / svgWidth) * 2 - 1
          const ndcY = (-(y + 0.5) / svgHeight) * 2 + 1

          const gradientImageData = ctx.getImageData(x, y, 1, 1).data

          // Adjust the NDC to viewport coordinates considering the aspect ratio

          const positionX = (ndcX * viewport.width) / 2
          const positionY = (ndcY * svgHeightInViewport) / 2

          positions.push(positionX, positionY)
          delays.push(gradientImageData[1]) // green content of pixel
        }
      }
    }
  })

  canvas.remove()

  return [positions, delays]
}

// Helper function to check if a point is inside a polygon
function isPointInPolygon(point, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y
    const xj = polygon[j].x,
      yj = polygon[j].y
    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}
