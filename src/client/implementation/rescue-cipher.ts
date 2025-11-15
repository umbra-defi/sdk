import {
        ArciumX25519Nonce,
        ArciumX25519PublicKey,
        ArciumX25519SecretKey,
        Plaintext,
        RescueCipherSharedSecret,
        RescueCiphertext,
        U128LeBytes,
} from '@/types';
import { randomBytes } from '@noble/hashes/utils.js';
import { RescueCipher as ArciumRescueCipher } from '@arcium-hq/client';
import { convertU128LeBytesToU128, convertU128ToLeBytes } from '@/utils/convertors';
import { x25519 } from '@noble/curves/ed25519.js';

/**
 * Wrapper class for Arcium's Rescue cipher providing symmetric encryption and decryption.
 *
 * @remarks
 * This class provides a high-level interface for the Rescue cipher implementation from Arcium.
 * It supports encryption and decryption of plaintext values using a shared secret derived from
 * X25519 key exchange or provided directly. The cipher uses a nonce for each encryption operation
 * to ensure security and prevent replay attacks.
 *
 * The Rescue cipher is a zero-knowledge friendly symmetric encryption scheme designed for use
 * in privacy-preserving blockchain applications. Each encryption operation generates a random
 * nonce that must be stored and provided during decryption.
 *
 * @public
 *
 * @example
 * ```typescript
 * // Create from X25519 key pair
 * const cipher = await RescueCipher.fromX25519Pair(secretKey, publicKey);
 * const plaintext = [100n, 200n, 300n];
 * const [ciphertext, nonce] = await cipher.encrypt(plaintext);
 * const decrypted = await cipher.decrypt(ciphertext, nonce);
 *
 * // Create from shared secret
 * const cipher2 = RescueCipher.fromSharedSecret(sharedSecret);
 * const [ciphertext2, nonce2] = await cipher2.encrypt(plaintext);
 * ```
 */
export class RescueCipher {
        /**
         * Encrypts an array of plaintext values into ciphertext.
         *
         * @param plaintext - Array of plaintext values (bigint) to encrypt
         * @returns A promise resolving to a tuple containing:
         *          - Array of encrypted ciphertext values (32-byte each)
         *          - The nonce used for encryption (must be stored for decryption)
         *
         * @remarks
         * This method encrypts multiple plaintext values in a single operation. A random nonce
         * is automatically generated for each encryption call. The nonce is returned alongside
         * the ciphertext and must be stored securely - it is required for decryption.
         *
         * The encryption uses the Rescue cipher algorithm with the shared secret established
         * during cipher creation. Each ciphertext is 32 bytes in length.
         *
         * @example
         * ```typescript
         * const plaintext = [1000n, 2000n, 3000n];
         * const [ciphertext, nonce] = await cipher.encrypt(plaintext);
         * // Store both ciphertext and nonce for later decryption
         * ```
         */
        public readonly encrypt: (
                plaintext: Array<Plaintext>
        ) => Promise<[Array<RescueCiphertext>, ArciumX25519Nonce]>;

        /**
         * Decrypts an array of ciphertext values back to plaintext.
         *
         * @param ciphertext - Array of encrypted ciphertext values (32-byte each)
         * @param nonce - The nonce that was used during encryption (must match the encryption nonce)
         * @returns A promise resolving to an array of decrypted plaintext values (bigint)
         *
         * @remarks
         * This method decrypts ciphertext values that were encrypted with the same shared secret
         * and nonce. The nonce must be the exact same value that was returned from the `encrypt`
         * method. Using a different nonce will result in incorrect decryption.
         *
         * The ciphertext array length must match the original plaintext array length. Each
         * ciphertext must be exactly 32 bytes.
         *
         * @example
         * ```typescript
         * const decrypted = await cipher.decrypt(ciphertext, nonce);
         * // decrypted will match the original plaintext array
         * ```
         */
        public readonly decrypt: (
                ciphertext: Array<RescueCiphertext>,
                nonce: ArciumX25519Nonce
        ) => Promise<Array<Plaintext>>;

        /**
         * Private constructor for creating RescueCipher instances.
         *
         * @param encrypt - Encryption function implementation
         * @param decrypt - Decryption function implementation
         *
         * @remarks
         * This constructor is private. Use the static factory methods `fromSharedSecret` or
         * `fromX25519Pair` to create instances.
         */
        private constructor(
                encrypt: (
                        plaintext: Array<Plaintext>
                ) => Promise<[Array<RescueCiphertext>, ArciumX25519Nonce]>,
                decrypt: (
                        ciphertext: Array<RescueCiphertext>,
                        nonce: ArciumX25519Nonce
                ) => Promise<Array<Plaintext>>
        ) {
                this.encrypt = encrypt;
                this.decrypt = decrypt;
        }

        /**
         * Creates a RescueCipher instance from a shared secret.
         *
         * @param sharedSecret - The shared secret (32-byte) to use for encryption/decryption
         * @returns A new RescueCipher instance configured with the provided shared secret
         *
         * @remarks
         * This factory method creates a RescueCipher instance using a pre-computed shared secret.
         * The shared secret must be exactly 32 bytes and should be derived from a secure key
         * exchange protocol (e.g., X25519).
         *
         * The shared secret is used to initialize the underlying Arcium Rescue cipher implementation.
         * All encryption and decryption operations will use this shared secret.
         *
         * @example
         * ```typescript
         * const sharedSecret = /* 32-byte shared secret *\/;
         * const cipher = RescueCipher.fromSharedSecret(sharedSecret);
         * const [ciphertext, nonce] = await cipher.encrypt([100n, 200n]);
         * ```
         */
        public static fromSharedSecret(sharedSecret: RescueCipherSharedSecret): RescueCipher {
                const rescueCipher = new ArciumRescueCipher(sharedSecret);
                const encrypt: (
                        plaintext: Array<Plaintext>
                ) => Promise<[Array<RescueCiphertext>, ArciumX25519Nonce]> = async (
                        plaintext: Array<Plaintext>
                ) => {
                        const nonce = RescueCipher.generateRandomNonce();
                        const ciphertext = await rescueCipher.encrypt(
                                plaintext,
                                convertU128ToLeBytes(nonce)
                        );
                        const convertedCiphertext = ciphertext.map(
                                (c) => Uint8Array.from(c) as RescueCiphertext
                        );
                        return [convertedCiphertext, nonce];
                };
                const decrypt = async (
                        ciphertext: Array<RescueCiphertext>,
                        nonce: ArciumX25519Nonce
                ) => {
                        const ciphertextToDecrypt = ciphertext.map((c) => Array.from(c));
                        return await rescueCipher.decrypt(
                                ciphertextToDecrypt,
                                convertU128ToLeBytes(nonce)
                        );
                };
                return new RescueCipher(encrypt, decrypt);
        }

        /**
         * Creates a RescueCipher instance from an X25519 key pair by performing a key exchange.
         *
         * @param secretKey - The X25519 secret key (32-byte) - your private key
         * @param publicKey - The X25519 public key (32-byte) of the other party
         * @returns A new RescueCipher instance
         *
         * @remarks
         * This factory method performs an X25519 Diffie-Hellman key exchange between the provided
         * secret key and public key to derive a shared secret. The key exchange computes:
         * `sharedSecret = X25519(secretKey, publicKey)`
         *
         * The derived shared secret is then used to initialize the Rescue cipher for encryption
         * and decryption operations. This is the recommended way to create a RescueCipher when
         * you have X25519 keys, as it handles the key exchange automatically.
         *
         * **Key Exchange Process:**
         * - Your secret key (private) is combined with the other party's public key
         * - The X25519 elliptic curve function computes a shared secret
         * - This shared secret is used to initialize the Rescue cipher
         *
         * **Security Notes:**
         * - The secret key should be kept private and never shared
         * - The public key can be safely shared with the other party
         * - Both parties can create their own RescueCipher instances using their own secret key
         *   and the other party's public key, resulting in the same shared secret
         * - This enables secure communication where both parties can encrypt/decrypt messages
         *   using the same shared secret without ever transmitting it over the network
         *
         * @example
         * ```typescript
         * const mySecretKey = /* your X25519 secret key *\/;
         * const theirPublicKey = /* their X25519 public key *\/;
         * // Performs X25519 key exchange: sharedSecret = X25519(mySecretKey, theirPublicKey)
         * const cipher = await RescueCipher.fromX25519Pair(mySecretKey, theirPublicKey);
         * const [ciphertext, nonce] = await cipher.encrypt([100n, 200n]);
         * ```
         */
        public static fromX25519Pair(
                secretKey: ArciumX25519SecretKey,
                publicKey: ArciumX25519PublicKey
        ): RescueCipher {
                const sharedSecret = x25519.getSharedSecret(secretKey, publicKey);
                return RescueCipher.fromSharedSecret(sharedSecret as RescueCipherSharedSecret);
        }

        /**
         * Generates a cryptographically secure random nonce for encryption operations.
         *
         * @returns A random 128-bit nonce (U128) suitable for use with Rescue cipher encryption
         *
         * @remarks
         * This method generates a 16-byte (128-bit) random nonce using a cryptographically secure
         * random number generator. The nonce is returned as a U128 (branded bigint) type.
         *
         * Nonces are automatically generated during encryption operations, but this method can be
         * used if you need to generate a nonce separately (e.g., for testing or custom encryption flows).
         *
         * Each nonce should be used only once with the same shared secret to maintain security.
         *
         * @example
         * ```typescript
         * const nonce = RescueCipher.generateRandomNonce();
         * // Use nonce for custom encryption operations
         * ```
         */
        public static generateRandomNonce(): ArciumX25519Nonce {
                const randomNonceBytes = randomBytes(16);
                return convertU128LeBytesToU128(randomNonceBytes as U128LeBytes);
        }
}
