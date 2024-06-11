precision highp float;
precision lowp int;

void main(void) {
    float x = float((gl_VertexID & 1) << 2);
    float y = float((gl_VertexID & 2) << 1);
    
    gl_Position = vec4(x - 1., y - 1., 1., 1.);
}