uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec2 uMouse;
uniform bool uIsLMBDown;

@include "../includes/encode_decode.glsl"

void main()
{
    Particle particle;
    
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 base = texture(uBase, uv);
    vec4 current = texture(uParticles, uv);

    if (base == current) {
        particle.pos = vec2(0.0, -3.0);
        particle.delay = current.a;
        particle.is_touched = false;

        gl_FragColor = encode_particle(particle);
        return;
    }

    particle = decode_particle(current); 
    
    float mouseDist = distance(uMouse, particle.pos);
    float originDist = distance(base.xy, particle.pos);
    float mouseOriginDist = distance(base.xy, uMouse);

    if (mouseDist <= 1.0) {
        particle.is_touched = true;
    }

    if (uIsLMBDown){
        particle.is_touched = false;
    }

    if (particle.is_touched){
        if(mouseDist <= 1.0) {
            vec2 originDirection = normalize(uMouse - base.xy);

            particle.pos += originDirection * 0.1 * (1.0 - mouseDist);
        } else {
            vec2 mouseDirection = normalize(particle.pos - uMouse);

            particle.pos += mouseDirection * 0.1 * -mouseDist;
        }
    } else {
        float easeFactor = 1.0 - pow(0.9, uDeltaTime * 60.0);

        if (particle.delay <= 0.0){
            particle.pos = mix(particle.pos, base.xy, easeFactor);
        } else {
            particle.delay -= mod(uDeltaTime, 1.0);
        }
    }

    if (originDist < 0.001) {
        particle.delay = base.a;
    }
    
    gl_FragColor = encode_particle(particle);
}
