uniform vec2 uResolution;
varying float vColor;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    
    gl_FragColor.rgb = vec3(0.114);
    
    float distanceToCenter = length(gl_PointCoord - 0.5);
    gl_FragColor.a = 1.0 - step(0.5, distanceToCenter);
}