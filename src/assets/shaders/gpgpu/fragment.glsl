void main() {
    gl_FragColor = vec4(0.114, 0.114, 0.114, 1.0);
    
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    float delta = fwidth(r);     
    float mask = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
    gl_FragColor = vec4(gl_FragColor.rgb, mask * gl_FragColor.a);
}