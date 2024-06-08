uniform vec2 uResolution;
uniform sampler2D uBackgroundTexture;
varying float vColor;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec4 background = texture(uBackgroundTexture, uv);
    
    gl_FragColor = vec4(0.114,0.114,0.114, 1.0);
    gl_FragColor.rgb += vec3(0.1) * background.rgb;
    
    float distanceToCenter = length(gl_PointCoord - 0.5);
    gl_FragColor.a = 1.0 - step(0.5, distanceToCenter);
}