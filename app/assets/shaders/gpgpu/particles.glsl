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
        vec2 pos_mapped_origin = vec2(0.0, -5.0);
        
        float pX_threshold = -9.6043;
        float eX_threshold = -5.1738;
        float dX_threshold = -0.9457;
        float roX_threshold = 3.3531;
        
        if (base.x > roX_threshold) {
            vec2 ro_origin = vec2(7.2677, 1.3225);
            pos_mapped_origin = ro_origin;
        } else if (
            base.x > dX_threshold) {
            vec2 d_origin = vec2(1.1581, 1.3225);
            pos_mapped_origin = d_origin;
        } else if (
            base.x > eX_threshold) {
            vec2 e_origin = vec2(-3.0901, 1.3225);
            pos_mapped_origin = e_origin;
        } else if (
            base.x > pX_threshold) {
            vec2 p_origin = vec2(-7.3688, 1.3225);
            pos_mapped_origin = p_origin;
        }
        
        particle.pos = pos_mapped_origin;
        particle.delay = current.a;
        particle.is_touched = uIsLMBDown;
        
        gl_FragColor = encode_particle(particle);
        return;
    }
    
    particle = decode_particle(current);
    particle.is_touched = uIsLMBDown;
    
    float mouseDist = distance(uMouse, particle.pos);
    
    vec2 direction = particle.is_touched ? normalize(uMouse - particle.pos) : normalize(particle.pos - uMouse);
    
    float force = 0.7 / mouseDist / (1.0 - exp(-mouseDist)); // Central Force
    
    particle.pos += direction * (force *  0.1);
    
    if (particle.delay <= 0.0) {
        particle.pos += (base.xy - particle.pos) * 0.05;
    } else {
        particle.delay -= mod(uDeltaTime, 1.0);
    }
    
    gl_FragColor = encode_particle(particle);
}
