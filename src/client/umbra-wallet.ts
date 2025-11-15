import {
        ArciumX25519PublicKey,
        ArciumX25519SecretKey,
        Day,
        Month,
        Hour,
        Minute,
        PoseidonHash,
        Second,
        U128,
        U128BeBytes,
        Year,
        Bytes,
        SolanaSignature,
} from '@/types';
import { ISigner, SignerError } from '@/client/interface';
import { RescueCipher } from '@/client/implementation';
import { DEFAULT_SIGNING_MESSAGE, MXE_ARCIUM_X25519_PUBLIC_KEY } from '@/constants/arcium';
import { kmac128, kmac256 } from '@noble/hashes/sha3-addons.js';
import { x25519 } from '@noble/curves/ed25519.js';
import { convertU128BeBytesToU128 } from '@/utils/convertors';
// Imported for TSDoc @throws type references - used in JSDoc comments
// @ts-expect-error - This import is used in JSDoc @throws tags, but TypeScript doesn't recognize JSDoc as usage
import { PoseidonHasher, PoseidonHasherError } from '@/utils/hasher';
import { VersionedTransaction } from '@solana/web3.js';

/**
 * Abstract base class for all Umbra wallet-related errors.
 *
 * @remarks
 * This class provides a foundation for all Umbra wallet errors, ensuring consistent
 * error handling and type safety across wallet operations. All Umbra wallet errors
 * should extend this class.
 *
 * @public
 */
export abstract class UmbraWalletError extends Error {
        /**
         * Creates a new instance of UmbraWalletError.
         *
         * @param message - Human-readable error message describing what went wrong
         * @param cause - Optional underlying error that caused this error
         */
        public constructor(message: string, cause?: Error) {
                super(message);
                this.name = this.constructor.name;
                this.cause = cause;

                // Maintains proper stack trace for where our error was thrown (only available on V8)
                if (Error.captureStackTrace) {
                        Error.captureStackTrace(this, this.constructor);
                }
        }
}

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
 * Error thrown when an invalid purpose code is requested.
 *
 * @remarks
 * This error is thrown when `getPurposeCode` is called with an unsupported purpose string.
 *
 * @public
 */
export class InvalidPurposeCodeError extends UmbraWalletError {
        /**
         * Creates a new instance of InvalidPurposeCodeError.
         *
         * @param purpose - The invalid purpose string that was provided
         * @param cause - Optional underlying error that caused the error
         */
        public constructor(purpose: string, cause?: Error) {
                super(
                        `Invalid purpose code: "${purpose}". Supported purposes are: claim_spl_deposit_with_hidden_amount, claim_spl_deposit_with_public_amount, create_spl_deposit_with_hidden_amount, create_spl_deposit_with_public_amount`,
                        cause
                );
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
         * The signer instance used for cryptographic operations and transaction signing.
         */
        public readonly signer: ISigner;

        /**
         * The X25519 public key derived from the master signature seed.
         *
         * @remarks
         * This public key is used for establishing Rescue cipher shared secrets with other parties.
         * It can be shared publicly to enable encrypted communication.
         */
        public readonly arciumX25519PublicKey: ArciumX25519PublicKey;

        /**
         * Cache of Rescue ciphers keyed by X25519 public keys.
         *
         * @remarks
         * This map caches Rescue cipher instances to avoid recreating them for the same public key.
         * The cipher for the MXE (Multi-Execution Environment) public key is automatically
         * created during wallet initialization.
         */
        public readonly rescueCiphers: Map<ArciumX25519PublicKey, RescueCipher>;

        /**
         * The master viewing key derived from the master signature seed.
         *
         * @remarks
         * This 128-bit key is used for compliance and transaction linking in the Umbra protocol.
         * It enables authorized parties to link transactions while maintaining privacy for others.
         */
        public readonly masterViewingKey: U128;

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
        public readonly getRescueCipherForPublicKey: (
                publicKey: ArciumX25519PublicKey
        ) => RescueCipher;

        /**
         * Private constructor for creating UmbraWallet instances.
         *
         * @param signer - The signer instance to use for operations
         * @param arciumX25519PublicKey - The derived X25519 public key
         * @param getRescueCipherForPublicKey - Function to create Rescue ciphers
         * @param masterViewingKey - The derived master viewing key
         *
         * @remarks
         * This constructor is private. Use the static factory method `fromSigner` to create instances.
         */
        private constructor(
                signer: ISigner,
                arciumX25519PublicKey: ArciumX25519PublicKey,
                getRescueCipherForPublicKey: (publicKey: ArciumX25519PublicKey) => RescueCipher,
                masterViewingKey: U128
        ) {
                this.signer = signer;
                this.arciumX25519PublicKey = arciumX25519PublicKey;
                this.rescueCiphers = new Map();
                this.getRescueCipherForPublicKey = getRescueCipherForPublicKey;

                this.rescueCiphers.set(
                        MXE_ARCIUM_X25519_PUBLIC_KEY,
                        this.getRescueCipherForPublicKey(MXE_ARCIUM_X25519_PUBLIC_KEY)
                );
                this.masterViewingKey = masterViewingKey;
        }

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
         * const wallet = await UmbraWallet.fromSigner(signer);
         * console.log(`Wallet public key: ${wallet.arciumX25519PublicKey}`);
         * console.log(`Master viewing key: ${wallet.masterViewingKey}`);
         * ```
         */
        public static async fromSigner(signer: ISigner): Promise<UmbraWallet> {
                try {
                        const masterSignatureSeed =
                                await signer.signMessage(DEFAULT_SIGNING_MESSAGE);
                        const { x25519PrivateKey, x25519PublicKey } =
                                this.createX25519KeypairFromMasterSignatureSeed(
                                        masterSignatureSeed
                                );
                        const masterViewingKey =
                                this.generateMasterViewingKeyFromMasterSignatureSeed(
                                        masterSignatureSeed
                                );

                        const getRescueCipherForPublicKey = (publicKey: ArciumX25519PublicKey) => {
                                const rescueCipher = RescueCipher.fromX25519Pair(
                                        x25519PrivateKey,
                                        publicKey
                                );
                                return rescueCipher;
                        };

                        return new UmbraWallet(
                                signer,
                                x25519PublicKey,
                                getRescueCipherForPublicKey,
                                masterViewingKey
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
        public static createX25519KeypairFromMasterSignatureSeed(masterSignatureSeed: Uint8Array): {
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
        public static generateMasterViewingKeyFromMasterSignatureSeed(
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

        /**
         * Gets the purpose code for a given transaction purpose string.
         *
         * @param purpose - The transaction purpose string
         * @returns The corresponding purpose code as a U128
         *
         * @throws {@link InvalidPurposeCodeError} When the purpose string is not supported
         *
         * @remarks
         * Purpose codes are used to identify different types of transactions in the Umbra protocol.
         * Supported purposes:
         * - `claim_spl_deposit_with_hidden_amount` → 0
         * - `claim_spl_deposit_with_public_amount` → 1
         * - `create_spl_deposit_with_hidden_amount` → 2
         * - `create_spl_deposit_with_public_amount` → 3
         *
         * Purpose codes are included in linker hash generation to ensure different transaction
         * types produce different hashes even with the same timestamp.
         *
         * @example
         * ```typescript
         * const purposeCode = UmbraWallet.getPurposeCode('create_spl_deposit_with_hidden_amount');
         * // Returns 2n
         * ```
         */
        public static getPurposeCode(purpose: string): U128 {
                const PURPOSE_CODES_MAPPER: Map<string, U128> = new Map([
                        ['claim_spl_deposit_with_hidden_amount', 0n as U128],
                        ['claim_spl_deposit_with_public_amount', 1n as U128],
                        ['create_spl_deposit_with_hidden_amount', 2n as U128],
                        ['create_spl_deposit_with_public_amount', 3n as U128],
                ]);

                const purposeCode = PURPOSE_CODES_MAPPER.get(purpose);
                if (purposeCode === undefined) {
                        throw new InvalidPurposeCodeError(purpose);
                }
                return purposeCode;
        }

        /**
         * Generates a linker hash for transaction privacy and compliance.
         *
         * @param purpose - The transaction purpose (determines the purpose code)
         * @param year - Transaction year
         * @param month - Transaction month
         * @param day - Transaction day
         * @param hour - Transaction hour
         * @param minute - Transaction minute
         * @param second - Transaction second
         * @returns A 32-byte Poseidon hash that links transactions with the same parameters
         *
         * @throws {@link InvalidPurposeCodeError} When the purpose string is not supported
         * @throws {@link PoseidonHasherError} When Poseidon hashing fails
         *
         * @remarks
         * The linker hash is computed using Poseidon over:
         * - Master viewing key (for user identification)
         * - Purpose code (for transaction type)
         * - Timestamp components (year, month, day, hour, minute, second)
         *
         * This hash enables:
         * - **Privacy**: Different transactions produce different hashes
         * - **Compliance**: Authorized parties can link transactions with the same parameters
         * - **Uniqueness**: Each unique combination of parameters produces a unique hash
         *
         * The hash is deterministic - the same inputs will always produce the same hash,
         * allowing for transaction linking while maintaining privacy for unrelated transactions.
         *
         * @example
         * ```typescript
         * const linkerHash = wallet.generateLinkerHash(
         *   'create_spl_deposit_with_hidden_amount',
         *   2024n, 1n, 15n, 10n, 30n, 0n
         * );
         * // Returns a 32-byte PoseidonHash
         * ```
         */
        public generateLinkerHash(
                purpose:
                        | 'claim_spl_deposit_with_hidden_amount'
                        | 'claim_spl_deposit_with_public_amount'
                        | 'create_spl_deposit_with_hidden_amount'
                        | 'create_spl_deposit_with_public_amount',
                year: Year,
                month: Month,
                day: Day,
                hour: Hour,
                minute: Minute,
                second: Second
        ): PoseidonHash {
                const purposeCode = UmbraWallet.getPurposeCode(purpose);
                return PoseidonHasher.hash([
                        this.masterViewingKey,
                        purposeCode,
                        year,
                        month,
                        day,
                        hour,
                        minute,
                        second,
                ]);
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
        public async signMessage(message: Bytes): Promise<SolanaSignature> {
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
        public async signTransaction(
                transaction: VersionedTransaction
        ): Promise<VersionedTransaction> {
                const signedTransaction = await this.signer.signTransaction(transaction);
                return signedTransaction;
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
        public async signTransactions(
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
        public addEncryptorForPublicKey(publicKey: ArciumX25519PublicKey): void {
                this.rescueCiphers.set(publicKey, this.getRescueCipherForPublicKey(publicKey));
        }
}
