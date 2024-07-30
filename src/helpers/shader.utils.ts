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
