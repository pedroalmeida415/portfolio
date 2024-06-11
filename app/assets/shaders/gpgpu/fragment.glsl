uniform vec2 uResolution;
uniform sampler2D uBackgroundTexture;
varying float vColor;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec4 background = texture(uBackgroundTexture, uv);
    
    gl_FragColor.rgb = vec3(0.114);
    gl_FragColor.rgb += clamp(background.rgb, vec3(0.0), vec3(1.0)) * 0.25;
    
    float distanceToCenter = length(gl_PointCoord - 0.5);
    gl_FragColor.a = 1.0 - step(0.5, distanceToCenter);
}