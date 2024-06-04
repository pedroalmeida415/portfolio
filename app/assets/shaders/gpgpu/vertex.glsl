uniform vec2 uResolution;
uniform float uSize;
uniform sampler2D uParticlesTexture;

attribute vec2 aParticlesUv;

varying vec4 vColor;

@include "../includes/encode_decode.glsl"

void main()
{
    Particle particle = decode_particle(texture(uParticlesTexture, aParticlesUv));

    // Final position
    vec4 modelPosition = modelMatrix * vec4(particle.pos, 0.0, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    float sizeIn = smoothstep(0.0, 0.1, particle.delay);
    float sizeOut = 1.0 - smoothstep(0.7, 1.0, particle.delay);
    float size = min(sizeIn, sizeOut);

    gl_PointSize = uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = vec4(0.128, 0.128, 0.128, 1.0);
}