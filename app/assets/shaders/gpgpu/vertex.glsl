uniform vec2 uResolution;
uniform float uSize;
uniform sampler2D uParticlesTexture;
uniform sampler2D uBaseParticlesTexture;

attribute vec2 aParticlesUv;

varying float vColor;

@include "../includes/encode_decode.glsl"

void main() {
    Particle particle = decode_particle(texture(uParticlesTexture, aParticlesUv));
    vec4 base = texture(uBaseParticlesTexture, aParticlesUv);
    
    // Final position
    vec4 modelPosition = modelMatrix * vec4(particle.pos, 0.0, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    
    gl_PointSize = uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);
    
    float origin_dist = distance(base.xy, particle.pos);
    vColor = smoothstep(0.6, 1.4, origin_dist);
}