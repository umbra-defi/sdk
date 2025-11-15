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

export class RescueCipher {
        public readonly encrypt: (
                plaintext: Array<Plaintext>
        ) => Promise<[Array<RescueCiphertext>, ArciumX25519Nonce]>;
        public readonly decrypt: (
                ciphertext: Array<RescueCiphertext>,
                nonce: ArciumX25519Nonce
        ) => Promise<Array<Plaintext>>;

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

        public static async fromX25519Pair(
                secretKey: ArciumX25519SecretKey,
                publicKey: ArciumX25519PublicKey
        ): Promise<RescueCipher> {
                const sharedSecret = x25519.getSharedSecret(secretKey, publicKey);
                return RescueCipher.fromSharedSecret(sharedSecret as RescueCipherSharedSecret);
        }

        public static generateRandomNonce(): ArciumX25519Nonce {
                const randomNonceBytes = randomBytes(16);
                return convertU128LeBytesToU128(randomNonceBytes as U128LeBytes);
        }
}
