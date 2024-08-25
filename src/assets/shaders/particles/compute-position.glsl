@nomangle uParticles resolution PARTICLES_CIRCLE_RADIUS

uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec2 uMouse;

@include "../includes/encode_decode.glsl"

float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    Particle particle;
    
    ivec2 uv = ivec2(gl_FragCoord.xy);
    vec4 base = texelFetch(uBase, uv, 0);
    vec4 current = texelFetch(uParticles, uv, 0);
    
    if (base == current) {
        float radius = {PARTICLES_CIRCLE_RADIUS};
        
        // Generate a random angle
        float angle = random(base.xy) * 2.0 * 3.14159265359;
        // Set the base position to be on the circumference of a circle with radius x
        vec2 basePos = vec2(cos(angle), sin(angle)) * radius;
        
        particle.pos = basePos;
        particle.delay = base.a - uDeltaTime;
        particle.is_touched = false;
        
        gl_FragColor = encode_particle(particle);
        return;
    } 
    
    particle = decode_particle(current);
    
    float mouseDist = distance(uMouse, particle.pos);
    
    vec2 direction = normalize(particle.pos - uMouse);
    
    float force = 0.7 / mouseDist / (1.0 - exp(-mouseDist)); // Central Force
    
    particle.pos += particle.delay <= 0.0 ? direction * (force *  0.1) : vec2(0.0);
    
    particle.pos += particle.delay <= 0.0 ? (base.xy - particle.pos) * 0.05 : vec2(0.0);
    
    particle.delay -= uDeltaTime;
    
    gl_FragColor = encode_particle(particle);
}
