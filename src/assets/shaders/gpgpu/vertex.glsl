uniform float uSize;
uniform sampler2D uParticlesTexture;

attribute vec2 aParticlesUv;

@include "../includes/encode_decode.glsl"

void main() {
    Particle particle = decode_particle(texture(uParticlesTexture, aParticlesUv));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(particle.pos, 0.0, 1.0);
    
    gl_PointSize = min(uSize, (uSize * abs(particle.delay)) + (uSize / 3.0));
}