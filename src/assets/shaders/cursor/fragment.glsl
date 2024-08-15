uniform vec2 uMouse;
uniform vec2 uP1;
uniform vec2 uP2;
uniform vec2 uUvScalar;
uniform vec2 uResolution;
uniform vec2 uTextTextureScalar;
uniform sampler2D uTextTexture;
uniform sampler2D uInteractionsTexture;

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

float sdBox(in vec2 p, in vec2 b) {
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
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

float sdTaperedQuadraticBezier(vec2 p, vec2 a, vec2 b, vec2 c, int samples, float startRadius) {
    float dist = 1e30;
    
    for (int i = 0; i < samples; ++i) {
        float t0 = max(0.05, float(i) / float(samples));
        float t1 = float(i + 1) / float(samples);
        float u0 = 1.0 - t0;
        float u1 = 1.0 - t1;
        vec2 p0 = u0 * u0 * a + 2.0 * u0 * t0 * b + t0 * t0 * c;
        vec2 p1 = u1 * u1 * a + 2.0 * u1 * t1 * b + t1 * t1 * c;
        
        float radiusA = startRadius * circularOut(t0);
        float radiusB = startRadius * circularOut(t1);
        
        dist = min(dist, sdUnevenCapsule(p, p0, p1, radiusA, radiusB));
    }
    
    return dist;
}

// Build tool that generates these distances and patches/injects the shader with them to avoid manually adjusting it every time there's a change
void main() {
    vec2 uv = gl_FragCoord.xy / uResolution * 2.0 - 1.0;
    uv *= uUvScalar;
    
    // Construct union distances
    float mouseCircleDist = sdCircle(uv - uMouse, 0.3);
    float curveDist = sdTaperedQuadraticBezier(uv, uP2, uP1, uMouse, 10, 0.3);
    
    float screenBoxDist = sdBox(uv, uUvScalar + 1.0);
    float screenBoxClipDist = sdBox(uv, uUvScalar + 0.01);
    float screenBorderDist = max(screenBoxDist, -screenBoxClipDist);
    
    vec2 combinedDistUnion = sminBlend(min(curveDist,mouseCircleDist), screenBorderDist, .2);
    
    // Fetch subtraction elements data
    vec4 nameSegmentData = texelFetch(uInteractionsTexture, ivec2(0,0),0);
    vec4 creditsSegmentData = texelFetch(uInteractionsTexture, ivec2(1,0),0);
    
    vec4 availableSegmentData = texelFetch(uInteractionsTexture, ivec2(3,0),0);
    
    vec4 twitterSegmentData = texelFetch(uInteractionsTexture, ivec2(4,0),0);
    vec4 linkedinSegmentData = texelFetch(uInteractionsTexture, ivec2(5,0),0);
    vec4 readcvSegmentData = texelFetch(uInteractionsTexture, ivec2(6,0),0);
    
    vec4 emailSegmentData = texelFetch(uInteractionsTexture, ivec2(7,0),0);
    
    // Construct subtraction distances
    float nameSegmentDist = sdSegment(uv, vec2(nameSegmentData.r, nameSegmentData.b), vec2(nameSegmentData.g, nameSegmentData.b)) - nameSegmentData.a;
    float creditsSegmentDist = sdSegment(uv, vec2(creditsSegmentData.r, creditsSegmentData.b), vec2(creditsSegmentData.g, creditsSegmentData.b)) - creditsSegmentData.a;
    
    float availableSegmentDist = sdSegment(uv, vec2(availableSegmentData.r, availableSegmentData.b), vec2(availableSegmentData.g, availableSegmentData.b)) - availableSegmentData.a;
    
    float emailSegmentDist = sdSegment(uv, vec2(emailSegmentData.r, emailSegmentData.b), vec2(emailSegmentData.g, emailSegmentData.b)) - emailSegmentData.a;
    float twitterSegmentDist = sdSegment(uv, vec2(twitterSegmentData.r, twitterSegmentData.b), vec2(twitterSegmentData.g, twitterSegmentData.b)) - twitterSegmentData.a;
    float linkedinSegmentDist = sdSegment(uv, vec2(linkedinSegmentData.r, linkedinSegmentData.b), vec2(linkedinSegmentData.g, linkedinSegmentData.b)) - linkedinSegmentData.a;
    float readcvSegmentDist = sdSegment(uv, vec2(readcvSegmentData.r, readcvSegmentData.b), vec2(readcvSegmentData.g, readcvSegmentData.b)) - readcvSegmentData.a;
    
    float combinedDistSubtract = min(nameSegmentDist, min(creditsSegmentDist, min(availableSegmentDist, min(emailSegmentDist, min(twitterSegmentDist, min(linkedinSegmentDist, readcvSegmentDist))))));
    
    // Merge distances
    float combinedDist = smoothMax(combinedDistUnion.x, -combinedDistSubtract, 9.);
    
    vec2 textCenterCoords = texelFetch(uInteractionsTexture, ivec2(2,0),0).xy;
    uv -= textCenterCoords;
    uv *= uTextTextureScalar;
    
    uv /= uUvScalar;
    uv = uv * 0.5 + 0.5;
    float textMask = texture(uTextTexture, uv).r;
    
    vec4 cursorColor = vec4(0.122,0.337,0.451,1.0);
    vec4 screenBorderColor = vec4(0.647,0.753,0.694,1.0);
    vec4 backgroundColor = vec4(0.957,0.953,0.941,0.0);
    
    vec4 col = mix(cursorColor, screenBorderColor, combinedDistUnion.y);
    col = mix(col, backgroundColor, smoothstep(0.0, 0.015, combinedDist + textMask));
    
    gl_FragColor = col;
}