@nomangle pc_fragColor

layout(location = 0) out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
precision highp float;
precision lowp int;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uZoomOffset;
uniform float uInitialXOffset;
uniform float uPortfolioScrollPercentage;

// Configuration

#define NOISE_STRENGTH 0.08
#define SPECULAR_STRENGTH 0.2
#define ANIMATION_SPEED 0.6
#define DEPTH 60.0
#define SEGMENT_QUALITY 1.2

// Shape Definition
float blob(vec3 q) {
    float f = DEPTH;
    f *= (cos(q.z * 1.1)) * (atan(q.x) + 0.2) * (cos(q.y * cos(q.z * 2.)) + 1.0) + cos(q.z * 5. + uTime * ANIMATION_SPEED) * cos(q.x) * sin(q.y) * ((.6 * (1.0)));
    return f;
}
// Gaussian Noise Effect
float gaussian(float z, float u, float o) {
    return (1.0 / (o * sqrt(4.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
}
// Output
void main(void) {
    // Initial color (left to right gradient)
    float mixFactor = gl_FragCoord.x / uResolution.x;
    vec3 leftSide = vec3(.063, .035, .192);
    vec3 rightSide = vec3(.03, .015, .1);
    vec3 gradientColor = mix(leftSide, rightSide, mixFactor);
    gl_FragColor = vec4(gradientColor, 1.0);
    vec2 p = -3. + 1.6 * (gl_FragCoord.xy / uResolution.xy) + (uZoomOffset * 0.2);
    vec3 o = vec3(p.x + 14. - (uZoomOffset * 3.0) - (uInitialXOffset * 3.0) - ((1.0 - uMouse.x) * 0.5) + ((uPortfolioScrollPercentage * 5.0) * uZoomOffset), p.y + 2.7 - (uZoomOffset * 0.3) - (uMouse.y * 0.15), -0.35 + (uZoomOffset * 0.4));
    vec3 d = vec3(p.x * 8. + ((1.0 - uMouse.x) * 0.5) - (uZoomOffset * 2.0), p.y + 0.5 + ((1.0 - uMouse.y) * 0.25) - (uZoomOffset * 0.5), 0.8 + (uZoomOffset * 2.0))/140.;
    vec4 c = vec4(0.);
    float t = 0.;
    for (int i = 0;i < 140; i++) {
        if (blob(o + d * t) < 20.) {
            vec3 e = vec3(.1, 0.0, 2.1 - (uZoomOffset * 0.8));
            vec3 n = vec3(0.0);
            n.x = blob(o + d * t) - blob(vec3(o + d * t + e.xyy)) - (uZoomOffset * 4.0);
            n.y = blob(o + d * t) - blob(vec3(o + d * t + e.yxy)) - (uZoomOffset * 7.0);
            n.z = blob(o + d * t) - blob(vec3(o + d * t + e.yyx)) + 1.0;
            n = normalize(n);
            c += max(dot(vec3(0.2 + (uZoomOffset * 0.5 + uInitialXOffset) + (uMouse.x * 0.1), 1.5, -1. - (uZoomOffset * 0.5)), n), 0.0) + min(dot(vec3(3.0  - (uZoomOffset * 2.0), 10.2 - (uZoomOffset * 3.0), -11. - (uZoomOffset * 3.0)), n), .1) * 0.1;
            break;
        }
        t += SEGMENT_QUALITY;
    }
    // Base Color
    gl_FragColor += vec4(.15, 0.05, .38, 0.) * (0.8 + (uZoomOffset * 0.1));
    
    // Specular
    
    gl_FragColor += c * (SPECULAR_STRENGTH + (uZoomOffset * 0.1)) * vec4(.40, 0.6, 0.89 - (uZoomOffset * 0.02), 1);
    
    // Brightness
    
    gl_FragColor *= (t * (.03 + (uZoomOffset * 0.04)));
    
    // Apply Noise
    
    vec2 ps = vec2(1.0) / uResolution.xy;
    vec2 uv = (gl_FragCoord.xy / uResolution.xy) * ps;
    float seed = dot(uv * vec2(1000.), vec2(12, 52));
    float noise = fract(sin(seed) * 43758.5453 + t);
    noise = gaussian(noise, float(0.0), float(0.5) * float(0.5));
    vec3 grain = vec3(noise) * (1.0 - gl_FragColor.rgb);
    gl_FragColor.rgb -= grain * NOISE_STRENGTH;
}
