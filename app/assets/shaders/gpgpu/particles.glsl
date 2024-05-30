uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec2 uMouse;
uniform bool uIsLMBDown;

// @include "../includes/simplexNoise4d.glsl"

void main()
{
    float time = uTime * 0.2;
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    float mouseDist = distance(uMouse, particle.xy);
    float originDist = distance(base.xy, particle.xy);
    float mouseOriginDist = distance(base.xy, uMouse);

    if (mouseDist <= 1.0) {
        particle.z = 1.0;
    }
    if (uIsLMBDown){
        particle.z = 0.0;
    }

    bool isTouched = particle.z > 0.0;

    if (isTouched){
        if(mouseDist <= 1.0) {
            vec2 originDirection = normalize(uMouse - base.xy);

            particle.xy += originDirection * 0.1 * (1.0 - mouseDist);
        } else {
            vec2 mouseDirection = normalize(particle.xy - uMouse);

            particle.xy += mouseDirection * 0.1 * -mouseDist;
        }
    } else {
        float easeFactor = 1.0 - pow(0.9, uDeltaTime * 60.0);

        float delay = particle.a;

        if (delay <= 0.0){
            particle.xy = mix(particle.xy, base.xy, easeFactor);
        } else {
            particle.a -= mod(uDeltaTime, 1.0);
        }
    }

    if(originDist < 0.001){
        particle.a = base.a;
    }
    
    gl_FragColor = particle;
}
