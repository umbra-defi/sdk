import { ISigner, SignerError } from '@/client/interface';
import { DEFAULT_SIGNING_MESSAGE } from '@/constants';
import { createX25519KeypairFromMasterSignatureSeed } from '@/client/helpers/create-x25519-keypair-from-master-signature-seed';
import { generateMasterViewingKeyFromMasterSignatureSeed } from '@/client/helpers/generate-master-viewing-key-from-master-signature-seed';
import { generateMasterViewingKeyBlindingFactorFromMasterSignatureSeed } from '@/client/helpers/generate-master-viewing-key-blinding-factor-from-master-signature-seed';
import { generateMasterViewingKeySha3BlindingFactorFromMasterSignatureSeed } from '@/client/helpers/generate-master-viewing-key-sha3-blinding-factor-from-master-signature-seed';
import { UmbraWallet, UmbraWalletInitializationError } from '@/client/umbra-wallet';
import { kmac256 } from '@noble/hashes/sha3-addons.js';

/**
 * Creates a new UmbraWallet instance from a signer.
 *
 * @param signer - The signer instance to use for wallet operations
 * @returns A promise resolving to a new UmbraWallet instance
 *
 * @throws {@link UmbraWalletInitializationError} When wallet initialization fails
 * @throws {@link SignerError} When message signing fails during initialization
 *
 * @remarks
 * This factory method initializes a new UmbraWallet by:
 * 1. Signing the default message to obtain a master signature seed
 * 2. Deriving X25519 key pair from the master signature seed
 * 3. Deriving the master viewing key from the master signature seed
 * 4. Creating a function to generate Rescue ciphers for any public key
 * 5. Pre-creating the Rescue cipher for the MXE public key
 *
 * The master signature seed is obtained by signing a default message that warns users
 * about the security implications. This signature is used as a seed for all key derivation.
 *
 * @example
 * ```typescript
 * const wallet = await createUmbraWalletFromSigner(signer);
 * console.log(`Wallet public key: ${wallet.arciumX25519PublicKey}`);
 * console.log(`Master viewing key: ${wallet.masterViewingKey}`);
 * ```
 */
export async function createUmbraWalletFromSigner(signer: ISigner): Promise<UmbraWallet> {
        try {
                const masterSignatureSeed = await signer.signMessage(DEFAULT_SIGNING_MESSAGE);
                const { x25519PrivateKey, x25519PublicKey } =
                        createX25519KeypairFromMasterSignatureSeed(masterSignatureSeed);
                const masterViewingKey =
                        generateMasterViewingKeyFromMasterSignatureSeed(masterSignatureSeed);

                const masterViewingKeyPoseidonBlindingFactor =
                        generateMasterViewingKeyBlindingFactorFromMasterSignatureSeed(
                                masterSignatureSeed
                        );

                const masterViewingKeySha3BlindingFactor =
                        generateMasterViewingKeySha3BlindingFactorFromMasterSignatureSeed(
                                masterSignatureSeed
                        );

                const randomSecretMasterSeed = kmac256(
                        new TextEncoder().encode('Umbra Privacy - Random Secret Master Seed'),
                        masterSignatureSeed
                );

                return new UmbraWallet(
                        signer,
                        x25519PublicKey,
                        x25519PrivateKey,
                        masterViewingKey,
                        masterViewingKeyPoseidonBlindingFactor,
                        masterViewingKeySha3BlindingFactor,
                        randomSecretMasterSeed
                );
        } catch (error) {
                if (error instanceof SignerError) {
                        throw error;
                }
                throw new UmbraWalletInitializationError(
                        'Failed to create wallet from signer',
                        error instanceof Error ? error : new Error(String(error))
                );
        }
}
