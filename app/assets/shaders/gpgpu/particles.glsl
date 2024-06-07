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
        particle.pos = vec2(0.0, -3.0);
        particle.delay = current.a;
        particle.is_touched = false;
        
        gl_FragColor = encode_particle(particle);
        return;
    }
    
    particle = decode_particle(current);
    
    float mouseDist = distance(uMouse, particle.pos);
    
    vec2 direction = normalize(particle.pos - uMouse);
    
    // float force = 1.0 / mouseDist; // Linear decay
    
    // float force = 0.8 / pow(mouseDist, 1.4); // Inverse Square Law
    
    // float alpha = .5; // Decay rate
    // float force = 1.0 * exp(-alpha * mouseDist); // Exponential decay force
    
    // float force = 1.0 / log(mouseDist + 1.0); // Logarithmic Force
    
    // float mu = 2.0; // Midpoint distance
    // float alpha = -10.0; // Steepness
    // float force = 1.0 / (1.0 + exp(-alpha * (mouseDist - mu))); // Sigmoid Force
    
    // float frequency = 10.0;
    // float phase = uTime;
    // float force = .2 * sin(mouseDist * frequency + phase); // Radial force
    
    // float threshold = 2.0;
    // float force = (mouseDist < threshold) ? -1.0 / mouseDist : 1.0 / mouseDist; // Attraction/Repulsion Force with Threshold
    
    // float restLength = 2.0; // Rest length of the spring
    // float force = -1.0 * (mouseDist - restLength); // Spring Force
    
    float force = 0.8 / mouseDist / (1.0 - exp(-mouseDist)); // Central Force
    
    // float attractionRadius = 1.0;
    // float repulsionRadius = 2.0;
    // float force = 1.0 * (exp(-mouseDist / attractionRadius) - exp(-mouseDist / repulsionRadius)); // Exponential Attraction/Repulsion
    
    // vec2 perpendicular = vec2(-direction.y, direction.x); // Perpendicular to the direction
    // float force = 1.0 / mouseDist;
    // vec2 displacement = perpendicular * force;
    // particle.pos += displacement * 0.1; // Circular Attraction/Repulsion
    
    particle.pos += force * direction * 0.1;
    
    particle.pos += (base.xy - particle.pos) * 0.05;
    
    gl_FragColor = encode_particle(particle);
}
