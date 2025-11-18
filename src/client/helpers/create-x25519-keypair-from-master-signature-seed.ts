import { ArciumX25519PublicKey, ArciumX25519SecretKey } from '@/types';
import { kmac256 } from '@noble/hashes/sha3-addons.js';
import { x25519 } from '@noble/curves/ed25519.js';

/**
 * Derives an X25519 key pair from a master signature seed.
 *
 * @param masterSignatureSeed - The master signature seed (64-byte signature)
 * @returns An object containing the derived X25519 private and public keys
 *
 * @remarks
 * This method derives an X25519 key pair using KMAC256 with a domain separator.
 * The derivation process:
 * 1. Uses KMAC256 to derive a 32-byte private key from the seed
 * 2. Computes the corresponding public key using X25519 scalar multiplication
 *
 * The domain separator "Umbra Privacy - X25519 Private Key" ensures the derived
 * key is unique to this purpose and prevents key reuse across different contexts.
 *
 * @example
 * ```typescript
 * const { x25519PrivateKey, x25519PublicKey } =
 *   UmbraWallet.createX25519KeypairFromMasterSignatureSeed(signatureSeed);
 * ```
 */
export function createX25519KeypairFromMasterSignatureSeed(masterSignatureSeed: Uint8Array): {
        x25519PrivateKey: ArciumX25519SecretKey;
        x25519PublicKey: ArciumX25519PublicKey;
} {
        const X25519_DOMAIN_SEPARATOR = new TextEncoder().encode(
                'Umbra Privacy - X25519 Private Key'
        );

        const x25519PrivateKeyBeBytes = kmac256(
                masterSignatureSeed,
                X25519_DOMAIN_SEPARATOR
        ) as ArciumX25519SecretKey;
        const x25519PublicKeyBeBytes = x25519.getPublicKey(
                x25519PrivateKeyBeBytes
        ) as ArciumX25519PublicKey;

        return {
                x25519PrivateKey: x25519PrivateKeyBeBytes,
                x25519PublicKey: x25519PublicKeyBeBytes,
        };
}
