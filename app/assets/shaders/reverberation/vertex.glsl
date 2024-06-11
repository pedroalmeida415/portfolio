precision highp float;
precision lowp int;

void main(void) {
    gl_Position.x = (gl_VertexID == 2) ?  3. : -1.;
    gl_Position.y = (gl_VertexID == 1) ? -3. : 1.;
    gl_Position.zw = vec2(1.);
}