#define POS_BIT_RANGE 0xffffff

struct Particle {
    vec2 pos;
    float delay;
    bool is_touched;
};

Particle decode_particle(vec4 encoded_particle) {
    Particle particle;
    
    float encoded_flags = encoded_particle.z;
    uint flags_aggregate = uint(encoded_flags);
    
    uint iFlag_is_touched = flags_aggregate & uint(0x1);
    particle.is_touched = bool(iFlag_is_touched);
    
    particle.pos.x = encoded_particle.x;
    particle.pos.y = encoded_particle.y;
    particle.delay = encoded_particle.a;
    
    return particle;
}

vec4 encode_particle(Particle particle) {
    uint flags_aggregate = uint(POS_BIT_RANGE);
    flags_aggregate = flags_aggregate & uint(particle.is_touched) << 0;
    float encoded_flags = float(flags_aggregate);
    
    return vec4(particle.pos.x, particle.pos.y, encoded_flags, particle.delay);
}
