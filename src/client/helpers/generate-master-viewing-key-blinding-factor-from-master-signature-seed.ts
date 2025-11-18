import { U128, U128BeBytes } from '@/types';
import { convertU128BeBytesToU128 } from '@/utils';
import { kmac128 } from '@noble/hashes/sha3-addons.js';

/**
 * Derives a blinding factor for the master viewing key from a master signature seed.
 *
 * @param masterSignatureSeed - The master signature seed (64-byte signature)
 * @returns A 128-bit blinding factor (U128) for use alongside the master viewing key
 *
 * @remarks
 * This method derives a second 128-bit value using KMAC128 with a dedicated domain
 * separator "Umbra Privacy - Master Viewing Key Blinding Factor". It is computed from
 * the same master signature seed as the master viewing key, but with a different
 * derivation label so that:
 *
 * - The blinding factor is **cryptographically independent** from the master viewing key
 * - The viewing key never needs to be reused directly as randomness in other schemes
 *
 * Typical uses include:
 * - Adding noise/randomness to commitments that depend on the master viewing key
 * - Generating per-user randomness in zero-knowledge proofs or encrypted metadata
 *
 * @example
 * ```typescript
 * const blindingFactor =
 *   UmbraWallet.generateMasterViewingKeyBlindingFactorFromMasterSignatureSeed(signatureSeed);
 * ```
 */
export function generateMasterViewingKeyBlindingFactorFromMasterSignatureSeed(
        masterSignatureSeed: Uint8Array
): U128 {
        const MASTER_VIEWING_KEY_BLINDING_FACTOR_DOMAIN_SEPARATOR = new TextEncoder().encode(
                'Umbra Privacy - Master Viewing Key Blinding Factor'
        );
        const masterViewingKeyBlindingFactorBeBytes = kmac128(
                masterSignatureSeed,
                MASTER_VIEWING_KEY_BLINDING_FACTOR_DOMAIN_SEPARATOR
        ) as U128BeBytes;
        return convertU128BeBytesToU128(masterViewingKeyBlindingFactorBeBytes);
}
