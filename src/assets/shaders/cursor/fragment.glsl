
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec2 uViewport;

float smoothMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}
float smoothMin(float a, float b, float k) {
    return -smoothMax(-a, -b, k);
}

float smin(float a, float b, float k) {
    k *= 1.0/(1.0-sqrt(0.5));
    float h = max(k-abs(a-b), 0.0)/k;
    return min(a,b) - k*0.5*(1.0+h-sqrt(1.0-h*(h-2.0)));
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p-a, ba = b-a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
    return length(pa - ba*h);
}

void main() {
    vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
    uv *= uViewport / 2.0;
    
    float mouseCircleDist = sdCircle(uv - uMouse, 0.4);
    // vec3 col = vec3(1.0) - sign(mouseCircleDist)*vec3(0.1,0.4,0.7);
    // col *= 1.0 - exp(-3.0*abs(mouseCircleDist));
    // col *= 0.8 + 0.2*cos(120.0*mouseCircleDist);
    // col = mix(col, vec3(1.0), 1.0-smoothstep(0.0,0.015,abs(mouseCircleDist)));
    
    float navSegmentDist = sdSegment(uv, vec2(-2.05550575, -4.0435247), vec2(2.05550575, -4.0435247)) - 0.3100979;
    
    float combinedDistUnion = smin(mouseCircleDist, navSegmentDist, .25);
    
    const float headerYPos = 4.2584713;
    const float normalTextSegmentThickness = 0.1390831;
    
    float nameSegmentDist = sdSegment(uv, vec2(-9.3817859, headerYPos), vec2(-8.1761885, headerYPos)) - normalTextSegmentThickness;
    
    float twitterSegmentDist = sdSegment(uv, vec2(3.5858147, headerYPos), vec2(4.0398893, headerYPos)) - normalTextSegmentThickness;
    float linkedinSegmentDist = sdSegment(uv, vec2(4.6366828, headerYPos), vec2(5.1999693, headerYPos)) - normalTextSegmentThickness;
    float readcvSegmentDist = sdSegment(uv, vec2(5.7967621, headerYPos), vec2(6.3309676, headerYPos)) - normalTextSegmentThickness;
    
    float creditsSegmentDist = sdSegment(uv, vec2(8.7962146, headerYPos), vec2(9.3817859, headerYPos)) - normalTextSegmentThickness;
    
    float availableSegmentDist = sdSegment(uv, vec2(-7.6723284, -1.9795631), vec2(-5.4387805, -1.9795631)) - normalTextSegmentThickness;
    
    float combinedDistSubtract = min(availableSegmentDist, min(nameSegmentDist, min(creditsSegmentDist,min(readcvSegmentDist, min(twitterSegmentDist, linkedinSegmentDist)))));
    
    float combinedDist = smoothMax(combinedDistUnion, -combinedDistSubtract, 9.);
    // float combinedDist = max(combinedDistUnion, -combinedDistSubtract);
    
    vec3 col = combinedDist > 0.0 ? vec3(0.945,0.937,0.922) : vec3(0.918,0.345,0.047);
    
    gl_FragColor = vec4(col, 1.);
}