uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec2 uMouse;
uniform bool uIsLMBDown;

@include "../includes/encode_decode.glsl"

float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float sdRoundedBox(in vec2 p, in vec2 b, in vec4 r) {
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

void main() {
    Particle particle;
    
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 base = texture(uBase, uv);
    vec4 current = texture(uParticles, uv);
    
    if (base == current) {
        vec2 basePos = vec2(random(base.xy), random(base.yx)) * 2.0;
        basePos.y -= 1.0;
        basePos.x -= 1.0;
        
        basePos.x *= 2.2625;
        basePos.y *= .185;
        
        // Check if the particle is inside the rounded box
        vec2 boxSize = vec2(1.); // Adjust these values as needed
        boxSize.x *= 2.2625;
        boxSize.y *= .185;
        vec4 boxRadius = vec4(0.2); // Adjust these values as needed
        float d = sdRoundedBox(basePos, boxSize, boxRadius);
        
        // If the particle is outside the box, project it back to the border
        if (d >= 0.0) {
            vec2 gradient = normalize(basePos); // Approximate gradient for projection
            basePos -= gradient * (d + 0.1);
        }
        
        basePos.y -= 4.045;
        
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
