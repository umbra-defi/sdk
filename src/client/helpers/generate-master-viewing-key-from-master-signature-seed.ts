import { U128, U128BeBytes } from '@/types';
import { convertU128BeBytesToU128 } from '@/utils';
import { kmac128 } from '@noble/hashes/sha3-addons.js';

/**
 * Derives a master viewing key from a master signature seed.
 *
 * @param masterSignatureSeed - The master signature seed (64-byte signature)
 * @returns A 128-bit master viewing key (U128)
 *
 * @remarks
 * This method derives a 128-bit master viewing key using KMAC128 with a domain separator.
 * The master viewing key is used for:
 * - Compliance and transaction linking
 * - Generating linker hashes for transaction privacy
 * - Enabling authorized parties to link related transactions
 *
 * The domain separator "Umbra Privacy - Master Viewing Key" ensures the derived
 * key is unique to this purpose and prevents key reuse across different contexts.
 *
 * @example
 * ```typescript
 * const masterViewingKey =
 *   UmbraWallet.generateMasterViewingKeyFromMasterSignatureSeed(signatureSeed);
 * ```
 */
export function generateMasterViewingKeyFromMasterSignatureSeed(
        masterSignatureSeed: Uint8Array
): U128 {
        const MASTER_VIEWING_KEY_DOMAIN_SEPARATOR = new TextEncoder().encode(
                'Umbra Privacy - Master Viewing Key'
        );

        const masterViewingKeyBeBytes = kmac128(
                masterSignatureSeed,
                MASTER_VIEWING_KEY_DOMAIN_SEPARATOR
        ) as U128BeBytes;
        return convertU128BeBytesToU128(masterViewingKeyBeBytes);
}
