uniform vec2 uMouse;
uniform vec2 uP1;
uniform vec2 uP2;
uniform vec2 uResolution;
uniform vec2 uViewport;

#define SQRT3 1.732050808

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

float circularIn(float t) {
    return 1.0 - sqrt(1.0 - t * t);
}

float dot2(vec2 v) {
    return dot(v,v);
}
float cos_acos_3(float x) {
    x=sqrt(0.5+0.5*x); return x*(x*(x*(x*-0.008972+0.039071)-0.107074)+0.576975)+0.5;
} // https://www.shadertoy.com/view/WltSD7

float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C, float radiusStart) {
    vec2 a = B - A;
    vec2 b = A - 2.0*B + C;
    vec2 c = a * 2.0;
    vec2 d = A - pos;
    
    float kk = 1.0/dot(b,b);
    float kx = kk * dot(a,b);
    float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
    float kz = kk * dot(d,a);      
    
    float res = 0.0;
    float segmentT = 0.0;
    
    float p = ky - kx*kx;
    float p3 = p*p*p;
    float q = kx*(2.0*kx*kx-3.0*ky) + kz;
    float h = q*q + 4.0*p3;
    
    if(h >= 0.0) {
        h = sqrt(h);
        vec2 x = (vec2(h,-h)-q)/2.0;
        
        vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
        float t = uv.x + uv.y;
        
        // from NinjaKoala - single newton iteration to account for cancellation
        t -= (t*(t*t+3.0*p)+q)/(3.0*t*t+3.0*p);
        
        t = clamp(t-kx, 0.0,1.0);
        vec2  w = d+(c+b*t)*t;
        res = dot2(w);
        segmentT = t;
    }
    else {
        float z = sqrt(-p);
        float m = cos_acos_3(q/(p*z*2.0));
        float n = sqrt(1.0-m*m) * SQRT3;
        
        vec2  t = clamp(vec2(m+m,-n-m)*z-kx, 0.0,1.0);
        
        vec2  qx=d+(c+b*t.x)*t.x;
        float dx=dot2(qx);
        vec2  qy=d+(c+b*t.y)*t.y;
        float dy=dot2(qy);
        
        if(dx<dy) {
            res=dx;
            segmentT = t.x;
        } else {
            res=dy;
            segmentT = t.y;
        }
    }
    
    float radius = mix(radiusStart, 0.0, circularIn(segmentT));
    
    return sqrt(res) - radius;
}

void main() {
    vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
    uv *= uViewport / 2.0;
    
    float navSegmentDist = sdSegment(uv, vec2(-2.05550575, -4.0455247), vec2(2.05550575, -4.0455247)) - 0.3000979;
    
    float mouseCircleDist = sdCircle(uv - uMouse, 0.3);
    
    float curveDist = sdBezier(uv, uMouse, uP1, uP2, 0.3);
    
    float combinedDistUnion = smin(min(curveDist,mouseCircleDist), navSegmentDist, .25);
    
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
    
    vec3 col = mix(vec3(0.918,0.345,0.047),vec3(0.945,0.937,0.922), smoothstep(0.0,0.015,combinedDist));
    
    gl_FragColor = vec4(col, 1.);
}