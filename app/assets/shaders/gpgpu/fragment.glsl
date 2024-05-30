varying vec4 vColor;

void main()
{
    float distanceToCenter = length(gl_PointCoord - 0.5);
    
    gl_FragColor = vec4(0.114,0.114,0.114, 1.0);
    // gl_FragColor = vec4(0.239,0.341,0.855, 1.0);

    gl_FragColor *= vec4(vColor.ba, 1.0, 1.0);

    gl_FragColor.a = 1.0 - step(0.5, distanceToCenter);
}