
#define MAX_POS vec2(10.0, 5.0)

struct Particle {
    vec2 pos;
    bool is_touched;
    float delay;
};

Particle decode_particle(vec4 particle_encoded) {
    Particle particle;

    particle.pos.x = (float(abs(int(particle_encoded.x)) >> 1) / float(0xfffff)) * MAX_POS.x;
    float pos_x_sign = sign(particle_encoded.x);
    particle.pos.x *= pos_x_sign;
    
    particle.pos.y = (float(abs(int(particle_encoded.y)) >> 0) / float(0xfffff)) * MAX_POS.y;
    float pos_y_sign = sign(particle_encoded.y);
    particle.pos.y *= pos_y_sign;

    particle.is_touched = bool(abs(int(particle_encoded.x)) & 0x1);
    
    particle.delay = particle_encoded.a;

    return particle;
}

vec4 encode_particle(Particle particle) {
    int iPos_x = int((min(abs(particle.pos.x), MAX_POS.x) / MAX_POS.x) * float(0xfffff));
    float encoded_pos_x = float(((iPos_x & 0xfffff) << 1) | (int(particle.is_touched) << 0));
    float pos_x_sign = sign(particle.pos.x);
    encoded_pos_x *= pos_x_sign;

    int iPos_y = int((min(abs(particle.pos.y), MAX_POS.y) / MAX_POS.y) * float(0xfffff));
    float encoded_pos_y = float(((iPos_y & 0xfffff) << 0));
    float pos_y_sign = sign(particle.pos.y);
    encoded_pos_y *= pos_y_sign;

    return vec4(encoded_pos_x, encoded_pos_y, 0.0, particle.delay);
}
