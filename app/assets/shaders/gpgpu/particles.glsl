uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uBase;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform bool uIsLMBDown;

// @include "../includes/simplexNoise4d.glsl"

// // Calculate angle between mouse and particle
// float angle = atan(particle.y - uMouse.y, particle.x - uMouse.x); 

// // Apply circular motion
// float radius = 0.2; // Adjust the radius for the size of the circular motion
// particle.xy += vec2(radius * cos(angle), radius * sin(angle));


// // Calculate the direction vector from the mouse to the particle
// vec2 direction = normalize(base.xy - uMouse);

// // Calculate the angle for circular movement
// float angle = atan(direction.y, direction.x);

// // Apply circular movement based on distance from the mouse
// float speed = mix(0.05, 0.15, smoothstep(0.0, 1.0, mouseDist)); // Adjust speed values
// particle.xy += vec2(cos(angle), sin(angle)) * speed * (1.0 - mouseDist);

void main()
{
    float time = uTime * 0.2;
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    float mouseDist = distance(uMouse, particle.xy);
    float baseDist = length(base.xyz - particle.xyz);
    
    // Ease back to starting position if mouse stopped
    if (uIsLMBDown && baseDist > 0.001) { 
        float easeFactor = 1.0 - pow(0.9, uDeltaTime * 60.0); // Adjust exponent for easing speed

        float delay = particle.a;

        if (delay <= 0.0){
            particle.xyz = mix(particle.xyz, base.xyz, easeFactor);
        } else {
            particle.a -= mod(uDeltaTime, 1.0);
        }
    } else {
        particle.a = base.a;
    }
    if (mouseDist < 1.0) {
        // Calculate the direction vector from the mouse to the particle
        vec2 direction = normalize(base.xy - uMouse);
        
        // Apply displacement based on the direction and mouse strength
        particle.xy += direction * 0.1 * (1.0 - mouseDist);
    } 
    // else {
    //     // return particle to original position
    //     float easeFactor = 1.0 - pow(0.9, uDeltaTime * 60.0);

    //     particle.xy = mix(particle.xy, base.xy, easeFactor);
    // }
    
    gl_FragColor = particle;
}
