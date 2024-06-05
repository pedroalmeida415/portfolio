#define MAX_POS_X 10.0
#define POS_BIT_RANGE 0xffffff

struct Particle {
    vec2 pos;
    float delay;
    bool is_touched;
};

Particle decode_particle(vec4 encoded_particle) {
    Particle particle;

    float pos_x_sign = sign(encoded_particle.x);
    uint iPos_x = uint(abs(encoded_particle.x));

    uint iFlag_is_touched = iPos_x & uint(0x1);
    particle.is_touched = bool(iFlag_is_touched);

    iPos_x = (iPos_x >> 1 << 1);
    
    particle.pos.x = float(iPos_x) / float(POS_BIT_RANGE);
    particle.pos.x *= MAX_POS_X;
    particle.pos.x *= pos_x_sign;
    
    particle.pos.y = encoded_particle.y;
    particle.delay = encoded_particle.a;

    return particle;
}

vec4 encode_particle(Particle particle) {
    uint iPos_x = uint((min(abs(particle.pos.x), MAX_POS_X - 0.001) / MAX_POS_X) * float(POS_BIT_RANGE));
    iPos_x = (iPos_x >> 1 << 1 ) | uint(particle.is_touched);
    float pos_x_sign = sign(particle.pos.x);
    float encoded_pos_x = float(iPos_x) * pos_x_sign;

    return vec4(encoded_pos_x, particle.pos.y, 0.0, particle.delay);
}
