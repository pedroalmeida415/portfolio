uniform vec2 uMouse;
uniform vec2 uP1;
uniform vec2 uP2;
uniform vec2 uUvScalar;
uniform sampler2D uTextTexture;
uniform vec2 uTextTextureSize;

varying vec2 vUv;

float smoothMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}
float smoothMin(float a, float b, float k) {
    return -smoothMax(-a, -b, k);
}

// cubic polynomial
vec2 sminBlend(float a, float b, float k) {
    float h = 1.0 - min(abs(a-b)/(6.0*k), 1.0);
    float w = h*h*h;
    float m = w*0.5;
    float s = w*k; 
    return (a<b) ? vec2(a-s,m) : vec2(b-s,1.0-m);
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p-a, ba = b-a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
    return length(pa - ba*h);
}

float circularOut(float t) {
    return sqrt((2.0 - t) * t);
}

float cro(in vec2 a, in vec2 b) {
    return a.x*b.y - a.y*b.x;
}

float sdUnevenCapsule(in vec2 p, in vec2 pa, in vec2 pb, in float ra, in float rb) {
    p  -= pa;
    pb -= pa;
    float h = dot(pb,pb);
    vec2  q = vec2(dot(p,vec2(pb.y,-pb.x)), dot(p,pb))/h;
    
    q.x = abs(q.x);
    
    float b = ra-rb;
    vec2  c = vec2(sqrt(h-b*b),b);
    
    float k = cro(c,q);
    float m = dot(c,q);
    float n = dot(q,q);
    
    if(k < 0.0) {
        return sqrt(h*(n)) - ra;
    }
    else if(k > c.x) {
        return sqrt(h*(n+1.0-2.0*q.y)) - rb;
    }
    return m - ra;
}

float sdTaperedQuadraticBezier(vec2 p, vec2 a, vec2 b, vec2 c, int samples) {
    float dist = 1e30;
    
    for (int i = samples; i > 0; --i) {
        float t0 = float(i) / float(samples);
        float t1 = float(i + 1) / float(samples);
        float u0 = 1.0 - t0;
        float u1 = 1.0 - t1;
        vec2 p0 = u0 * u0 * a + 2.0 * u0 * t0 * b + t0 * t0 * c;
        vec2 p1 = u1 * u1 * a + 2.0 * u1 * t1 * b + t1 * t1 * c;
        
        float radiusA = mix(0.0, 0.3, circularOut(t0));
        float radiusB = mix(0.0, 0.3, circularOut(t1));
        
        dist = min(dist, sdUnevenCapsule(p, p0, p1, radiusA, radiusB));
    }
    
    return dist;
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv *= uUvScalar;
    
    float navSegmentDist = sdSegment(uv, vec2(-2.05550575, -4.0455247), vec2(2.05550575, -4.0455247)) - 0.3160979;
    float mouseCircleDist = sdCircle(uv - uMouse, 0.3);
    float curveDist = sdTaperedQuadraticBezier(uv, uP2, uP1, uMouse, 12);
    
    vec2 combinedDistUnion = sminBlend(min(curveDist,mouseCircleDist), navSegmentDist, .25);
    
    const float headerYPos = 4.2584713;
    const float normalTextSegmentThickness = 0.1390831;
    
    float nameSegmentDist = sdSegment(uv, vec2(-9.3817859, headerYPos), vec2(-8.1761885, headerYPos)) - normalTextSegmentThickness;
    float twitterSegmentDist = sdSegment(uv, vec2(3.5858147, headerYPos), vec2(4.0398893, headerYPos)) - normalTextSegmentThickness;
    float linkedinSegmentDist = sdSegment(uv, vec2(4.6366828, headerYPos), vec2(5.1999693, headerYPos)) - normalTextSegmentThickness;
    float readcvSegmentDist = sdSegment(uv, vec2(5.7967621, headerYPos), vec2(6.3309676, headerYPos)) - normalTextSegmentThickness;
    float creditsSegmentDist = sdSegment(uv, vec2(8.7962146, headerYPos), vec2(9.3817859, headerYPos)) - normalTextSegmentThickness;
    float availableSegmentDist = sdSegment(uv, vec2(-7.6723284, -1.9795631), vec2(-5.4387805, -1.9795631)) - normalTextSegmentThickness;
    
    float combinedDistSubtract = min(availableSegmentDist, min(nameSegmentDist, min(creditsSegmentDist,min(readcvSegmentDist, min(twitterSegmentDist, linkedinSegmentDist)))));
    float combinedDist = smoothMax(combinedDistUnion.x, -combinedDistSubtract, 9.);
    
    float textAspect = uTextTextureSize.x / uTextTextureSize.y;
    float resolutionAspect = uUvScalar.x / uUvScalar.y;
    float textMask = texture2D(uTextTexture, vec2(vUv.x, vUv.y * textAspect / resolutionAspect)).r;
    
    vec3 cursorColor = vec3(0.918, 0.345, 0.047);
    vec3 navColor = vec3(0.851,0.851,0.851);
    vec3 backgroundColor = vec3(0.945, 0.937, 0.922);
    
    vec3 col = mix(cursorColor, navColor, combinedDistUnion.y);
    col = mix(col, backgroundColor, smoothstep(0.0, 0.015, combinedDist + textMask));
    col = mix(col, vec3(1.0 - backgroundColor.r), textMask);
    
    gl_FragColor = vec4(col, 1.);
}