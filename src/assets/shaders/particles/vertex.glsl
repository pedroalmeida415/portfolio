uniform float uSize;
uniform sampler2D uParticlesTexture;

attribute ivec2 aParticlesUv;

@include "../includes/encode_decode.glsl"

void main() {
    Particle particle = decode_particle(texelFetch(uParticlesTexture, aParticlesUv, 0));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(particle.pos, 0.0, 1.0);
    
    gl_PointSize = min(uSize, (uSize * abs(particle.delay)) + (uSize / 2.0));
}