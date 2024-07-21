declare module '*.glsl' {
  const MangledShader: import('webpack-glsl-minify').GlslShader
  export default MangledShader
}
