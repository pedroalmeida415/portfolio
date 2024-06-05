#define MAX_POS vec2(10.0, 5.0)
#define POS_BIT_RANGE 0xfffff

struct Particle {
    vec2 pos;
    bool is_touched;
    float delay;
};

Particle decode_particle(vec4 particle_encoded) {
    Particle particle;

    float pos_x_sign = sign(particle_encoded.x);
    uint iPos_x = uint(abs(particle_encoded.x));

    uint iFlag_is_touched = iPos_x & uint(0x1);
    particle.is_touched = bool(iFlag_is_touched);

    iPos_x = iPos_x >> 1;
    
    particle.pos.x = float(iPos_x) / float(POS_BIT_RANGE);
    particle.pos.x *= MAX_POS.x;
    particle.pos.x *= pos_x_sign;
    
    int iPos_y = int(abs(particle_encoded.y));
    particle.pos.y = (float(iPos_y >> 0) / float(POS_BIT_RANGE)) * MAX_POS.y;
    float pos_y_sign = sign(particle_encoded.y);
    particle.pos.y *= pos_y_sign;

    particle.delay = particle_encoded.a;

    return particle;
}

vec4 encode_particle(Particle particle) {
    uint iPos_x = uint((min(abs(particle.pos.x), MAX_POS.x) / MAX_POS.x) * float(POS_BIT_RANGE));
    iPos_x = iPos_x << 1 | uint(particle.is_touched);
    float pos_x_sign = sign(particle.pos.x);
    float encoded_pos_x = float(iPos_x) * pos_x_sign;

    int iPos_y = int((min(abs(particle.pos.y), MAX_POS.y) / MAX_POS.y) * float(POS_BIT_RANGE));
    float encoded_pos_y = float(((iPos_y & POS_BIT_RANGE) << 0));
    float pos_y_sign = sign(particle.pos.y);
    encoded_pos_y *= pos_y_sign;

    return vec4(encoded_pos_x, encoded_pos_y, 0.0, particle.delay);
}
