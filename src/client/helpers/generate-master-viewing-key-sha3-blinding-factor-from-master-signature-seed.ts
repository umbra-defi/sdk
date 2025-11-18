/**
 * Derives a SHA-3-specific blinding factor for the master viewing key from a master signature seed.
 *
 * @param masterSignatureSeed - The master signature seed (64-byte signature)
 * @returns A 128-bit blinding factor (U128) for use with SHA-3–based commitments
 *
 * @remarks
 * This method derives a 128-bit value using KMAC128 with the domain separator
 * "Umbra Privacy - Master Viewing Key Sha3 Blinding Factor". It is computed from
 * the same master signature seed as the master viewing key and Poseidon blinding factor,
 * but uses a distinct label so that SHA-3–based and Poseidon-based constructions never
 * reuse the exact same randomness.
 *
 * Use this factor anywhere you need per-user randomness in SHA-3 commitments or hashes
 * that are tied to the master viewing key, without exposing the viewing key itself.
 */
import { U128, U128BeBytes } from '@/types';
import { convertU128BeBytesToU128 } from '@/utils';
import { kmac128 } from '@noble/hashes/sha3-addons.js';

export function generateMasterViewingKeySha3BlindingFactorFromMasterSignatureSeed(
        masterSignatureSeed: Uint8Array
): U128 {
        const MASTER_VIEWING_KEY_SHA3_BLINDING_FACTOR_DOMAIN_SEPARATOR = new TextEncoder().encode(
                'Umbra Privacy - Master Viewing Key Sha3 Blinding Factor'
        );
        const masterViewingKeySha3BlindingFactorBeBytes = kmac128(
                masterSignatureSeed,
                MASTER_VIEWING_KEY_SHA3_BLINDING_FACTOR_DOMAIN_SEPARATOR
        ) as U128BeBytes;
        return convertU128BeBytesToU128(masterViewingKeySha3BlindingFactorBeBytes);
}
