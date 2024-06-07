uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec2 uMouse;
uniform bool uIsLMBDown;

@include "../includes/encode_decode.glsl"

void main() {
    Particle particle;
    
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 base = texture(uBase, uv);
    vec4 current = texture(uParticles, uv);
    
    if (base == current) {
        particle.pos = vec2(0.0, -5.0);
        particle.delay = current.a;
        particle.is_touched = false;
        
        gl_FragColor = encode_particle(particle);
        return;
    }
    
    particle = decode_particle(current);
    
    float mouseDist = distance(uMouse, particle.pos);
    
    vec2 direction = normalize(particle.pos - uMouse);
    
    float force = 0.7 / mouseDist / (1.0 - exp(-mouseDist)); // Central Force
    
    particle.pos += force * direction * 0.1;
    
    if (particle.delay <= 0.0) {
        particle.pos += (base.xy - particle.pos) * 0.05;
    } else {
        particle.delay -= mod(uDeltaTime, 1.0);
    }
    
    gl_FragColor = encode_particle(particle);
}
