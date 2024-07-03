uniform float uSize;
uniform sampler2D uParticlesTexture;

attribute vec2 aParticlesUv;

@include "../includes/encode_decode.glsl"

void main() {
    Particle particle = decode_particle(texture(uParticlesTexture, aParticlesUv));
    
    // Final position
    vec4 modelPosition = modelMatrix * vec4(particle.pos, 0.0, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    
    gl_PointSize = min(uSize, (uSize * abs(particle.delay)) + (uSize / 3.0));
}