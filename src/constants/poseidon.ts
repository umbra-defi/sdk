import poseidonConstants from '@/constants/poseidon_constants.json' assert { type: 'json' };

export const ROUNDS_FULL = 8;
export const ROUNDS_PARTIAL = [56, 57, 56, 60, 60, 63, 64, 63, 60, 66, 60, 65, 70, 60, 64, 68];
export const SBOX_POWER = 5;
export const POSEIDON_CONSTANTS = poseidonConstants;
