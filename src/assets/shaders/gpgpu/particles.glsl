@nomangle uParticles resolution

uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec2 uMouse;
uniform vec4 initialCoords;
uniform bool uIsLMBDown;

@include "../includes/encode_decode.glsl"

float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p-a, ba = b-a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
    return length(pa - ba*h);
}

void main() {
    Particle particle;
    
    ivec2 uv = ivec2(gl_FragCoord.xy);
    vec4 base = texelFetch(uBase, uv, 0);
    vec4 current = texelFetch(uParticles, uv, 0);
    
    if (base == current) {
        vec2 basePos = vec2(random(base.xy), random(base.yx)) * 2.0 - 1.0;
        basePos.x *= initialCoords.y + initialCoords.w;
        basePos.y *= initialCoords.w;
        basePos.y += initialCoords.z;
        
        float progressBarDist = sdSegment(basePos, vec2(initialCoords.x, initialCoords.z), vec2(initialCoords.y, initialCoords.z)) - initialCoords.w;
        
        if (progressBarDist > -0.01) {
            vec2 progressBarCenter = vec2(0.0, initialCoords.z);
            vec2 direction = normalize(progressBarCenter - basePos);
            float dist = distance(progressBarCenter, basePos);
            basePos += direction * dist * abs(progressBarDist);
        }
        
        particle.pos = basePos;
        particle.delay = base.a - fract(uDeltaTime);
        particle.is_touched = uIsLMBDown;
        
        gl_FragColor = encode_particle(particle);
        return;
    } 
    
    particle = decode_particle(current);
    particle.is_touched = uIsLMBDown;
    
    float mouseDist = distance(uMouse, particle.pos);
    
    vec2 direction = particle.is_touched ? normalize(uMouse - particle.pos) : normalize(particle.pos - uMouse);
    
    float force = 0.7 / mouseDist / (1.0 - exp(-mouseDist)); // Central Force
    
    particle.pos += particle.delay <= 0.0 ? direction * (force *  0.1) : vec2(0.0);
    
    particle.pos += particle.delay <= 0.0 ? (base.xy - particle.pos) * 0.05 : vec2(0.0);
    particle.delay -= fract(uDeltaTime);
    
    gl_FragColor = encode_particle(particle);
}
