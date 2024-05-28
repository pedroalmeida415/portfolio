varying vec3 vColor;

void main()
{
    float distanceToCenter = length(gl_PointCoord - 0.5);
    // if(distanceToCenter > 0.5)
    //     discard;
    
    
    gl_FragColor = vec4(0.114,0.114,0.114, 1.0);
    // gl_FragColor = vec4(0.239,0.341,0.855, 1.0);
    // gl_FragColor = vec4(vColor, 1.0);

    gl_FragColor.a = 1.0 - step(0.5, distanceToCenter);
}