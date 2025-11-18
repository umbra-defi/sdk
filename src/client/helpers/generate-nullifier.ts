import { U128, U128BeBytes, U256 } from '@/types';
import { convertU128BeBytesToU128, convertU128ToLeBytes, convertU256ToLeBytes } from '@/utils';
import { kmac128 } from '@noble/hashes/sha3-addons.js';

/**
 * Derives a deterministic nullifier for a given index using the wallet's master viewing key.
 *
 * @param masterViewingKey
 * @param index - The nullifier index (typically a position or counter) encoded as a {@link U256}.
 * @returns A 128-bit nullifier value as a {@link U128}.
 *
 * @remarks
 * This function uses a two-step KMAC-based derivation:
 * - First, it derives a *nullifier master seed* from the master viewing key and a fixed
 *   context string (`"Umbra Privacy - Nullifier Master Seed"`).
 * - It then derives the final nullifier from the provided `index` and the nullifier master seed.
 *
 * The resulting nullifier is deterministic for a given `(masterViewingKey, index)` pair,
 * while remaining unlinkable across different master viewing keys due to the domain-separated
 * KMAC construction.
 *
 * @example
 * ```ts
 * const index: U256 = /* obtain index *\/;
 * const nullifier: U128 = generateNullifier(masterViewingKey, index);
 * console.log(nullifier.toString());
 * ```
 */
export function generateNullifier(masterViewingKey: U128, index: U256): U128 {
        const message = convertU128ToLeBytes(masterViewingKey);
        const nullifierMasterSeed = kmac128(
                new TextEncoder().encode('Umbra Privacy - Nullifier Master Seed'),
                message
        ) as U128BeBytes;
        const nullifierBeBytes = kmac128(
                convertU256ToLeBytes(index),
                nullifierMasterSeed
        ) as U128BeBytes;
        return convertU128BeBytesToU128(nullifierBeBytes);
}
