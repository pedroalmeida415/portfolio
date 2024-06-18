varying float vColor;
void main() {
    gl_FragColor = vec4(0.114, 0.114, 0.114, 1.0);
    
    float distanceToCenter = length(gl_PointCoord - 0.5);
    if (distanceToCenter > 0.5) discard;
}