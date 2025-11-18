import {
        ArciumX25519PublicKey,
        ArciumX25519SecretKey,
        Bytes,
        SolanaSignature,
        U128,
        U128BeBytes,
        U256,
} from '@/types';
import { ISigner } from '@/client/interface';
import { RescueCipher } from '@/client/implementation';
import { MXE_ARCIUM_X25519_PUBLIC_KEY } from '@/constants/arcium';
import { kmac128 } from '@noble/hashes/sha3-addons.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import { convertU128BeBytesToU128, convertU256ToLeBytes } from '@/utils/convertors';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import { UmbraWalletError } from './umbra-wallet-error';

/**
 * Error thrown when wallet initialization fails.
 *
 * @remarks
 * This error is thrown when wallet creation fails due to signer unavailability,
 * key derivation failures, or other initialization issues.
 *
 * @public
 */
export class UmbraWalletInitializationError extends UmbraWalletError {
        /**
         * Creates a new instance of UmbraWalletInitializationError.
         *
         * @param message - Error message describing why wallet initialization failed
         * @param cause - Optional underlying error that caused the initialization failure
         */
        public constructor(message: string, cause?: Error) {
                super(`Failed to initialize Umbra wallet: ${message}`, cause);
        }
}

/**
 * Umbra Privacy wallet implementation providing cryptographic operations and transaction signing.
 *
 * @remarks
 * The UmbraWallet class is the main interface for interacting with the Umbra Privacy protocol.
 * It provides functionality for:
 * - Deriving cryptographic keys from a signer
 * - Creating and managing Rescue ciphers for encryption/decryption
 * - Generating linker hashes for transaction privacy
 * - Signing messages and transactions
 *
 * The wallet derives its cryptographic material from a master signature seed obtained by
 * signing a default message with the provided signer. This seed is used to derive:
 * - X25519 key pair for Rescue cipher operations
 * - Master viewing key for compliance and transaction linking
 *
 * **Key Derivation:**
 * - X25519 keys are derived using KMAC256 with domain separator "Umbra Privacy - X25519 Private Key"
 * - Master viewing key is derived using KMAC128 with domain separator "Umbra Privacy - Master Viewing Key"
 *
 * **Rescue Ciphers:**
 * The wallet maintains a cache of Rescue ciphers for different public keys. The cipher for
 * the MXE (Multi-Execution Environment) public key is automatically created during initialization.
 *
 * @public
 *
 * @example
 * ```typescript
 * // Create wallet from a signer
 * const wallet = await UmbraWallet.fromSigner(signer);
 *
 * // Generate linker hash for a transaction
 * const linkerHash = wallet.generateLinkerHash(
 *   'create_spl_deposit_with_hidden_amount',
 *   year, month, day, hour, minute, second
 * );
 *
 * // Sign a message
 * const signature = await wallet.signMessage(message);
 *
 * // Get Rescue cipher for a public key
 * const cipher = wallet.getRescueCipherForPublicKey(publicKey);
 * ```
 */
export class UmbraWallet {
        /**
         * Cache of Rescue ciphers keyed by X25519 public keys.
         *
         * @remarks
         * This map caches Rescue cipher instances to avoid recreating them for the same public key.
         * The cipher for the MXE (Multi-Execution Environment) public key is automatically
         * created during wallet initialization.
         */
        readonly rescueCiphers: Map<ArciumX25519PublicKey, RescueCipher>;

        /**
         * The master viewing key derived from the master signature seed.
         *
         * @remarks
         * This 128-bit key is used for compliance and transaction linking in the Umbra protocol.
         * It enables authorized parties to link transactions while maintaining privacy for others.
         */
        readonly masterViewingKey: U128;

        /**
         * Blinding factor associated with the master viewing key.
         *
         * @remarks
         * The blinding factor is a second 128-bit value derived from the same master signature
         * seed as the master viewing key, but using a distinct domain separator. It is intended
         * to be used as a randomness source in constructions that involve the master viewing key
         * (for example, commitments, randomized encodings, or proof systems) so that the raw
         * viewing key never needs to be used directly.
         *
         * Keeping the viewing key and its blinding factor separate allows higher-level protocols
         * to combine them in different ways without reusing the same derived value across
         * multiple cryptographic contexts.
         */
        readonly masterViewingKeyPoseidonBlindingFactor: U128;

        /**
         * SHA-3 specific blinding factor associated with the master viewing key.
         *
         * @remarks
         * This 128-bit value is derived from the same master signature seed using a distinct
         * "Master Viewing Key Sha3 Blinding Factor" domain separator. It is intended to be used
         * anywhere SHA-3–based commitments or hashes depend on the master viewing key, so that
         * Poseidon- and SHA-3–based constructions never reuse the exact same blinding material.
         */
        readonly masterViewingKeySha3BlindingFactor: U128;

        /**
         * Deterministic random secret generator derived from the wallet's master signature seed.
         *
         * @param index - Domain-separated index (as {@link U256}) used to derive an independent secret.
         * @returns A 128-bit secret value as a {@link U128}.
         *
         * @remarks
         * This function pointer is initialised in the constructor to a KMAC-based derivation that
         * expands the master signature seed into an arbitrary number of cryptographically independent
         * secrets. Each `index` produces a distinct secret while remaining deterministic for the same
         * wallet and index.
         *
         * It is typically used as a building block for higher-level blinding factors or protocol-
         * specific secrets, ensuring that each usage has a unique domain separation via the `index`.
         *
         * @example
         * ```ts
         * const index: U256 = /* obtain index *\/;
         * const secret: U128 = wallet.generateRandomSecret(index);
         * console.log(secret.toString());
         * ```
         */
        generateRandomSecret(index: U256): U128 {
                const randomSecretBeBytes = kmac128(
                        convertU256ToLeBytes(index),
                        this.randomSecretMasterSeed
                ) as U128BeBytes;
                return convertU128BeBytesToU128(randomSecretBeBytes);
        }

        /**
         * Function to get or create a Rescue cipher for a given X25519 public key.
         *
         * @param publicKey - The X25519 public key to create a cipher for
         * @returns A Rescue cipher instance configured with the shared secret derived from the key exchange
         *
         * @remarks
         * This function performs an X25519 key exchange between the wallet's private key
         * and the provided public key to derive a shared secret, which is then used to
         * initialize the Rescue cipher.
         */
        readonly getRescueCipherForPublicKey: (publicKey: ArciumX25519PublicKey) => RescueCipher = (
                publicKey: ArciumX25519PublicKey
        ) => {
                return RescueCipher.fromX25519Pair(this.arciumX25519SecretKey, publicKey);
        };

        /**
         * Private constructor for creating UmbraWallet instances.
         *
         * @param signer - The signer instance to use for operations
         * @param arciumX25519PublicKey - The derived X25519 public key
         * @param arciumX25519SecretKey - The derived X25519 secret key
         * @param masterViewingKey - The derived master viewing key
         * @param masterViewingKeyPoseidonBlindingFactor
         * @param masterViewingKeySha3BlindingFactor
         * @param randomSecretMasterSeed
         */
        constructor(
                /**
                 * The signer instance used for cryptographic operations and transaction signing.
                 */
                readonly signer: ISigner,
                /**
                 * The X25519 public key derived from the master signature seed.
                 *
                 * @remarks
                 * This public key is used for establishing Rescue cipher shared secrets with other parties.
                 * It can be shared publicly to enable encrypted communication.
                 */
                readonly arciumX25519PublicKey: ArciumX25519PublicKey,
                private readonly arciumX25519SecretKey: ArciumX25519SecretKey,
                masterViewingKey: U128,
                masterViewingKeyPoseidonBlindingFactor: U128,
                masterViewingKeySha3BlindingFactor: U128,
                private readonly randomSecretMasterSeed: Uint8Array<ArrayBufferLike>
        ) {
                this.rescueCiphers = new Map();

                this.getRescueCipherForPublicKey = (publicKey: ArciumX25519PublicKey) => {
                        return RescueCipher.fromX25519Pair(arciumX25519SecretKey, publicKey);
                };

                this.rescueCiphers.set(
                        MXE_ARCIUM_X25519_PUBLIC_KEY,
                        this.getRescueCipherForPublicKey(MXE_ARCIUM_X25519_PUBLIC_KEY)
                );
                this.masterViewingKey = masterViewingKey;
                this.masterViewingKeyPoseidonBlindingFactor =
                        masterViewingKeyPoseidonBlindingFactor;
                this.masterViewingKeySha3BlindingFactor = masterViewingKeySha3BlindingFactor;
        }

        /**
         * Signs a message using the wallet's signer.
         *
         * @param message - The message bytes to sign
         * @returns A promise resolving to a 64-byte Ed25519 signature
         *
         * @throws {@link SignerError} When message signing fails
         *
         * @remarks
         * This method delegates to the underlying signer's `signMessage` method.
         * The signature is a standard Solana Ed25519 signature (64 bytes).
         *
         * @example
         * ```typescript
         * const message = new TextEncoder().encode('Hello, Umbra!');
         * const signature = await wallet.signMessage(message);
         * ```
         */
        async signMessage(message: Bytes): Promise<SolanaSignature> {
                const signature = await this.signer.signMessage(message);
                return signature;
        }

        /**
         * Signs a single Solana versioned transaction.
         *
         * @param transaction - The versioned transaction to sign
         * @returns A promise resolving to the signed transaction
         *
         * @throws {@link SignerError} When transaction signing fails
         *
         * @remarks
         * This method delegates to the underlying signer's `signTransaction` method.
         * The transaction is modified in-place with the signature attached.
         *
         * @example
         * ```typescript
         * const signedTx = await wallet.signTransaction(transaction);
         * await connection.sendTransaction(signedTx);
         * ```
         */
        async signTransaction(transaction: VersionedTransaction): Promise<VersionedTransaction> {
                const signedTransaction = await this.signer.signTransaction(transaction);
                return signedTransaction;
        }

        /**
         * Signs a Solana versioned transaction using a one-time ephemeral Ed25519 keypair.
         *
         * @param transaction - The versioned transaction to sign
         * @returns A promise resolving to the signed transaction and the ephemeral public key bytes
         *
         * @remarks
         * This method generates a fresh Ed25519 keypair for each call, constructs a Solana
         * `Keypair` from it, and uses the transaction's `sign` method to attach the signature.
         * The private key is scoped to this method and is not stored on the wallet instance.
         *
         * The returned public key allows callers to add the ephemeral signer to account
         * metas or verify the transaction signature as needed.
         */
        async signTransactionWithEphemeralKeypair(transaction: VersionedTransaction): Promise<{
                signedTransaction: VersionedTransaction;
                ephemeralPublicKey: Bytes;
        }> {
                // Generate a fresh Ed25519 private key and corresponding public key
                const privateKey = ed25519.utils.randomSecretKey();
                const publicKey = ed25519.getPublicKey(privateKey) as Bytes;

                // Solana Keypair secretKey is 64 bytes: [privateKey(32) | publicKey(32)]
                const secretKey = new Uint8Array(64);
                secretKey.set(privateKey, 0);
                secretKey.set(publicKey, 32);

                const ephemeralKeypair = Keypair.fromSecretKey(secretKey);

                // Sign the transaction with the ephemeral keypair
                transaction.sign([ephemeralKeypair]);

                return {
                        signedTransaction: transaction,
                        ephemeralPublicKey: publicKey,
                };
        }

        /**
         * Signs multiple Solana versioned transactions in a batch.
         *
         * @param transactions - Array of versioned transactions to sign
         * @returns A promise resolving to an array of signed transactions in the same order as input
         *
         * @throws {@link SignerError} When batch transaction signing fails
         *
         * @remarks
         * This method delegates to the underlying signer's `signTransactions` method.
         * All transactions are signed in a single batch operation, which may be more
         * efficient than signing them individually.
         *
         * @example
         * ```typescript
         * const signedTxs = await wallet.signTransactions([tx1, tx2, tx3]);
         * // All transactions are now signed
         * ```
         */
        async signTransactions(
                transactions: Array<VersionedTransaction>
        ): Promise<Array<VersionedTransaction>> {
                const signedTransactions = await this.signer.signTransactions(transactions);
                return signedTransactions;
        }

        /**
         * Adds a Rescue cipher to the cache for a given X25519 public key.
         *
         * @param publicKey - The X25519 public key to create and cache a Rescue cipher for
         *
         * @remarks
         * This method creates a Rescue cipher that encrypts data using a shared secret derived
         * from an X25519 key exchange between the wallet's X25519 secret key and the provided
         * X25519 public key. The cipher is then cached in the `rescueCiphers` map for future use.
         *
         * **Key Exchange Process:**
         * The method performs an X25519 Diffie-Hellman key exchange:
         * `sharedSecret = X25519(walletSecretKey, providedPublicKey)`
         *
         * This shared secret is used to initialize the Rescue cipher, enabling encrypted
         * communication with the party that owns the provided public key.
         *
         * **Caching:**
         * The cipher is stored in the `rescueCiphers` map, allowing efficient reuse without
         * recreating the cipher for subsequent operations with the same public key. If a cipher
         * already exists for the given public key, it will be overwritten with a new instance.
         *
         * **Use Cases:**
         * - Pre-caching ciphers for frequently used public keys
         * - Setting up encryption for communication with specific parties
         * - Optimizing performance by avoiding repeated cipher creation
         *
         * @example
         * ```typescript
         * // Add a cipher for a specific public key
         * wallet.addEncryptorForPublicKey(recipientPublicKey);
         *
         * // The cipher is now cached and can be retrieved
         * const cipher = wallet.rescueCiphers.get(recipientPublicKey);
         * const [ciphertext, nonce] = await cipher.encrypt([100n, 200n]);
         * ```
         */
        addEncryptorForPublicKey(publicKey: ArciumX25519PublicKey): void {
                this.rescueCiphers.set(publicKey, this.getRescueCipherForPublicKey(publicKey));
        }
}
