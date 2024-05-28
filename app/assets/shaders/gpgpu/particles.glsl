uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec2 uMouse;
uniform float uMouseStrength;

@include "../includes/simplexNoise4d.glsl"

void main()
{
    float time = uTime * 0.2;
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    float mouseDist = distance(uMouse, particle.xy);
    
    // Apply mouse interaction
    if (mouseDist < 0.5) {
        // Apply displacement based on mouse strength
        particle.xy += uMouseStrength * 0.1 * (1.0 - mouseDist);
    } else {
        particle = base;
    }
    
    gl_FragColor = particle;
}