import { UmbraWallet, UmbraWalletError } from '@/client/umbra-wallet';
import { ITransactionForwarder, ISigner, IZkProver, IIndexer } from '@/client/interface';
import {
        AccountOffset,
        Amount,
        ArciumX25519Nonce,
        ArciumX25519PublicKey,
        ArciumX25519SecretKey,
        BasisPoints,
        Day,
        Hour,
        InstructionSeed,
        MintAddress,
        Minute,
        Month,
        NumberOfTransactions,
        PoseidonHash,
        RescueCiphertext,
        RiskThreshold,
        Second,
        Sha3Hash,
        SolanaAddress,
        SolanaTransactionSignature,
        Time,
        U128,
        U256,
        U256BeBytes,
        U256LeBytes,
        U64,
        Year,
        Groth16ProofABeBytes,
        Groth16ProofBBeBytes,
        Groth16ProofCBeBytes,
        U8,
        U16,
} from '@/types';
import { ConnectionBasedForwarder } from '@/client/implementation/connection-based-forwarder';
import {
        Connection,
        Keypair,
        TransactionInstruction,
        TransactionMessage,
        VersionedTransaction,
} from '@solana/web3.js';
import { RelayerForwarder } from '@/client/implementation/relayer-forwarder';
import { Umbra } from '@/idl';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import idl from '@/idl/idl.json';
import {
        getArciumEncryptedTokenAccountPda,
        getArciumEncryptedUserAccountPda,
} from '@/utils/pda-generators';
import {
        breakPublicKeyIntoTwoParts,
        generateRandomBlindingFactor,
        generateRandomU256,
        getSiblingMerkleIndicesFromInsertionIndex,
        isBitSet,
} from '@/utils/miscellaneous';
import {
        buildInitialiseArciumEncryptedTokenAccountInstruction,
        buildInitialiseArciumEncryptedUserAccountInstruction,
} from './instruction-builders/account-initialisation';
import {
        buildConvertUserAccountFromMxeToSharedInstruction,
        buildUpdateMasterViewingKeyInstruction,
} from './instruction-builders/conversion';
import { MXE_ARCIUM_X25519_PUBLIC_KEY } from '@/constants';
import { sha3_256 } from '@noble/hashes/sha3.js';
import {
        convertU128ToBeBytes,
        convertU128ToLeBytes,
        convertU256ToLeBytes,
} from '@/utils/convertors';
import { aggregateSha3HashIntoSinglePoseidonRoot, PoseidonHasher } from '@/utils/hasher';
import { WasmZkProver, WasmZkProverConfig } from '@/client/implementation/wasm-zk-prover';
import {
        buildDepositIntoMixerSolInstruction,
        buildDepositIntoMixerPoolSplInstruction,
        buildNewTokenDepositMxeInstruction,
        buildExistingTokenDepositSharedInstruction,
        buildExistingTokenDepositMxeInstruction,
        buildNewTokenDepositSharedInstruction,
} from './instruction-builders/deposit';
import {
        ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE,
        ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_ARCIUM_BALANCE_INITIALISED,
        ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED,
        ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED,
        ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE,
        ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED,
        ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED,
        ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_REQUIRES_SOL_DEPOSIT,
        ARCIUM_ENCRYPTED_USER_ACCOUNT_FOR_HAS_REGISTERED_MASTER_VIEWING_KEY,
        INDEXER_BASE_URL,
        WSOL_MINT_ADDRESS,
} from '@/constants/anchor';
import {
        buildInitialiseMasterWalletSpecifierInstruction,
        buildInitialiseMixerPoolInstruction,
        buildInitialiseProgramInformationInstruction,
        buildInitialiseWalletSpecifierInstruction,
        buildInitialiseZkMerkleTreeInstruction,
} from './instruction-builders/global';
import {
        buildInitialiseRelayerAccountInstruction,
        buildInitialiseRelayerFeesPoolInstruction,
} from './instruction-builders/relayer';
import { buildInitialisePublicCommissionFeesPoolInstruction } from './instruction-builders/fees';
import { kmac256 } from '@noble/hashes/sha3-addons.js';
import { x25519 } from '@noble/curves/ed25519.js';
import { RescueCipher } from '@/client/implementation';
import { AwsIndexer } from '@/client/implementation/aws-indexer';
import {
        buildExistingTokenTransferSolMxeInstruction,
        buildExistingTokenTransferSolSharedInstruction,
        buildExistingTokenTransferSplMxeInstruction,
        buildExistingTokenTransferSplSharedInstruction,
        buildNewTokenTransferSolMxeInstruction,
        buildNewTokenTransferSolSharedInstruction,
        buildNewTokenTransferSplMxeInstruction,
        buildNewTokenTransferSplSharedInstruction,
} from '@/client/instruction-builders/transfer';
import {
        buildWithdrawFromMixerMxeInstruction,
        buildWithdrawFromMixerSharedInstruction,
        buildWithdrawIntoMixerPoolSolInstruction,
        buildWithdrawIntoMixerPoolSplInstruction,
} from '@/client/instruction-builders/withdraw';

const ZERO_SHA3_HASH = new Uint8Array(32) as Sha3Hash;

/**
 * Options for public deposit methods into the mixer pool.
 */
export interface DepositPubliclyOptions {
        /** Optional index used to derive random secret and nullifier. If not provided, a random index is generated. */
        index?: U256;
        /** Optional public key of the relayer that will process and pay for the transaction. If not provided, a random relayer is selected automatically. */
        relayerPublicKey?: SolanaAddress;
        /** Transaction handling mode. Defaults to 'connection' for public deposits. */
        mode?: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw';
}

/**
 * Structured result for public deposit calls.
 */
export interface DepositPubliclyResult<TTxData> {
        /** The nullifier index used to derive random secret and nullifier. */
        generationIndex: U256;
        /** Relayer used (either provided or randomly selected). */
        relayerPublicKey: SolanaAddress;
        /** Net claimable balance after fees. */
        claimableBalance: Amount;
        /** Mode-dependent transaction data (signature, forwarded result, or prepared/signed tx). */
        txReturnedData: TTxData;
}

/**
 * Options for confidential deposit methods into the mixer pool.
 */
export interface DepositConfidentiallyOptions {
        /** Optional index used to derive random secret and nullifier. If not provided, a random index is generated. */
        index?: U256;
        /** Optional public key of the relayer that will process and pay for the transaction. If not provided, a random relayer is selected automatically. */
        relayerPublicKey?: SolanaAddress;
        /** Optional SHA3 hash for additional data. If not provided, a zero hash is used. */
        optionalData?: Sha3Hash;
        /** Transaction handling mode. Defaults to 'relayer' for confidential deposits. */
        mode?: 'relayer' | 'prepared' | 'signed' | 'raw';
}

/**
 * Options for confidential transfer methods.
 */
export interface TransferConfidentiallyOptions {
        /** Optional public key of the relayer that will process and pay for the transaction. If not provided, a random relayer is selected automatically. */
        relayerPublicKey?: SolanaAddress;
        /** Optional SHA3 hash for additional data. If not provided, a zero hash is used. */
        optionalData?: Sha3Hash;
        /** Transaction handling mode. Defaults to 'relayer' for confidential transfers. */
        mode?: 'relayer' | 'prepared' | 'signed' | 'raw';
}

/**
 * Artifacts required for claiming a deposit from the mixer pool.
 */
export interface ClaimDepositArtifacts {
        /** The index in the Merkle tree where the commitment was inserted. */
        commitmentInsertionIndex: U64;
        /** The public key of the relayer that will process and pay for the transaction. */
        relayerPublicKey: SolanaAddress;
        /** The generation index used to derive cryptographic values (random secret, nullifier). */
        generationIndex: U256;
        /** The timestamp when the original deposit was made (used for linker hash generation). */
        time: Time;
        /** The claimable balance of the deposit. */
        claimableBalance: Amount;
}

/**
 * Options for claiming deposits from the mixer pool.
 */
export interface ClaimDepositOptions {
        /** Optional SHA3 hash for additional data. If not provided, a zero hash is used. */
        optionalData?: Sha3Hash;
        /** Transaction handling mode. Defaults to 'relayer' for claim operations. */
        mode?: 'relayer' | 'prepared' | 'signed' | 'raw';
}

/**
 * Structured result for confidential deposit calls.
 */
export interface DepositConfidentiallyResult<TTxData> {
        /** The generation index used to derive cryptographic values (random secret, nullifier). */
        generationIndex: U256;
        /** Relayer used (either provided or randomly selected). */
        relayerPublicKey: SolanaAddress;
        /** Net claimable balance after relayer + commission fees. */
        claimableBalance: Amount;
        /** Mode-dependent transaction data (signature or prepared/signed transaction). */
        txReturnedData: TTxData;
}

/**
 * Error thrown when adding an Umbra wallet to the client fails.
 *
 * @remarks
 * This error is thrown when adding a wallet fails due to wallet creation errors,
 * invalid signer, or other wallet-related issues.
 *
 * @public
 */
export class UmbraWalletAdditionError extends Error {
        /**
         * Creates a new instance of UmbraWalletAdditionError.
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
 * Generic error type for high-level Umbra client operations.
 *
 * @public
 */
export class UmbraClientError extends Error {
        public constructor(message: string) {
                super(message);
                this.name = this.constructor.name;

                if (Error.captureStackTrace) {
                        Error.captureStackTrace(this, this.constructor);
                }
        }
}

/**
 * High-level client for interacting with the Umbra Privacy protocol smart contracts.
 *
 * @remarks
 * The `UmbraClient` provides a simplified, user-friendly interface for interacting with
 * the Umbra Privacy protocol without requiring any knowledge of the underlying architecture,
 * cryptographic primitives, or implementation details. It abstracts away the complexity of:
 * - Key derivation and management
 * - Transaction construction and signing
 * - Zero-knowledge proof generation
 * - Rescue cipher encryption/decryption
 * - Transaction forwarding and confirmation
 * - Network connectivity and RPC management
 *
 * **Connection Requirement:**
 * **It is absolutely necessary to provide a connection** (via RPC URL, Connection instance, or
 * ConnectionBasedForwarder) when creating the client. All on-chain data operations depend on this connection:
 * - Fetching account data from the blockchain
 * - Reading program state and account information
 * - Sending transactions to the network
 * - Confirming transaction status
 * - Querying transaction history
 *
 * Without a valid connection, the client cannot interact with the Umbra Privacy protocol on-chain.
 *
 * **Key Features:**
 * - **Simplified API**: Interact with Umbra Privacy smart contracts using high-level methods
 * - **Automatic Management**: Handles wallet creation, key derivation, and cipher management automatically
 * - **Flexible Forwarding**: Supports multiple transaction forwarding strategies (direct RPC, relayer services)
 * - **Type Safety**: Full TypeScript support with branded types for enhanced safety
 * - **Error Handling**: Comprehensive error types for better debugging and error recovery
 *
 * **Architecture Abstraction:**
 * The client manages all the complex components internally:
 * - **UmbraWallets**: Cryptographic wallets that handle key derivation, signing, and encryption
 * - **Transaction Forwarders**: Components that submit transactions to the network with various strategies
 * - **Connection Management**: Handles Solana network connectivity and RPC interactions
 *
 * Users can focus on their application logic while the client handles all protocol-specific
 * operations behind the scenes.
 *
 * @typeParam T - The return type for transaction forwarding operations (defaults to `SolanaTransactionSignature`)
 *
 * @public
 *
 * @example
 * ```typescript
 * // Create client from RPC URL (simplest approach)
 * const client = UmbraClient.create('https://api.mainnet-beta.solana.com');
 *
 * // Create client from Connection instance
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const client = UmbraClient.create(connection);
 *
 * // Create client from existing forwarder
 * const forwarder = ConnectionBasedForwarder.fromRpcUrl('https://api.mainnet-beta.solana.com');
 * const client = UmbraClient.create(forwarder);
 *
 * // Access managed components
 * const wallet = client.umbraWallet;
 * const forwarderInstance = client.txForwarder;
 * const connectionForwarder = client.connectionBasedForwarder;
 * ```
 */
export class UmbraClient<T = SolanaTransactionSignature> {
        /**
         * Optional Umbra wallet managed by this client.
         *
         * @remarks
         * The wallet provides cryptographic operations, transaction signing, and encryption
         * capabilities. Wallets are created from signers and handle all key derivation
         * and cipher management internally.
         */
        public umbraWallet: UmbraWallet | undefined;

        /**
         * Optional transaction forwarder managed by this client.
         *
         * @remarks
         * The transaction forwarder handles submitting signed transactions to the network.
         * Different forwarders can use different strategies (direct RPC, relayer services, etc.).
         * The generic type `T` determines the return type of forwarding operations.
         */
        public txForwarder: ITransactionForwarder<T> | undefined;

        /**
         * Optional zero-knowledge prover used for generating Groth16 proofs (e.g. for
         * master viewing key registration).
         *
         * @remarks
         * This prover is not required for basic client functionality, but methods that
         * involve anonymity features or on-chain proof verification (such as
         * `registerAccountForAnonymity`) will throw an {@link UmbraClientError} if it
         * has not been configured.
         */
        public zkProver: IZkProver | undefined;

        /**
         * The connection-based transaction forwarder for direct RPC submission.
         *
         * @remarks
         * This forwarder uses a Solana Connection to submit transactions directly to the network.
         * It supports sequential transaction forwarding with confirmation, delays, and offset-based
         * resumption. This is the primary forwarder created during client initialization.
         */
        public readonly connectionBasedForwarder: ConnectionBasedForwarder;
        /**
         * Configured indexer implementation used for fetching Merkle proofs and other
         * off-chain data needed to construct ZK transactions.
         */
        public readonly indexer: IIndexer;
        /**
         * Anchor `Program` instance wired to the Umbra IDL, scoped to the connection
         * provided at construction time. All program account fetches/decodes go through it.
         */
        public readonly program: Program<Umbra>;

        private constructor(
                umbraWallet: UmbraWallet | undefined,
                connectionBasedForwarder: ConnectionBasedForwarder,
                program: Program<Umbra>,
                indexer: IIndexer,
                zkProver?: IZkProver
        ) {
                this.umbraWallet = umbraWallet;
                this.connectionBasedForwarder = connectionBasedForwarder;
                this.program = program;
                this.txForwarder = undefined;
                this.zkProver = zkProver;
                this.indexer = indexer;
        }

        /**
         * Configures the zero-knowledge prover used by this client.
         *
         * @remarks
         * This method supports two configuration styles:
         *
         * - Pass an existing {@link IZkProver} instance:
         *   ```typescript
         *   const prover = new WasmZkProver({ masterViewingKeyRegistration: true });
         *   client.setZkProver(prover);
         *   ```
         *
         * - Use the `'wasm'` shorthand to construct a {@link WasmZkProver}:
         *   ```typescript
         *   client.setZkProver('wasm', {
         *     masterViewingKeyRegistration: true,
         *     createSplDepositWithHiddenAmount: true,
         *   });
         *   ```
         *
         * Methods that rely on ZK proof generation (such as {@link registerAccountForAnonymity})
         * will throw an {@link UmbraClientError} if a prover has not been configured.
         */
        public setZkProver(prover: IZkProver): void;
        public setZkProver(type: 'wasm', config: WasmZkProverConfig): void;
        public setZkProver(arg1: IZkProver | 'wasm', arg2?: WasmZkProverConfig): void {
                if (arg1 === 'wasm') {
                        if (!arg2) {
                                throw new UmbraClientError(
                                        'Wasm ZK prover configuration is required when using the "wasm" shorthand'
                                );
                        }
                        this.zkProver = new WasmZkProver(arg2);
                        return;
                }

                this.zkProver = arg1;
        }

        /**
         * Creates an UmbraClient from a ConnectionBasedForwarder instance.
         *
         * @param connectionBasedForwarder - An existing ConnectionBasedForwarder instance that contains a Solana Connection
         * @param indexerOrSpecifier - Optional indexer instance or `'aws'` to auto-configure the default AWS indexer.
         * @returns A new UmbraClient instance
         *
         * @remarks
         * Use this overload when you already have a configured ConnectionBasedForwarder instance
         * and want to reuse it. This is useful when you need fine-grained control over the
         * connection configuration or want to share a forwarder across multiple clients.
         *
         * **Connection Requirement:**
         * The ConnectionBasedForwarder must contain a valid Solana Connection, as all on-chain
         * data fetching and transaction sending operations will use this connection.
         */
        public static create(
                connectionBasedForwarder: ConnectionBasedForwarder,
                indexerOrSpecifier?: IIndexer | 'aws'
        ): UmbraClient;

        /**
         * Creates an UmbraClient from a Solana Connection instance.
         *
         * @param connection - The Solana Connection instance to use for all on-chain operations
         * @param indexerOrSpecifier - Optional indexer instance or `'aws'` to auto-configure the default AWS indexer.
         * @returns A new UmbraClient instance
         *
         * @remarks
         * Use this overload when you already have a Connection instance configured with your
         * desired RPC endpoint, commitment level, or other connection settings. The client
         * will create a ConnectionBasedForwarder internally using this connection.
         *
         * **Connection Requirement:**
         * This connection is absolutely necessary and will be used for:
         * - Fetching on-chain account data and program state
         * - Sending transactions to the network
         * - Confirming transaction status
         * - All other blockchain interactions
         *
         * @example
         * ```typescript
         * const connection = new Connection('https://api.mainnet-beta.solana.com', {
         *   commitment: 'confirmed'
         * });
         * const client = UmbraClient.create(connection);
         * ```
         */
        public static create(
                connection: Connection,
                indexerOrSpecifier?: IIndexer | 'aws'
        ): UmbraClient;

        /**
         * Creates an UmbraClient from an RPC URL.
         *
         * @param rpcUrl - The RPC endpoint URL (e.g., 'https://api.mainnet-beta.solana.com')
         * @param indexerOrSpecifier - Optional indexer instance or `'aws'` to auto-configure the default AWS indexer.
         * @returns A new UmbraClient instance
         *
         * @remarks
         * This is the simplest way to create an UmbraClient. Just provide an RPC endpoint URL
         * and the client will handle all connection setup internally. This is recommended for
         * most use cases where you don't need custom connection configuration.
         *
         * **Connection Requirement:**
         * The RPC URL is absolutely necessary and will be used to create a Solana Connection
         * that handles all on-chain operations:
         * - Fetching account data and program state from the blockchain
         * - Sending transactions to the network
         * - Confirming transaction status
         * - Querying transaction history and account information
         *
         * The client will automatically:
         * - Create a Connection instance with the provided RPC URL
         * - Create a ConnectionBasedForwarder for transaction submission
         * - Initialize without an Umbra wallet (to be added later via `addUmbraWallet`)
         *
         * @example
         * ```typescript
         * // Mainnet
         * const client = UmbraClient.create('https://api.mainnet-beta.solana.com');
         *
         * // Devnet
         * const client = UmbraClient.create('https://api.devnet.solana.com');
         *
         * // Custom RPC
         * const client = UmbraClient.create('https://your-rpc-endpoint.com');
         * ```
         */
        public static create(rpcUrl: string, indexerOrSpecifier?: IIndexer | 'aws'): UmbraClient;

        /**
         * Implementation of create that handles all overloads.
         *
         * @internal
         */
        public static create(
                connectionOrForwarderOrRpcUrl: Connection | ConnectionBasedForwarder | string,
                indexerOrSpecifier?: IIndexer | 'aws'
        ): UmbraClient {
                let connectionBasedForwarder: ConnectionBasedForwarder;

                if (typeof connectionOrForwarderOrRpcUrl === 'string') {
                        // RPC URL
                        connectionBasedForwarder = ConnectionBasedForwarder.fromRpcUrl(
                                connectionOrForwarderOrRpcUrl
                        );
                } else if (connectionOrForwarderOrRpcUrl instanceof ConnectionBasedForwarder) {
                        // ConnectionBasedForwarder instance
                        connectionBasedForwarder = connectionOrForwarderOrRpcUrl;
                } else {
                        // Connection instance
                        connectionBasedForwarder = ConnectionBasedForwarder.fromConnection(
                                connectionOrForwarderOrRpcUrl
                        );
                }

                // Create Anchor Provider and Program using the underlying connection
                const connection = connectionBasedForwarder.getConnection();
                const randomKeypair = Keypair.generate();
                const wallet = new Wallet(randomKeypair);
                const provider = new AnchorProvider(connection, wallet);
                const program = new Program<Umbra>(idl as Umbra, provider);

                const resolvedIndexer = UmbraClient.resolveIndexer(indexerOrSpecifier);

                return new UmbraClient(
                        undefined,
                        connectionBasedForwarder,
                        program,
                        resolvedIndexer
                );
        }

        private static resolveIndexer(indexerOrSpecifier?: IIndexer | 'aws'): IIndexer {
                if (!indexerOrSpecifier || indexerOrSpecifier === 'aws') {
                        return AwsIndexer.fromBaseUrl(INDEXER_BASE_URL);
                }

                return indexerOrSpecifier;
        }

        /**
         * Sets the Umbra wallet on the client from an existing UmbraWallet instance.
         *
         * @param umbraWallet - An existing UmbraWallet instance to set on the client
         * @returns A promise that resolves when the wallet is successfully set
         *
         * @throws {@link UmbraWalletAdditionError} When the wallet is null, undefined, or invalid
         *
         * @remarks
         * Use this overload when you already have a created UmbraWallet instance and want to
         * associate it with the client. This is useful when you've created the wallet separately
         * and want to manage it through the client.
         *
         * **Wallet Management:**
         * Once added, the wallet is stored in the client's `umbraWallet` field and can be
         * accessed for cryptographic operations, transaction signing, and encryption.
         *
         * @example
         * ```typescript
         * // Create wallet separately
         * const wallet = await UmbraWallet.fromSigner(signer);
         *
         * // Set on client
         * await client.setUmbraWallet(wallet);
         * ```
         */
        public async setUmbraWallet(umbraWallet: UmbraWallet): Promise<void>;

        /**
         * Sets the Umbra wallet on the client by creating it from an ISigner.
         *
         * @param signer - An ISigner instance to create the UmbraWallet from
         * @returns A promise that resolves when the wallet is successfully created and set
         *
         * @throws {@link UmbraWalletAdditionError} When wallet creation fails due to signer errors, key derivation failures, or initialization issues
         *
         * @remarks
         * Use this overload when you have a signer and want the client to automatically create
         * the UmbraWallet for you and associate it with the client. This is the most convenient
         * approach as it handles all wallet initialization internally.
         *
         * **Wallet Creation Process:**
         * The wallet is created using `UmbraWallet.fromSigner`, which:
         * - Signs a default message to obtain a master signature seed
         * - Derives X25519 key pair for Rescue cipher operations
         * - Generates master viewing key for compliance and transaction linking
         * - Initializes Rescue ciphers for encryption/decryption
         *
         * **Signer Requirements:**
         * The signer must be fully initialized and capable of signing messages. If the signer
         * is unavailable or fails to sign, a `UmbraWalletAdditionError` will be thrown.
         *
         * @example
         * ```typescript
         * // Create wallet from signer directly and set on client
         * await client.setUmbraWallet(signer);
         *
         * // Access the created wallet
         * const wallet = client.umbraWallet;
         * ```
         */
        public async setUmbraWallet(signer: ISigner): Promise<void>;

        /**
         * Implementation of setUmbraWallet that handles all overloads.
         *
         * @internal
         */
        public async setUmbraWallet(umbraWalletOrSigner: UmbraWallet | ISigner): Promise<void> {
                try {
                        let wallet: UmbraWallet;

                        if (umbraWalletOrSigner instanceof UmbraWallet) {
                                // Direct UmbraWallet instance
                                if (!umbraWalletOrSigner) {
                                        throw new UmbraWalletAdditionError(
                                                'UmbraWallet instance cannot be null or undefined'
                                        );
                                }
                                wallet = umbraWalletOrSigner;
                        } else {
                                // ISigner instance - create wallet from signer
                                if (!umbraWalletOrSigner) {
                                        throw new UmbraWalletAdditionError(
                                                'ISigner instance cannot be null or undefined'
                                        );
                                }

                                try {
                                        wallet = await UmbraWallet.fromSigner(umbraWalletOrSigner);
                                } catch (error) {
                                        if (error instanceof UmbraWalletError) {
                                                throw new UmbraWalletAdditionError(
                                                        `Failed to create UmbraWallet from signer: ${error.message}`,
                                                        error
                                                );
                                        }
                                        throw new UmbraWalletAdditionError(
                                                `Failed to create UmbraWallet from signer: ${error instanceof Error ? error.message : String(error)}`,
                                                error instanceof Error ? error : undefined
                                        );
                                }
                        }

                        this.umbraWallet = wallet;
                } catch (error) {
                        if (error instanceof UmbraWalletAdditionError) {
                                throw error;
                        }
                        throw new UmbraWalletAdditionError(
                                `Failed to add Umbra wallet: ${error instanceof Error ? error.message : String(error)}`,
                                error instanceof Error ? error : undefined
                        );
                }
        }

        public static getRelayerForwarder(relayerPublicKey: SolanaAddress): RelayerForwarder {
                return RelayerForwarder.fromPublicKey(relayerPublicKey);
        }

        /**
         * Creates a relayer-based transaction forwarder using a randomly selected relayer.
         *
         * @remarks
         * This method delegates to `RelayerForwarder.getRandomRelayerForwarder`, which queries
         * the Umbra relayer discovery service to obtain a suitable relayer public key.
         *
         * @returns A promise resolving to a `RelayerForwarder` instance.
         */
        public static getRandomRelayerForwarder(): Promise<RelayerForwarder> {
                return RelayerForwarder.getRandomRelayerForwarder();
        }

        /**
         * Registers the user's Umbra account for confidentiality, with flexible control over
         * how the resulting transaction is signed and forwarded.
         *
         * @remarks
         * This high-level method constructs the correct set of instructions to:
         * - Initialise the Arcium-encrypted user account (if not already initialised)
         * - Validate that the account is active (if already initialised)
         * - Convert the account from MXE-encrypted form to shared form (if required),
         *   using the client's Umbra wallet X25519 public key.
         *
         * It then optionally:
         * - Populates fee payer and recent blockhash, and/or
         * - Signs with the client's `umbraWallet`, and/or
         * - Forwards via either the `connectionBasedForwarder` or the configured `txForwarder`.
         *
         * The behavior is controlled by the `mode` option:
         *
         * - **Default / `'connection'` (recommended for most users)**
         *   Signs the transaction with the client's `umbraWallet` and sends it via
         *   `connectionBasedForwarder`, returning a `SolanaTransactionSignature`.
         *
         * - **`'forwarder'`**
         *   Signs with the client's `umbraWallet` and forwards via `txForwarder`, returning the
         *   generic type `T`. This is useful when using a relayer or custom forwarding strategy.
         *
         * - **`'signed'`**
         *   Signs with the client's `umbraWallet` and returns the signed `VersionedTransaction`
         *   without sending it. Use this when you want to control submission yourself.
         *
         * - **`'prepared'`**
         *   Returns an unsigned `VersionedTransaction` with fee payer and recent blockhash
         *   populated. Use this when the signing key is external (e.g. hardware wallet, mobile
         *   signer) but you still want the client to prepare the transaction.
         *
         * - **`'raw'`**
         *   Returns an unsigned `VersionedTransaction` built only from the instructions, with a
         *   placeholder blockhash. No real fee payer / blockhash setup is performed, and the
         *   caller is expected to update the message before signing and sending.
         *
         * In all modes, an Umbra wallet **must** be set on the client via {@link setUmbraWallet}.
         *
         * @example
         * ```typescript
         * // 1. Simple usage: sign and send via connectionBasedForwarder
         * const client = UmbraClient.create('https://api.mainnet-beta.solana.com');
         * await client.setUmbraWallet(signer);
         *
         * const optionalData: Sha3Hash = /* application-specific data *\/;
         * const signature = await client.registerAccountForConfidentiality(optionalData);
         * console.log('Transaction sent, signature:', signature);
         * ```
         *
         * @example
         * ```typescript
         * // 2. Forward via a relayer / custom forwarder (generic T)
         * type ForwardResponse = { signature: string; slot: number };
         *
         * const client = UmbraClient<ForwardResponse>.create(connection);
         * client.txForwarder = await UmbraClient.getRandomRelayerForwarder();
         * await client.setUmbraWallet(signer);
         *
         * const res = await client.registerAccountForConfidentiality(optionalData, {
         *   mode: 'forwarder',
         * });
         * console.log('Forwarder response:', res.signature, 'at slot', res.slot);
         * ```
         *
         * @example
         * ```typescript
         * // 3. Get a signed transaction but submit it manually
         * const signedTx = await client.registerAccountForConfidentiality(optionalData, {
         *   mode: 'signed',
         * });
         *
         * // Send via a different connection or RPC strategy
         * const rawSig = await someSolanaConnection.sendTransaction(signedTx);
         * ```
         *
         * @example
         * ```typescript
         * // 4. Prepare an unsigned transaction for an external signer
         * const preparedTx = await client.registerAccountForConfidentiality(optionalData, {
         *   mode: 'prepared',
         * });
         *
         * // Hand off to an external signer (e.g. hardware wallet)
         * const externallySigned = await externalSigner.signTransaction(preparedTx);
         * const sig = await someSolanaConnection.sendTransaction(externallySigned);
         * ```
         *
         * @example
         * ```typescript
         * // 5. Build a raw transaction and fully customize it yourself
         * const rawTx = await client.registerAccountForConfidentiality(optionalData, {
         *   mode: 'raw',
         * });
         *
         * // Replace blockhash / fee payer and then sign + send using your own logic
         * ```
         */
        public async registerAccountForConfidentiality(
                optionalData: Sha3Hash
        ): Promise<SolanaTransactionSignature>;
        public async registerAccountForConfidentiality(
                optionalData: Sha3Hash,
                opts: { mode: 'connection' }
        ): Promise<SolanaTransactionSignature>;
        public async registerAccountForConfidentiality(
                optionalData: Sha3Hash,
                opts: { mode: 'forwarder' }
        ): Promise<T>;
        public async registerAccountForConfidentiality(
                optionalData: Sha3Hash,
                opts: { mode: 'signed' }
        ): Promise<VersionedTransaction>;
        public async registerAccountForConfidentiality(
                optionalData: Sha3Hash,
                opts: { mode: 'prepared' }
        ): Promise<VersionedTransaction>;
        public async registerAccountForConfidentiality(
                optionalData: Sha3Hash,
                opts: { mode: 'raw' }
        ): Promise<VersionedTransaction>;
        public async registerAccountForConfidentiality(
                optionalData: Sha3Hash,
                opts?: { mode: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw' }
        ): Promise<SolanaTransactionSignature | T | VersionedTransaction> {
                const mode = opts?.mode ?? 'connection';

                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to register account for confidentiality'
                        );
                }

                const { userPublicKey, instructions } =
                        await this.buildRegisterAccountForConfidentialityInstructions(optionalData);

                // 'raw' mode: build a transaction from instructions with a placeholder blockhash.
                if (mode === 'raw') {
                        const rawMessage = new TransactionMessage({
                                payerKey: userPublicKey,
                                // Placeholder blockhash – caller is expected to replace this.
                                recentBlockhash: '11111111111111111111111111111111',
                                instructions,
                        }).compileToV0Message();

                        return new VersionedTransaction(rawMessage);
                }

                // Modes that require a recent blockhash.
                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const preparedMessage = new TransactionMessage({
                        payerKey: userPublicKey,
                        recentBlockhash: blockhash,
                        instructions,
                }).compileToV0Message();

                const preparedTransaction = new VersionedTransaction(preparedMessage);

                if (mode === 'prepared') {
                        return preparedTransaction;
                }

                // Modes that require signing with the Umbra wallet.
                const signedTransaction =
                        await this.umbraWallet.signTransaction(preparedTransaction);

                if (mode === 'signed') {
                        return signedTransaction;
                }

                if (mode === 'forwarder') {
                        if (!this.txForwarder) {
                                throw new UmbraClientError(
                                        'No transaction forwarder configured on UmbraClient'
                                );
                        }
                        return await this.txForwarder.forwardTransaction(signedTransaction);
                }

                // Default / 'connection' mode: send via connectionBasedForwarder.
                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Internal helper that builds the instructions required to register the user's account
         * for confidentiality, based on the current on-chain account state and the provided
         * optional data.
         *
         * @internal
         */
        private async buildRegisterAccountForConfidentialityInstructions(
                optionalData: Sha3Hash
        ): Promise<{
                userPublicKey: SolanaAddress;
                instructions: Array<TransactionInstruction>;
        }> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to register account for confidentiality'
                        );
                }

                const userPublicKey = await this.umbraWallet.signer.getPublicKey();
                const userArciumEncryptedAccountPda =
                        getArciumEncryptedUserAccountPda(userPublicKey);

                let userArciumEncryptedAccountStatus = 0;
                let userArciumEncryptedAccountExists = true;

                try {
                        const userArciumEncryptedAccountData =
                                await this.program.account.arciumEncryptedUserAccount.fetch(
                                        userArciumEncryptedAccountPda
                                );
                        userArciumEncryptedAccountStatus = userArciumEncryptedAccountData.status[0];
                } catch {
                        // If the fetch fails, we treat the account as not yet initialised.
                        userArciumEncryptedAccountExists = false;
                }

                const FLAG_BIT_FOR_IS_INITIALISED = 0;
                const FLAG_BIT_FOR_IS_MXE_ENCRYPTED = 1;
                const FLAG_BIT_FOR_IS_ACTIVE = 3;

                const instructions: Array<TransactionInstruction> = [];

                if (
                        !userArciumEncryptedAccountExists ||
                        !isBitSet(userArciumEncryptedAccountStatus, FLAG_BIT_FOR_IS_INITIALISED)
                ) {
                        instructions.push(
                                await buildInitialiseArciumEncryptedUserAccountInstruction(
                                        {
                                                destinationAddress: userPublicKey,
                                                signer: userPublicKey,
                                        },
                                        {
                                                optionalData,
                                        }
                                )
                        );
                } else if (!isBitSet(userArciumEncryptedAccountStatus, FLAG_BIT_FOR_IS_ACTIVE)) {
                        throw new UmbraClientError('User account is not active');
                }

                if (
                        !userArciumEncryptedAccountExists ||
                        isBitSet(userArciumEncryptedAccountStatus, FLAG_BIT_FOR_IS_MXE_ENCRYPTED)
                ) {
                        instructions.push(
                                await buildConvertUserAccountFromMxeToSharedInstruction(
                                        {
                                                arciumSigner: userPublicKey,
                                        },
                                        {
                                                x25519PublicKey:
                                                        this.umbraWallet.arciumX25519PublicKey,
                                                optionalData,
                                        }
                                )
                        );
                }

                return { userPublicKey, instructions };
        }

        /**
         * Registers the user's Umbra account for anonymity, including master viewing key registration,
         * with flexible control over how the resulting transaction is signed and forwarded.
         *
         * @remarks
         * This high-level method constructs the correct set of instructions to:
         * - Initialise the Arcium-encrypted user account (if not already initialised)
         * - Validate that the account is active (if already initialised)
         * - Convert the account from MXE-encrypted form to shared form (if required),
         *   using the client's Umbra wallet X25519 public key
         * - Register the user's master viewing key and its blinding factors on-chain:
         *   - Compute SHA-3 and Poseidon commitments to the master viewing key
         *   - Encrypt the master viewing key and blinding factors using the MXE Rescue cipher
         *   - Generate a Groth16 proof via the configured `zkProver`
         *   - Submit an instruction to update the on-chain master viewing key state
         *
         * It then optionally:
         * - Populates fee payer and recent blockhash, and/or
         * - Signs with the client's `umbraWallet`, and/or
         * - Forwards via either the `connectionBasedForwarder` or the configured `txForwarder`.
         *
         * The behavior is controlled by the `mode` option:
         *
         * - **Default / `'connection'` (recommended for most users)**
         *   Signs the transaction with the client's `umbraWallet` and sends it via
         *   `connectionBasedForwarder`, returning a `SolanaTransactionSignature`.
         *
         * - **`'forwarder'`**
         *   Signs with the client's `umbraWallet` and forwards via `txForwarder`, returning the
         *   generic type `T`. This is useful when using a relayer or custom forwarding strategy.
         *
         * - **`'signed'`**
         *   Signs with the client's `umbraWallet` and returns the signed `VersionedTransaction`
         *   without sending it. Use this when you want to control submission yourself.
         *
         * - **`'prepared'`**
         *   Returns an unsigned `VersionedTransaction` with fee payer and recent blockhash
         *   populated. Use this when the signing key is external (e.g. hardware wallet, mobile
         *   signer) but you still want the client to prepare the transaction.
         *
         * - **`'raw'`**
         *   Returns an unsigned `VersionedTransaction` built only from the instructions, with a
         *   placeholder blockhash. No real fee payer / blockhash setup is performed, and the
         *   caller is expected to update the message before signing and sending.
         *
         * In all modes, an Umbra wallet must be set on the client via {@link setUmbraWallet},
         * and a ZK prover must be configured via `zkProver`.
         */
        public async registerAccountForAnonymity(
                optionalData: Sha3Hash
        ): Promise<SolanaTransactionSignature>;
        public async registerAccountForAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'connection' }
        ): Promise<SolanaTransactionSignature>;
        public async registerAccountForAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'forwarder' }
        ): Promise<T>;
        public async registerAccountForAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'signed' }
        ): Promise<VersionedTransaction>;
        public async registerAccountForAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'prepared' }
        ): Promise<VersionedTransaction>;
        public async registerAccountForAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'raw' }
        ): Promise<VersionedTransaction>;
        public async registerAccountForAnonymity(
                optionalData: Sha3Hash,
                opts?: { mode: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw' }
        ): Promise<SolanaTransactionSignature | T | VersionedTransaction> {
                const mode = opts?.mode ?? 'connection';

                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to register account for anonymity'
                        );
                }
                if (!this.zkProver) {
                        throw new UmbraClientError(
                                'ZK prover is required to register account for anonymity'
                        );
                }

                const { userPublicKey, instructions } =
                        await this.buildRegisterAccountForAnonymityInstructions(optionalData);

                if (mode === 'raw') {
                        const rawMessage = new TransactionMessage({
                                payerKey: userPublicKey,
                                recentBlockhash: '11111111111111111111111111111111',
                                instructions,
                        }).compileToV0Message();

                        return new VersionedTransaction(rawMessage);
                }

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const preparedMessage = new TransactionMessage({
                        payerKey: userPublicKey,
                        recentBlockhash: blockhash,
                        instructions,
                }).compileToV0Message();

                const preparedTransaction = new VersionedTransaction(preparedMessage);

                if (mode === 'prepared') {
                        return preparedTransaction;
                }

                const signedTransaction =
                        await this.umbraWallet.signTransaction(preparedTransaction);

                if (mode === 'signed') {
                        return signedTransaction;
                }

                if (mode === 'forwarder') {
                        if (!this.txForwarder) {
                                throw new UmbraClientError(
                                        'No transaction forwarder configured on UmbraClient'
                                );
                        }
                        return await this.txForwarder.forwardTransaction(signedTransaction);
                }

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Registers the user's Umbra account for both confidentiality and anonymity in a single
         * transaction.
         *
         * @remarks
         * This method combines the behavior of {@link registerAccountForConfidentiality} and
         * {@link registerAccountForAnonymity}:
         *
         * - Ensures the Arcium-encrypted user account is initialised and active
         * - Converts the account from MXE-encrypted form to shared form if required
         * - Registers the master viewing key and its blinding factors on-chain via a Groth16 proof
         *
         * All operations are encoded as a single transaction, with the master viewing key
         * registration instruction appended last.
         *
         * The same `mode` options as the other registration methods are supported:
         * - `'connection'` (default), `'forwarder'`, `'signed'`, `'prepared'`, `'raw'`.
         */
        public async registerAccountForConfidentialityAndAnonymity(
                optionalData: Sha3Hash
        ): Promise<SolanaTransactionSignature | T | VersionedTransaction>;
        public async registerAccountForConfidentialityAndAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'connection' }
        ): Promise<SolanaTransactionSignature>;
        public async registerAccountForConfidentialityAndAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'forwarder' }
        ): Promise<T>;
        public async registerAccountForConfidentialityAndAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'signed' }
        ): Promise<VersionedTransaction>;
        public async registerAccountForConfidentialityAndAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'prepared' }
        ): Promise<VersionedTransaction>;
        public async registerAccountForConfidentialityAndAnonymity(
                optionalData: Sha3Hash,
                opts: { mode: 'raw' }
        ): Promise<VersionedTransaction>;
        public async registerAccountForConfidentialityAndAnonymity(
                optionalData: Sha3Hash,
                opts?: { mode: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw' }
        ): Promise<SolanaTransactionSignature | T | VersionedTransaction> {
                const mode = opts?.mode ?? 'connection';

                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to register account for confidentiality and anonymity'
                        );
                }
                if (!this.zkProver) {
                        throw new UmbraClientError(
                                'ZK prover is required to register account for confidentiality and anonymity'
                        );
                }

                // The anonymity instruction builder already ensures the account is initialised,
                // active, converted from MXE to shared form when necessary, and that the master
                // viewing key registration instruction is appended last.
                const { userPublicKey, instructions } =
                        await this.buildRegisterAccountForAnonymityInstructions(optionalData);

                if (mode === 'raw') {
                        const rawMessage = new TransactionMessage({
                                payerKey: userPublicKey,
                                recentBlockhash: '11111111111111111111111111111111',
                                instructions,
                        }).compileToV0Message();

                        return new VersionedTransaction(rawMessage);
                }

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const preparedMessage = new TransactionMessage({
                        payerKey: userPublicKey,
                        recentBlockhash: blockhash,
                        instructions,
                }).compileToV0Message();

                const preparedTransaction = new VersionedTransaction(preparedMessage);

                if (mode === 'prepared') {
                        return preparedTransaction;
                }

                const signedTransaction =
                        await this.umbraWallet.signTransaction(preparedTransaction);

                if (mode === 'signed') {
                        return signedTransaction;
                }

                if (mode === 'forwarder') {
                        if (!this.txForwarder) {
                                throw new UmbraClientError(
                                        'No transaction forwarder configured on UmbraClient'
                                );
                        }
                        return await this.txForwarder.forwardTransaction(signedTransaction);
                }

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Internal helper that builds the instructions required to register the user's account
         * for anonymity (including master viewing key registration), based on the current on-chain
         * account state and the provided optional data.
         *
         * @internal
         */
        private async buildRegisterAccountForAnonymityInstructions(
                optionalData: Sha3Hash
        ): Promise<{
                userPublicKey: SolanaAddress;
                instructions: Array<TransactionInstruction>;
        }> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to register account for anonymity'
                        );
                }
                if (!this.zkProver) {
                        throw new UmbraClientError(
                                'ZK prover is required to register account for anonymity'
                        );
                }

                const userPublicKey = await this.umbraWallet.signer.getPublicKey();

                const FLAG_BIT_FOR_IS_INITIALISED = 0;
                const FLAG_BIT_FOR_IS_MXE_ENCRYPTED = 1;
                const FLAG_BIT_FOR_HAS_REGISTERED_MASTER_VIEWING_KEY = 2;
                const FLAG_BIT_FOR_IS_ACTIVE = 3;

                const userArciumEncryptedAccountPda =
                        getArciumEncryptedUserAccountPda(userPublicKey);

                let userArciumEncryptedAccountStatus = 0;
                let userArciumEncryptedAccountExists = true;

                try {
                        const userArciumEncryptedAccountData =
                                await this.program.account.arciumEncryptedUserAccount.fetch(
                                        userArciumEncryptedAccountPda
                                );
                        userArciumEncryptedAccountStatus = userArciumEncryptedAccountData.status[0];
                } catch {
                        // If the fetch fails, we treat the account as not yet initialised.
                        userArciumEncryptedAccountExists = false;
                }

                const instructions: Array<TransactionInstruction> = [];

                if (
                        !userArciumEncryptedAccountExists ||
                        !isBitSet(userArciumEncryptedAccountStatus, FLAG_BIT_FOR_IS_INITIALISED)
                ) {
                        instructions.push(
                                await buildInitialiseArciumEncryptedUserAccountInstruction(
                                        {
                                                destinationAddress: userPublicKey,
                                                signer: userPublicKey,
                                        },
                                        {
                                                optionalData,
                                        }
                                )
                        );
                } else if (!isBitSet(userArciumEncryptedAccountStatus, FLAG_BIT_FOR_IS_ACTIVE)) {
                        throw new UmbraClientError('User account is not active');
                }

                if (
                        !userArciumEncryptedAccountExists ||
                        isBitSet(userArciumEncryptedAccountStatus, FLAG_BIT_FOR_IS_MXE_ENCRYPTED)
                ) {
                        instructions.push(
                                await buildConvertUserAccountFromMxeToSharedInstruction(
                                        {
                                                arciumSigner: userPublicKey,
                                        },
                                        {
                                                x25519PublicKey:
                                                        this.umbraWallet.arciumX25519PublicKey,
                                                optionalData,
                                        }
                                )
                        );
                }

                const masterViewingKey = this.umbraWallet.masterViewingKey;
                const masterViewingKeyPoseidonBlindingFactor =
                        this.umbraWallet.masterViewingKeyPoseidonBlindingFactor;
                const masterViewingKeySha3BlindingFactor =
                        this.umbraWallet.masterViewingKeySha3BlindingFactor;

                const masterViewingKeySha3Commitment = sha3_256(
                        Uint8Array.from([
                                ...convertU128ToBeBytes(masterViewingKey),
                                ...convertU128ToBeBytes(masterViewingKeySha3BlindingFactor),
                        ]).reverse()
                ) as U256BeBytes;

                const masterViewingKeySha3CommitmentLeBytes = Uint8Array.from(
                        masterViewingKeySha3Commitment
                ).reverse() as U256LeBytes;

                const masterViewingKeyHash = PoseidonHasher.hash([
                        masterViewingKey,
                        masterViewingKeyPoseidonBlindingFactor,
                ]);

                const aggregatedSha3Hash = aggregateSha3HashIntoSinglePoseidonRoot(
                        masterViewingKeySha3CommitmentLeBytes
                );

                const [ciphertexts, nonce] = await this.umbraWallet.rescueCiphers
                        .get(MXE_ARCIUM_X25519_PUBLIC_KEY)!
                        .encrypt([masterViewingKey, masterViewingKeySha3BlindingFactor])!;

                const [proofA, proofB, proofC] =
                        await this.zkProver.generateMasterViewingKeyRegistrationProof(
                                masterViewingKey,
                                masterViewingKeyPoseidonBlindingFactor,
                                masterViewingKeySha3BlindingFactor,
                                masterViewingKeyHash,
                                aggregatedSha3Hash
                        );

                if (
                        !userArciumEncryptedAccountExists ||
                        !isBitSet(
                                userArciumEncryptedAccountStatus,
                                FLAG_BIT_FOR_HAS_REGISTERED_MASTER_VIEWING_KEY
                        )
                ) {
                        instructions.push(
                                await buildUpdateMasterViewingKeyInstruction(
                                        {
                                                payer: userPublicKey,
                                                arciumSigner: userPublicKey,
                                        },
                                        {
                                                masterViewingKeyCiphertext: ciphertexts[0]!,
                                                masterViewingKeyBlindingFactor: ciphertexts[1]!,
                                                masterViewingKeyNonce: nonce,
                                                masterViewingKeyShaCommitment:
                                                        masterViewingKeySha3CommitmentLeBytes,
                                                masterViewingKeyHash,
                                                proofA,
                                                proofB,
                                                proofC,
                                                optionalData,
                                        }
                                )
                        );
                }

                return { userPublicKey, instructions };
        }

        /**
         * Returns the decrypted balance of the user's Arcium-encrypted SPL token account.
         *
         * @param mint - The SPL token mint address whose encrypted balance should be queried.
         * @returns The decrypted token balance as an {@link Amount}.
         *
         * @remarks
         * This method:
         * - Derives the Arcium-encrypted token account PDA for the current user and the given mint.
         * - Fetches the on-chain encrypted token account data.
         * - Decrypts the encrypted balance using the Umbra wallet's MXE Rescue cipher.
         *
         * If the encrypted token account does not exist on-chain (for example, the user has never
         * held this token), the fetch will fail and this method will return a zero balance
         * (`0n` cast to {@link Amount}) instead of throwing.
         *
         * When called with multiple mints (array overload), this method uses a single
         * `fetchMultiple` call under the hood and returns a {@link Map} from {@link MintAddress}
         * to decrypted {@link Amount}. Any mint whose encrypted account is missing or malformed
         * will be mapped to a zero balance.
         *
         * @throws {@link UmbraClientError}
         * - If no Umbra wallet has been configured on the client.
         * - If the Arcium-encrypted token account PDA cannot be derived (single-mint overload).
         * - If the Rescue cipher for `MXE_ARCIUM_X25519_PUBLIC_KEY` is not available.
         * - If the encrypted balance or nonce are missing or malformed (single-mint overload).
         * - If decryption succeeds but returns an unexpected result (single-mint overload).
         *
         * @example
         * ```ts
         * // Assume `client` has been created and configured with an Umbra wallet.
         * const usdcMint: MintAddress = /* obtain SPL token mint address *\/;
         *
         * const balance = await client.getEncryptedTokenBalance(usdcMint);
         * console.log(`Decrypted USDC balance: ${balance.toString()}`);
         * ```
         *
         * @example
         * ```ts
         * const [usdcMint, usdtMint]: MintAddress[] = [/* ... *\/, /* ... *\/];
         * const balances = await client.getEncryptedTokenBalance([usdcMint, usdtMint]);
         *
         * console.log(balances.get(usdcMint)?.toString()); // e.g. "1000000"
         * console.log(balances.get(usdtMint)?.toString()); // "0" if no account exists
         * ```
         */
        public async getEncryptedTokenBalance(mint: MintAddress): Promise<Amount>;
        public async getEncryptedTokenBalance(
                mints: MintAddress[]
        ): Promise<Map<MintAddress, Amount>>;
        public async getEncryptedTokenBalance(
                mintOrMints: MintAddress | MintAddress[]
        ): Promise<Amount | Map<MintAddress, Amount>> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to fetch encrypted token balances'
                        );
                }

                const userPublicKey = await this.umbraWallet.signer.getPublicKey();

                // Multi-mint overload: batch PDA derivation and `fetchMultiple`.
                if (Array.isArray(mintOrMints)) {
                        const result = new Map<MintAddress, Amount>();

                        const pdas: Array<ReturnType<typeof getArciumEncryptedTokenAccountPda>> =
                                [];
                        const mintsWithDerivedPdas: MintAddress[] = [];

                        for (const mint of mintOrMints) {
                                try {
                                        const pda = getArciumEncryptedTokenAccountPda(
                                                userPublicKey,
                                                mint
                                        );
                                        pdas.push(pda);
                                        mintsWithDerivedPdas.push(mint);
                                } catch {
                                        // If PDA derivation fails, treat as zero balance.
                                        result.set(mint, 0n as Amount);
                                }
                        }

                        if (pdas.length === 0) {
                                return result;
                        }

                        const accounts =
                                await this.program.account.arciumEncryptedTokenAccount.fetchMultiple(
                                        pdas
                                );

                        for (let index = 0; index < mintsWithDerivedPdas.length; index += 1) {
                                const mint = mintsWithDerivedPdas[index]!;
                                const account = accounts[index];

                                if (!account) {
                                        // Missing account ⇒ zero balance.
                                        result.set(mint, 0n as Amount);
                                        continue;
                                }

                                try {
                                        const amount =
                                                await this.decryptEncryptedTokenAccountBalance(
                                                        account
                                                );
                                        result.set(mint, amount);
                                } catch {
                                        // Malformed or undecryptable account ⇒ zero balance.
                                        result.set(mint, 0n as Amount);
                                }
                        }

                        return result;
                }

                // Single-mint overload: preserve existing precise error semantics.
                let userEncryptedTokenAccountPda;
                try {
                        userEncryptedTokenAccountPda = getArciumEncryptedTokenAccountPda(
                                userPublicKey,
                                mintOrMints
                        );
                } catch (error) {
                        throw new UmbraClientError(
                                'Failed to derive Arcium-encrypted token account PDA'
                        );
                }

                let userEncryptedTokenAccountData: any;
                try {
                        userEncryptedTokenAccountData =
                                await this.program.account.arciumEncryptedTokenAccount.fetch(
                                        userEncryptedTokenAccountPda
                                );
                } catch {
                        // If the fetch fails, we treat it as "no token account", i.e. zero balance.
                        return 0n as Amount;
                }

                return this.decryptEncryptedTokenAccountBalance(userEncryptedTokenAccountData);
        }

        private async decryptEncryptedTokenAccountBalance(accountData: any): Promise<Amount> {
                if (
                        !accountData?.balance ||
                        !Array.isArray(accountData.balance) ||
                        !accountData.balance[0]
                ) {
                        throw new UmbraClientError(
                                'Malformed encrypted token account data: missing balance ciphertext'
                        );
                }

                if (
                        !accountData?.nonce ||
                        !Array.isArray(accountData.nonce) ||
                        !accountData.nonce[0]
                ) {
                        throw new UmbraClientError(
                                'Malformed encrypted token account data: missing encryption nonce'
                        );
                }

                const encryptedBalance = Uint8Array.from(
                        accountData.balance[0]
                ) as RescueCiphertext;

                const encryptionNonce = BigInt(
                        accountData.nonce[0].toString()
                ) as ArciumX25519Nonce;

                const cipher = this.umbraWallet?.rescueCiphers.get(MXE_ARCIUM_X25519_PUBLIC_KEY);
                if (!cipher) {
                        throw new UmbraClientError(
                                'Rescue cipher for MXE_ARCIUM_X25519_PUBLIC_KEY is not configured on the Umbra wallet'
                        );
                }

                const decryptedBalance = await cipher.decrypt([encryptedBalance], encryptionNonce);

                if (
                        !decryptedBalance ||
                        decryptedBalance.length === 0 ||
                        decryptedBalance[0] == null
                ) {
                        throw new UmbraClientError(
                                'Unexpected result when decrypting encrypted token balance'
                        );
                }

                return decryptedBalance[0] as Amount;
        }

        /**
         * Deposits SOL publicly into the Umbra mixer pool via a relayer, generating the required
         * zero-knowledge proof and commitment/linker hashes.
         *
         * @param amount - The amount of SOL to deposit into the mixer pool.
         * @param destinationAddress - The Solana address where withdrawn funds should ultimately be sent.
         * @param opts - Optional configuration object containing:
         *   - `index`: Optional index used to derive random secret and nullifier. If not provided, a random index is generated.
         *   - `relayerPublicKey`: Optional public key of the relayer. If not provided, a random relayer is selected automatically.
         *   - `mode`: Transaction handling mode. Defaults to `'connection'` for public deposits.
         * @returns Depending on the `mode`, an object with:
         * - `generationIndex`: the {@link U256} nullifier index used to derive the random secret and nullifier.
         * - `relayerPublicKey`: the {@link SolanaAddress} of the relayer used for this deposit.
         * - `claimableBalance`: the {@link Amount} claimable after deducting relayer + commission fees.
         * - `txReturnedData`: either a transaction signature, forwarded result of type `T`, or a prepared/signed
         *   {@link VersionedTransaction}, matching the selected mode.
         *
         * @remarks
         * This method:
         * - Ensures the Arcium-encrypted user account is initialised, active, and has a registered master viewing key.
         * - Uses either a caller-provided index or a freshly sampled random index and derives:
         *   - A random secret via {@link UmbraWallet.generateRandomSecret}
         *   - A nullifier via {@link UmbraWallet.generateNullifier}
         * - Computes an inner commitment binding the random secret, nullifier, net deposit amount, master viewing key,
         *   and destination address.
         * - Computes a time-based linker hash via
         *   {@link UmbraWallet.generateLinkerHashForDepositsIntoMixerPool}.
         * - Generates a Groth16 proof using the configured {@link IZkProver}.
         * - Builds a `deposit_into_mixer_pool_sol` instruction targeting a randomly selected relayer.
         *
         * The behavior is controlled by the `mode` option (defaults to `'connection'`):
         *
         * - **Default / `'connection'`**
         *   Signs the transaction with the client's `umbraWallet` and sends it directly via
         *   `connectionBasedForwarder`, returning a {@link SolanaTransactionSignature}.
         *
         * - **`'forwarder'`**
         *   Signs the transaction with the client's `umbraWallet` and forwards it via `txForwarder`,
         *   returning the generic type `T`. This is the recommended mode when using a relayer.
         *
         * - **`'signed'`**
         *   Signs with the client's `umbraWallet` and returns the signed {@link VersionedTransaction}
         *   without sending it. Use this when you want to control submission yourself.
         *
         * - **`'prepared'`**
         *   Returns an unsigned {@link VersionedTransaction} with fee payer and recent blockhash
         *   populated. Use this when the signing key is external but you still want the client to
         *   prepare the transaction.
         *
         * - **`'raw'`**
         *   Returns an unsigned {@link VersionedTransaction} built only from the instructions, with a
         *   placeholder blockhash. No real fee payer / blockhash setup is performed, and the caller
         *   is expected to update the message before signing and sending.
         *
         * If the user's Arcium-encrypted account cannot be fetched, it is treated as uninitialised and
         * the account checks (initialised / active / registered master viewing key) will fail with
         * explicit {@link UmbraClientError}s.
         *
         * @throws {@link UmbraClientError}
         * - If no Umbra wallet has been configured on the client.
         * - If no ZK prover has been configured on the client.
         * - If the user's account is not initialised, not active, or has not registered a master viewing key.
         * - If no transaction forwarder is configured when using `'forwarder'` mode.
         *
         * @example
         * ```ts
         * // Basic usage with default 'connection' mode and auto-generated index/relayer.
         * const { generationIndex, relayerPublicKey, claimableBalance, txReturnedData } =
         *   await client.depositPubliclyIntoMixerPoolSol(
         *     amount,
         *     destinationAddress
         *   );
         * ```
         *
         * @example
         * ```ts
         * // Usage with specific index and relayer, using 'signed' mode.
         * const { generationIndex, relayerPublicKey, claimableBalance, txReturnedData } =
         *   await client.depositPubliclyIntoMixerPoolSol(
         *     amount,
         *     destinationAddress,
         *     {
         *       index: 42n,
         *       relayerPublicKey: specificRelayerPublicKey,
         *       mode: 'signed'
         *     }
         *   );
         * ```
         */
        public async depositPubliclyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature>>;
        public async depositPubliclyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: DepositPubliclyOptions & { mode: 'connection' }
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature>>;
        public async depositPubliclyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: DepositPubliclyOptions & { mode: 'forwarder' }
        ): Promise<DepositPubliclyResult<T>>;
        public async depositPubliclyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: DepositPubliclyOptions
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature | T | VersionedTransaction>>;
        public async depositPubliclyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: DepositPubliclyOptions & { mode: 'signed' }
        ): Promise<DepositPubliclyResult<VersionedTransaction>>;
        public async depositPubliclyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: DepositPubliclyOptions & { mode: 'prepared' }
        ): Promise<DepositPubliclyResult<VersionedTransaction>>;
        public async depositPubliclyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: DepositPubliclyOptions & { mode: 'raw' }
        ): Promise<DepositPubliclyResult<VersionedTransaction>>;
        public async depositPubliclyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts?: DepositPubliclyOptions
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature | T | VersionedTransaction>>;
        public async depositPubliclyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts?: DepositPubliclyOptions
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature | T | VersionedTransaction>> {
                // Parse options with defaults
                const index = opts?.index ?? (generateRandomU256() as U256);
                const mode = opts?.mode ?? 'connection';

                // Resolve relayer public key
                let resolvedRelayerPublicKey: SolanaAddress;
                if (opts?.relayerPublicKey) {
                        resolvedRelayerPublicKey = opts.relayerPublicKey;
                } else {
                        const randomRelayer = await UmbraClient.getRandomRelayerForwarder();
                        resolvedRelayerPublicKey = randomRelayer.relayerPublicKey;
                }

                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to deposit into the mixer pool'
                        );
                }
                if (!this.zkProver) {
                        throw new UmbraClientError(
                                'ZK prover is required to deposit into the mixer pool'
                        );
                }

                const userPublicKey = await this.umbraWallet.signer.getPublicKey();
                const encryptedUserAccountPda = getArciumEncryptedUserAccountPda(userPublicKey);

                const FLAG_BIT_FOR_IS_INITIALISED = 0;
                const FLAG_BIT_FOR_HAS_REGISTERED_MASTER_VIEWING_KEY = 2;
                const FLAG_BIT_FOR_IS_ACTIVE = 3;

                let accountStatusByte = 0;
                let accountExists = true;

                try {
                        const encryptedUserAccountData =
                                await this.program.account.arciumEncryptedUserAccount.fetch(
                                        encryptedUserAccountPda
                                );
                        accountStatusByte = encryptedUserAccountData.status[0];
                } catch {
                        // Treat fetch failure as "account not initialised / not active / no MVK".
                        accountExists = false;
                }

                if (!accountExists || !isBitSet(accountStatusByte, FLAG_BIT_FOR_IS_INITIALISED)) {
                        throw new UmbraClientError('User account is not initialised');
                }

                if (
                        !accountExists ||
                        !isBitSet(accountStatusByte, FLAG_BIT_FOR_HAS_REGISTERED_MASTER_VIEWING_KEY)
                ) {
                        throw new UmbraClientError(
                                'User account has not registered master viewing key'
                        );
                }

                if (!accountExists || !isBitSet(accountStatusByte, FLAG_BIT_FOR_IS_ACTIVE)) {
                        throw new UmbraClientError('User account is not active');
                }

                const randomSecret = this.umbraWallet.generateRandomSecret(index);
                const nullifier = this.umbraWallet.generateNullifier(index);

                const [destinationAddressLo, destinationAddressHi] =
                        breakPublicKeyIntoTwoParts(destinationAddress);

                const feesConfiguration =
                        await UmbraClient.getFeesConfigurationForPublicDepositIntoMixerPoolSol(
                                amount
                        );

                // Calculate claimable balance: (amount - relayerFee) * (1 - commissionFee/10000)
                const amountAfterRelayerFees = amount - feesConfiguration.relayerFees;
                const commissionFees =
                        (amountAfterRelayerFees * feesConfiguration.commissionFees) / 10000n;
                const claimableBalance = amountAfterRelayerFees - commissionFees;

                const innerCommitment = PoseidonHasher.hash([
                        randomSecret,
                        nullifier,
                        claimableBalance,
                        this.umbraWallet.masterViewingKey,
                        destinationAddressLo,
                        destinationAddressHi,
                ]);

                const time = Math.floor(Date.now() / 1000);
                // Break the 'time' (unix timestamp in seconds) into year, month, day, hour, minute, second
                const dateObj = new Date(time * 1000);
                const year = dateObj.getUTCFullYear();
                const month = dateObj.getUTCMonth() + 1; // Months are zero-based
                const day = dateObj.getUTCDate();
                const hour = dateObj.getUTCHours();
                const minute = dateObj.getUTCMinutes();
                const second = dateObj.getUTCSeconds();

                const linkerHash = this.umbraWallet.generateCreateDepositLinkerHash(
                        'create_spl_deposit_with_public_amount',
                        BigInt(time) as Time,
                        destinationAddress
                );

                const onChainMvkHash = PoseidonHasher.hash([
                        this.umbraWallet.masterViewingKey,
                        this.umbraWallet.masterViewingKeyPoseidonBlindingFactor,
                ]);

                const [proofA, proofB, proofC] =
                        await this.zkProver.generateCreateSplDepositWithPublicAmountProof(
                                this.umbraWallet.masterViewingKey,
                                this.umbraWallet.masterViewingKeyPoseidonBlindingFactor,
                                destinationAddressLo,
                                destinationAddressHi,
                                randomSecret,
                                nullifier,
                                claimableBalance as U128,
                                BigInt(year) as Year,
                                BigInt(month) as Month,
                                BigInt(day) as Day,
                                BigInt(hour) as Hour,
                                BigInt(minute) as Minute,
                                BigInt(second) as Second,
                                claimableBalance as U128,
                                BigInt(year) as Year,
                                BigInt(month) as Month,
                                BigInt(day) as Day,
                                BigInt(hour) as Hour,
                                BigInt(minute) as Minute,
                                BigInt(second) as Second,
                                linkerHash,
                                innerCommitment,
                                onChainMvkHash
                        );

                const instructions: Array<TransactionInstruction> = [];

                instructions.push(
                        await buildDepositIntoMixerSolInstruction(
                                {
                                        arciumSigner: userPublicKey,
                                        relayer: resolvedRelayerPublicKey,
                                },
                                {
                                        amount,
                                        commitmentInnerHash: innerCommitment,
                                        linkerHash,
                                        time: BigInt(time) as Time,
                                        groth16ProofA: proofA,
                                        groth16ProofB: proofB,
                                        groth16ProofC: proofC,
                                }
                        )
                );

                if (mode === 'raw') {
                        const rawMessage = new TransactionMessage({
                                payerKey: userPublicKey,
                                recentBlockhash: '11111111111111111111111111111111',
                                instructions,
                        }).compileToV0Message();

                        return {
                                generationIndex: index,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance: claimableBalance as U128,
                                txReturnedData: new VersionedTransaction(rawMessage),
                        };
                }

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: userPublicKey,
                        recentBlockhash: blockhash,
                        instructions,
                }).compileToV0Message();

                const preparedTransaction = new VersionedTransaction(transactionMessage);

                if (mode === 'prepared') {
                        return {
                                generationIndex: index,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance: claimableBalance as U128,
                                txReturnedData: preparedTransaction,
                        };
                }

                const signedTransaction =
                        await this.umbraWallet.signTransaction(preparedTransaction);

                if (mode === 'signed') {
                        return {
                                generationIndex: index,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance: claimableBalance as U128,
                                txReturnedData: signedTransaction,
                        };
                }

                if (mode === 'forwarder') {
                        if (!this.txForwarder) {
                                throw new UmbraClientError(
                                        'No transaction forwarder configured on UmbraClient'
                                );
                        }
                        return {
                                generationIndex: index,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance: claimableBalance as U128,
                                txReturnedData:
                                        await this.txForwarder.forwardTransaction(
                                                signedTransaction
                                        ),
                        };
                }

                // 'connection' mode: send via connectionBasedForwarder.
                return {
                        generationIndex: index,
                        relayerPublicKey: resolvedRelayerPublicKey,
                        claimableBalance: claimableBalance as U128,
                        txReturnedData:
                                await this.connectionBasedForwarder.forwardTransaction(
                                        signedTransaction
                                ),
                };
        }

        /**
         * Deposits SPL tokens publicly into the Umbra mixer pool via a relayer, generating the required
         * zero-knowledge proof and commitment/linker hashes.
         *
         * @param amount - The amount of SPL tokens to deposit into the mixer pool.
         * @param destinationAddress - The Solana address where withdrawn funds should ultimately be sent.
         * @param mintAddress - The SPL token mint address being deposited.
         * @param opts - Optional configuration object containing:
         *   - `index`: Optional index used to derive random secret and nullifier. If not provided, a random index is generated.
         *   - `relayerPublicKey`: Optional public key of the relayer. If not provided, a random relayer is selected automatically.
         *   - `mode`: Transaction handling mode. Defaults to `'connection'` for public deposits.
         * @returns Depending on the `mode`, an object with:
         * - `generationIndex`: the {@link U256} nullifier index used to derive the random secret and nullifier.
         * - `relayerPublicKey`: the {@link SolanaAddress} of the relayer used for this deposit.
         * - `claimableBalance`: the {@link Amount} that can be claimed after deducting commission fees (relayer fees
         *   are paid separately from WSOL for SPL deposits).
         * - `txReturnedData`: either a transaction signature, a forwarded result of type `T`, or a prepared/signed
         *   {@link VersionedTransaction}, matching the selected mode.
         *
         * @remarks
         * This method mirrors {@link depositPubliclyIntoMixerPoolSol} but operates on SPL tokens.
         * The key differences are:
         * - Commission fees **are** subtracted directly from the deposited SPL `amount`, ensuring the on-chain
         *   commitment reflects the post-commission value.
         * - Relayer fees are paid out of the user's wrapped SOL (WSOL) balance when the transaction is forwarded,
         *   so the SPL `amount` only accounts for commission deductions.
         *
         * Internally, it:
         * - Ensures the Arcium-encrypted user account is initialised, active, and has a registered master viewing key.
         * - Uses either a caller-provided index or a freshly sampled random index and derives:
         *   - A random secret via {@link UmbraWallet.generateRandomSecret}
         *   - A nullifier via {@link UmbraWallet.generateNullifier}
         * - Computes an inner commitment binding the random secret, nullifier, deposit amount, master viewing key,
         *   and destination address.
         * - Computes a time-based linker hash via
         *   {@link UmbraWallet.generateLinkerHashForDepositsIntoMixerPool}.
         * - Generates a Groth16 proof using the configured {@link IZkProver}.
         * - Builds a `deposit_into_mixer_pool_spl` instruction targeting a randomly selected relayer.
         *
         * The behavior is controlled by the `mode` option in the same way as
         * {@link depositPubliclyIntoMixerPoolSol}.
         *
         * @example
         * ```ts
         * // Basic SPL deposit with default 'connection' mode and auto-generated index/relayer.
         * const { generationIndex, relayerPublicKey, claimableBalance, txReturnedData } =
         *   await client.depositPubliclyIntoMixerPoolSpl(
         *     amount,
         *     destinationAddress,
         *     splMintAddress
         *   );
         * ```
         *
         * @example
         * ```ts
         * // SPL deposit with specific index and relayer, using 'prepared' mode.
         * const { generationIndex, relayerPublicKey, claimableBalance, txReturnedData } =
         *   await client.depositPubliclyIntoMixerPoolSpl(
         *     amount,
         *     destinationAddress,
         *     splMintAddress,
         *     {
         *       index: 42n,
         *       relayerPublicKey: specificRelayerPublicKey,
         *       mode: 'prepared'
         *     }
         *   );
         * ```
         */
        public async depositPubliclyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature>>;
        public async depositPubliclyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'connection' }
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature>>;
        public async depositPubliclyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'forwarder' }
        ): Promise<DepositPubliclyResult<T>>;
        public async depositPubliclyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature | T | VersionedTransaction>>;
        public async depositPubliclyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'signed' }
        ): Promise<DepositPubliclyResult<VersionedTransaction>>;
        public async depositPubliclyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'prepared' }
        ): Promise<DepositPubliclyResult<VersionedTransaction>>;
        public async depositPubliclyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'raw' }
        ): Promise<DepositPubliclyResult<VersionedTransaction>>;
        public async depositPubliclyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts?: DepositPubliclyOptions
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature | T | VersionedTransaction>> {
                // Parse options with defaults
                const index = opts?.index ?? (generateRandomU256() as U256);
                const mode = opts?.mode ?? 'connection';

                // Resolve relayer public key
                let resolvedRelayerPublicKey: SolanaAddress;
                if (opts?.relayerPublicKey) {
                        resolvedRelayerPublicKey = opts.relayerPublicKey;
                } else {
                        const randomRelayer = await UmbraClient.getRandomRelayerForwarder();
                        resolvedRelayerPublicKey = randomRelayer.relayerPublicKey;
                }

                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to deposit into the mixer pool'
                        );
                }
                if (!this.zkProver) {
                        throw new UmbraClientError(
                                'ZK prover is required to deposit into the mixer pool'
                        );
                }

                const userPublicKey = await this.umbraWallet.signer.getPublicKey();
                const encryptedUserAccountPda = getArciumEncryptedUserAccountPda(userPublicKey);

                const FLAG_BIT_FOR_IS_INITIALISED = 0;
                const FLAG_BIT_FOR_HAS_REGISTERED_MASTER_VIEWING_KEY = 2;
                const FLAG_BIT_FOR_IS_ACTIVE = 3;

                let accountStatusByte = 0;
                let accountExists = true;

                try {
                        const encryptedUserAccountData =
                                await this.program.account.arciumEncryptedUserAccount.fetch(
                                        encryptedUserAccountPda
                                );
                        accountStatusByte = encryptedUserAccountData.status[0];
                } catch {
                        // Treat fetch failure as "account not initialised / not active / no MVK".
                        accountExists = false;
                }

                if (!accountExists || !isBitSet(accountStatusByte, FLAG_BIT_FOR_IS_INITIALISED)) {
                        throw new UmbraClientError('User account is not initialised');
                }

                if (
                        !accountExists ||
                        !isBitSet(accountStatusByte, FLAG_BIT_FOR_HAS_REGISTERED_MASTER_VIEWING_KEY)
                ) {
                        throw new UmbraClientError(
                                'User account has not registered master viewing key'
                        );
                }

                if (!accountExists || !isBitSet(accountStatusByte, FLAG_BIT_FOR_IS_ACTIVE)) {
                        throw new UmbraClientError('User account is not active');
                }

                const randomSecret = this.umbraWallet.generateRandomSecret(index);
                const nullifier = this.umbraWallet.generateNullifier(index);

                const [destinationAddressLo, destinationAddressHi] =
                        breakPublicKeyIntoTwoParts(destinationAddress);

                const feesConfiguration =
                        await UmbraClient.getFeesConfigurationForPublicDepositIntoMixerPoolSpl(
                                amount,
                                mintAddress
                        );

                // Calculate claimable balance: (amount - relayerFee) * (1 - commissionFee/10000)
                // Note: For SPL deposits, relayer fees are typically 0 as they are paid from WSOL
                const amountAfterRelayerFees = amount - feesConfiguration.relayerFees;
                const commissionFees =
                        (amountAfterRelayerFees * feesConfiguration.commissionFees) / 10000n;
                const claimableBalance = amountAfterRelayerFees - commissionFees;

                const innerCommitment = PoseidonHasher.hash([
                        randomSecret,
                        nullifier,
                        claimableBalance as U128,
                        this.umbraWallet.masterViewingKey,
                        destinationAddressLo,
                        destinationAddressHi,
                ]);

                const time = Math.floor(Date.now() / 1000);
                // Break the 'time' (unix timestamp in seconds) into year, month, day, hour, minute, second
                const dateObj = new Date(time * 1000);
                const year = dateObj.getUTCFullYear();
                const month = dateObj.getUTCMonth() + 1; // Months are zero-based
                const day = dateObj.getUTCDate();
                const hour = dateObj.getUTCHours();
                const minute = dateObj.getUTCMinutes();
                const second = dateObj.getUTCSeconds();

                const linkerHash = this.umbraWallet.generateCreateDepositLinkerHash(
                        'create_spl_deposit_with_public_amount',
                        BigInt(time) as Time,
                        destinationAddress
                );

                const onChainMvkHash = PoseidonHasher.hash([
                        this.umbraWallet.masterViewingKey,
                        this.umbraWallet.masterViewingKeyPoseidonBlindingFactor,
                ]);

                const [proofA, proofB, proofC] =
                        await this.zkProver.generateCreateSplDepositWithPublicAmountProof(
                                this.umbraWallet.masterViewingKey,
                                this.umbraWallet.masterViewingKeyPoseidonBlindingFactor,
                                destinationAddressLo,
                                destinationAddressHi,
                                randomSecret,
                                nullifier,
                                claimableBalance as U128,
                                BigInt(year) as Year,
                                BigInt(month) as Month,
                                BigInt(day) as Day,
                                BigInt(hour) as Hour,
                                BigInt(minute) as Minute,
                                BigInt(second) as Second,
                                claimableBalance as U128,
                                BigInt(year) as Year,
                                BigInt(month) as Month,
                                BigInt(day) as Day,
                                BigInt(hour) as Hour,
                                BigInt(minute) as Minute,
                                BigInt(second) as Second,
                                linkerHash,
                                innerCommitment,
                                onChainMvkHash
                        );

                const instructions: Array<TransactionInstruction> = [];

                instructions.push(
                        await buildDepositIntoMixerPoolSplInstruction(
                                {
                                        arciumSigner: userPublicKey,
                                        relayer: resolvedRelayerPublicKey,
                                        mint: mintAddress,
                                },
                                {
                                        amount,
                                        commitmentInnerHash: innerCommitment,
                                        linkerHash,
                                        time: BigInt(time) as Time,
                                        groth16ProofA: proofA,
                                        groth16ProofB: proofB,
                                        groth16ProofC: proofC,
                                }
                        )
                );

                if (mode === 'raw') {
                        const rawMessage = new TransactionMessage({
                                payerKey: userPublicKey,
                                recentBlockhash: '11111111111111111111111111111111',
                                instructions,
                        }).compileToV0Message();

                        return {
                                generationIndex: index,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance: claimableBalance as U128,
                                txReturnedData: new VersionedTransaction(rawMessage),
                        };
                }

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: userPublicKey,
                        recentBlockhash: blockhash,
                        instructions,
                }).compileToV0Message();

                const preparedTransaction = new VersionedTransaction(transactionMessage);

                if (mode === 'prepared') {
                        return {
                                generationIndex: index,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance: claimableBalance as U128,
                                txReturnedData: preparedTransaction,
                        };
                }

                const signedTransaction =
                        await this.umbraWallet.signTransaction(preparedTransaction);

                if (mode === 'signed') {
                        return {
                                generationIndex: index,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance: claimableBalance as U128,
                                txReturnedData: signedTransaction,
                        };
                }

                if (mode === 'forwarder') {
                        if (!this.txForwarder) {
                                throw new UmbraClientError(
                                        'No transaction forwarder configured on UmbraClient'
                                );
                        }
                        return {
                                generationIndex: index,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance: claimableBalance as U128,
                                txReturnedData:
                                        await this.txForwarder.forwardTransaction(
                                                signedTransaction
                                        ),
                        };
                }

                // 'connection' mode: send via connectionBasedForwarder.
                return {
                        generationIndex: index,
                        relayerPublicKey: resolvedRelayerPublicKey,
                        claimableBalance: claimableBalance as U128,
                        txReturnedData:
                                await this.connectionBasedForwarder.forwardTransaction(
                                        signedTransaction
                                ),
                };
        }

        /**
         * Convenience wrapper that deposits either SOL (via WSOL) or SPL tokens into the mixer pool,
         * delegating to {@link depositPubliclyIntoMixerPoolSol} or
         * {@link depositPubliclyIntoMixerPoolSpl} as appropriate based on the mint.
         *
         * @param amount - The amount of SOL/SPL tokens to deposit.
         * @param destinationAddress - The Solana address where withdrawn funds should ultimately be sent.
         * @param mintAddress - The SPL mint address. If this is `WSOL_MINT_ADDRESS`, the SOL path is used.
         * @param opts - Optional configuration object containing:
         *   - `index`: Optional index used to derive random secret and nullifier. If not provided, a random index is generated.
         *   - `relayerPublicKey`: Optional public key of the relayer. If not provided, a random relayer is selected automatically.
         *   - `mode`: Transaction handling mode. Defaults to `'connection'` for public deposits.
         *
         * @remarks
         * - When `mintAddress === WSOL_MINT_ADDRESS`, this method behaves exactly like
         *   {@link depositPubliclyIntoMixerPoolSol}, including relayer and commission fee cuts
         *   from the deposited amount.
         * - For all other mints, it behaves like {@link depositPubliclyIntoMixerPoolSpl}, where
         *   the full SPL `amount` is committed into the mixer pool and relayer fees are paid from WSOL.
         *
         * All `mode` and `index` semantics mirror the underlying SOL/SPL methods.
         */
        public async depositPubliclyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature>>;
        public async depositPubliclyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'connection' }
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature>>;
        public async depositPubliclyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'forwarder' }
        ): Promise<DepositPubliclyResult<T>>;
        public async depositPubliclyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature | T | VersionedTransaction>>;
        public async depositPubliclyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'signed' }
        ): Promise<DepositPubliclyResult<VersionedTransaction>>;
        public async depositPubliclyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'prepared' }
        ): Promise<DepositPubliclyResult<VersionedTransaction>>;
        public async depositPubliclyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: DepositPubliclyOptions & { mode: 'raw' }
        ): Promise<DepositPubliclyResult<VersionedTransaction>>;
        public async depositPubliclyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts?: DepositPubliclyOptions
        ): Promise<DepositPubliclyResult<SolanaTransactionSignature | T | VersionedTransaction>> {
                if (mintAddress === WSOL_MINT_ADDRESS) {
                        if (opts) {
                                return this.depositPubliclyIntoMixerPoolSol(
                                        amount,
                                        destinationAddress,
                                        opts
                                );
                        }
                        return this.depositPubliclyIntoMixerPoolSol(amount, destinationAddress);
                }

                if (opts) {
                        return this.depositPubliclyIntoMixerPoolSpl(
                                amount,
                                destinationAddress,
                                mintAddress,
                                opts
                        );
                }
                return this.depositPubliclyIntoMixerPoolSpl(
                        amount,
                        destinationAddress,
                        mintAddress
                );
        }

        /**
         * Returns the fee configuration for a public SOL deposit into the mixer pool.
         *
         * @param _amount - The intended deposit amount, used to determine the applicable fee slab.
         * @returns An object containing:
         * - `relayerFees`: Absolute fee amount paid to the relayer.
         * - `commissionFees`: Commission fee in basis points (bps) applied to the net amount after relayer fees.
         * - `commissionFeesLowerBound`: Lower bound of the commission-fee slab for informational purposes.
         * - `commissionFeesUpperBound`: Upper bound of the commission-fee slab for informational purposes.
         *
         * @remarks
         * In a production deployment this method is expected to look up fee slabs from an indexed
         * data source (or on-chain configuration) based on the provided `_amount`. The current
         * implementation is a placeholder that returns zero fees for all fields.
         *
         * @example
         * ```ts
         * const amount: Amount = 1_000_000_000n as Amount; // 1 SOL in lamports, for example
         * const fees = await UmbraClient.getFeesConfigurationForPublicDepositIntoMixerPoolSol(amount);
         *
         * console.log(fees.relayerFees.toString());
         * console.log(fees.commissionFees.toString());
         * ```
         */
        public static async getFeesConfigurationForPublicDepositIntoMixerPoolSol(
                _amount: Amount
        ): Promise<{
                relayerFees: Amount;
                commissionFees: BasisPoints;
                commissionFeesLowerBound: Amount;
                commissionFeesUpperBound: Amount;
        }> {
                // TODO: Add fetching from Indexed data for Mainnet Launch!
                return {
                        relayerFees: 0n as Amount,
                        commissionFees: 0n as BasisPoints,
                        commissionFeesLowerBound: 0n as Amount,
                        commissionFeesUpperBound: 0n as Amount,
                };
        }

        /**
         * Returns the fee configuration for a public SPL token deposit into the mixer pool.
         *
         * @param _amount - The intended deposit amount, used to determine the applicable fee slab.
         * @param _mintAddress - The SPL token mint address.
         * @returns An object containing:
         * - `relayerFees`: Absolute fee amount paid to the relayer (typically 0 for SPL deposits as relayer fees are paid from WSOL).
         * - `commissionFees`: Commission fee in basis points (bps) applied to the deposit amount.
         * - `commissionFeesLowerBound`: Lower bound of the commission-fee slab for informational purposes.
         * - `commissionFeesUpperBound`: Upper bound of the commission-fee slab for informational purposes.
         *
         * @remarks
         * In a production deployment this method is expected to look up fee slabs from an indexed
         * data source (or on-chain configuration) based on the provided `_amount` and `_mintAddress`.
         * The current implementation is a placeholder that returns zero fees for all fields.
         *
         * @example
         * ```ts
         * const amount: Amount = 1_000_000n as Amount; // 1 USDC with 6 decimals, for example
         * const fees = await UmbraClient.getFeesConfigurationForPublicDepositIntoMixerPoolSpl(
         *   amount,
         *   usdcMintAddress
         * );
         *
         * console.log(fees.relayerFees.toString());
         * console.log(fees.commissionFees.toString());
         * ```
         */
        public static async getFeesConfigurationForPublicDepositIntoMixerPoolSpl(
                _amount: Amount,
                _mintAddress: MintAddress
        ): Promise<{
                relayerFees: Amount;
                commissionFees: BasisPoints;
                commissionFeesLowerBound: Amount;
                commissionFeesUpperBound: Amount;
        }> {
                // TODO: Add fetching from Indexed data for Mainnet Launch!
                return {
                        relayerFees: 0n as Amount,
                        commissionFees: 0n as BasisPoints,
                        commissionFeesLowerBound: 0n as Amount,
                        commissionFeesUpperBound: 0n as Amount,
                };
        }

        /**
         * Initialises or updates global program‑level information for the Umbra protocol.
         *
         * @param minimumNumberOfTransactions - Minimum number of transactions required for certain
         *        protocol‑level compliance checks (branded as {@link NumberOfTransactions}).
         * @param riskThreshold - Risk threshold configuration used by the protocol
         *        (branded as {@link RiskThreshold}).
         * @param optionalData - Optional SHA‑3 hash for attaching additional metadata to the
         *        initialisation, branded as {@link Sha3Hash}.
         * @returns A {@link SolanaTransactionSignature} for the submitted initialisation transaction.
         *
         * @remarks
         * This helper builds and sends a single `initialise_program_information` instruction via
         * the client's `connectionBasedForwarder`. It:
         *
         * - Uses the client's `UmbraWallet` signer as both the payer and protocol signer.
         * - Fetches a recent blockhash from the underlying `Connection`.
         * - Signs the resulting {@link VersionedTransaction} with the `UmbraWallet`.
         *
         * The method will throw if:
         *
         * - No Umbra wallet has been configured on the client.
         * - The latest blockhash cannot be fetched from the network.
         * - Transaction signing fails.
         * - Forwarding the transaction via `connectionBasedForwarder` fails.
         *
         * @example
         * ```ts
         * const txSig = await client.initialiseProgramInformation(
         *   100n as NumberOfTransactions,
         *   someRiskThreshold,
         *   someOptionalDataSha3Hash,
         * );
         * console.log('Initialise program information tx:', txSig);
         * ```
         */
        public async initialiseProgramInformation(
                minimumNumberOfTransactions: NumberOfTransactions,
                riskThreshold: RiskThreshold,
                optionalData: Sha3Hash
        ): Promise<SolanaTransactionSignature> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to initialise program information'
                        );
                }

                const signerPublicKey = await this.umbraWallet.signer.getPublicKey();

                const instruction = await buildInitialiseProgramInformationInstruction(
                        {
                                signer: signerPublicKey,
                        },
                        {
                                minimumNumberOfTransactions,
                                riskThreshold,
                                optionalData,
                        }
                );

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: signerPublicKey,
                        recentBlockhash: blockhash,
                        instructions: [instruction],
                }).compileToV0Message();

                const versionedTransaction = new VersionedTransaction(transactionMessage);
                const signedTransaction =
                        await this.umbraWallet.signTransaction(versionedTransaction);

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Initialises the master wallet specifier, configuring which address is allowed to act
         * as the "master" wallet for protocol‑level operations.
         *
         * @param allowedAddress - The {@link SolanaAddress} that will be authorised as the master wallet.
         * @returns A {@link SolanaTransactionSignature} for the submitted initialisation transaction.
         *
         * @remarks
         * This helper builds and submits a single `initialise_master_wallet_specifier` instruction
         * using the client's `UmbraWallet` signer as both:
         *
         * - The payer (fee‑payer for the transaction), and
         * - The protocol signer for the master wallet specifier initialisation.
         *
         * The method will throw if:
         *
         * - No Umbra wallet has been configured on the client.
         * - The latest blockhash cannot be fetched from the network.
         * - Transaction signing fails.
         * - Forwarding the transaction via `connectionBasedForwarder` fails.
         *
         * @example
         * ```ts
         * const masterWalletAddress: SolanaAddress = /* obtain address *\/;
         * const txSig = await client.initialiseMasterWalletSpecifier(masterWalletAddress);
         * console.log('Initialise master wallet specifier tx:', txSig);
         * ```
         */
        public async initialiseMasterWalletSpecifier(
                allowedAddress: SolanaAddress
        ): Promise<SolanaTransactionSignature> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to initialise the master wallet specifier'
                        );
                }

                const signerPublicKey = await this.umbraWallet.signer.getPublicKey();

                const instruction = await buildInitialiseMasterWalletSpecifierInstruction(
                        {
                                signer: signerPublicKey,
                        },
                        {
                                allowedAddress,
                        }
                );

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: signerPublicKey,
                        recentBlockhash: blockhash,
                        instructions: [instruction],
                }).compileToV0Message();

                const versionedTransaction = new VersionedTransaction(transactionMessage);
                const signedTransaction =
                        await this.umbraWallet.signTransaction(versionedTransaction);

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Initialises a wallet specifier entry for a given instruction seed and allowed address.
         *
         * @param instructionSeed - The {@link InstructionSeed} used to domain‑separate this specifier.
         * @param allowedAddress - The {@link SolanaAddress} that will be authorised for the given seed.
         * @param optionalData - Optional SHA‑3 hash used to attach additional metadata to the specifier.
         * @returns A {@link SolanaTransactionSignature} for the submitted initialisation transaction.
         *
         * @remarks
         * Wallet specifiers allow the protocol to associate specific instruction seeds with
         * authorised Solana addresses. This helper:
         *
         * - Uses the client's `UmbraWallet` signer as both the payer and the protocol signer.
         * - Builds a single `initialise_wallet_specifier` instruction.
         * - Fetches a recent blockhash from the `connectionBasedForwarder`.
         * - Signs and forwards the resulting {@link VersionedTransaction}.
         *
         * It will throw if:
         *
         * - No Umbra wallet has been configured on the client.
         * - The latest blockhash cannot be fetched.
         * - Transaction signing fails.
         * - Forwarding the transaction fails.
         *
         * @example
         * ```ts
         * const txSig = await client.initialiseWalletSpecifier(
         *   1 as InstructionSeed,
         *   someAllowedAddress,
         *   someOptionalDataSha3Hash,
         * );
         * console.log('Initialise wallet specifier tx:', txSig);
         * ```
         */
        public async initialiseWalletSpecifier(
                instructionSeed: InstructionSeed,
                allowedAddress: SolanaAddress,
                optionalData: Sha3Hash
        ): Promise<SolanaTransactionSignature> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to initialise a wallet specifier'
                        );
                }

                const signerPublicKey = await this.umbraWallet.signer.getPublicKey();

                const instruction = await buildInitialiseWalletSpecifierInstruction(
                        {
                                signer: signerPublicKey,
                        },
                        {
                                instructionSeed,
                                allowedAddress,
                                optionalData,
                        }
                );

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: signerPublicKey,
                        recentBlockhash: blockhash,
                        instructions: [instruction],
                }).compileToV0Message();

                const versionedTransaction = new VersionedTransaction(transactionMessage);
                const signedTransaction =
                        await this.umbraWallet.signTransaction(versionedTransaction);

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Initialises a relayer account for a given SPL mint and endpoint.
         *
         * @param mintAddress - The SPL {@link MintAddress} that this relayer will serve.
         * @param endpoint - A {@link Sha3Hash} identifying or committing to the relayer's endpoint
         *        (e.g. URL or service identifier).
         * @returns A {@link SolanaTransactionSignature} for the submitted relayer initialisation transaction.
         *
         * @remarks
         * This helper:
         *
         * - Uses the client's `UmbraWallet` signer as the relayer authority and fee payer.
         * - Builds a single `initialise_relayer_account` instruction for the specified `mintAddress`.
         * - Fetches a recent blockhash from the underlying `Connection`.
         * - Signs and forwards the resulting {@link VersionedTransaction}.
         *
         * It will throw if:
         *
         * - No Umbra wallet has been configured on the client.
         * - The latest blockhash cannot be fetched.
         * - Transaction signing fails.
         * - Forwarding the transaction fails.
         *
         * @example
         * ```ts
         * const txSig = await client.initialiseRelayerAccount(
         *   someMintAddress,
         *   someEndpointSha3Hash,
         * );
         * console.log('Initialise relayer account tx:', txSig);
         * ```
         */
        public async initialiseRelayerAccount(
                mintAddress: MintAddress,
                endpoint: Sha3Hash
        ): Promise<SolanaTransactionSignature> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to initialise a relayer account'
                        );
                }

                const relayerPublicKey = await this.umbraWallet.signer.getPublicKey();

                const instruction = await buildInitialiseRelayerAccountInstruction(
                        {
                                relayer: relayerPublicKey,
                                mint: mintAddress,
                        },
                        {
                                endpoint,
                        }
                );

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: relayerPublicKey,
                        recentBlockhash: blockhash,
                        instructions: [instruction],
                }).compileToV0Message();

                const versionedTransaction = new VersionedTransaction(transactionMessage);
                const signedTransaction =
                        await this.umbraWallet.signTransaction(versionedTransaction);

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Initialises a relayer fees account for a given SPL mint and account offset.
         *
         * @param mintAddress - The SPL {@link MintAddress} whose relayer fees pool should be initialised.
         * @param instructionSeed - The {@link InstructionSeed} used for deriving configuration PDAs.
         * @param accountOffset - The {@link AccountOffset} identifying the specific relayer fees pool.
         * @returns A {@link SolanaTransactionSignature} for the relayer fees account initialisation tx.
         *
         * @remarks
         * This helper:
         *
         * - Uses the client's `UmbraWallet` signer as the relayer authority and payer.
         * - Builds an `initialise_relayer_fees_pool` instruction for the given mint/offset.
         * - Fetches a recent blockhash, signs the transaction, and forwards it via
         *   `connectionBasedForwarder`.
         *
         * It will throw if:
         *
         * - No Umbra wallet has been configured on the client.
         * - The latest blockhash cannot be fetched.
         * - Transaction signing fails.
         * - Forwarding the transaction fails.
         *
         * @example
         * ```ts
         * const txSig = await client.initialiseRelayerFeesAccount(
         *   someMintAddress,
         *   1 as InstructionSeed,
         *   someAccountOffset,
         * );
         * console.log('Initialise relayer fees account tx:', txSig);
         * ```
         */
        public async initialiseRelayerFeesAccount(
                mintAddress: MintAddress,
                instructionSeed: InstructionSeed,
                accountOffset: AccountOffset
        ): Promise<SolanaTransactionSignature> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to initialise a relayer fees account'
                        );
                }

                const relayerPublicKey = await this.umbraWallet.signer.getPublicKey();

                const instruction = await buildInitialiseRelayerFeesPoolInstruction(
                        {
                                relayer: relayerPublicKey,
                                mint: mintAddress,
                        },
                        {
                                instructionSeed,
                                accountOffset,
                        }
                );

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: relayerPublicKey,
                        recentBlockhash: blockhash,
                        instructions: [instruction],
                }).compileToV0Message();

                const versionedTransaction = new VersionedTransaction(transactionMessage);
                const signedTransaction =
                        await this.umbraWallet.signTransaction(versionedTransaction);

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Initialises a public commission fees pool account for a given SPL mint and account offset.
         *
         * @param mintAddress - The SPL {@link MintAddress} whose public commission fees pool should be initialised.
         * @param instructionSeed - The {@link InstructionSeed} used for deriving the pool PDA.
         * @param accountOffset - The {@link AccountOffset} identifying the specific commission pool.
         * @returns A {@link SolanaTransactionSignature} for the public commission fees pool initialisation tx.
         *
         * @remarks
         * This helper:
         *
         * - Uses the client's `UmbraWallet` signer as the payer and protocol signer.
         * - Builds an `initialise_public_commission_fees` instruction via the instruction builder.
         * - Fetches a recent blockhash, signs the transaction, and forwards it using
         *   `connectionBasedForwarder`.
         *
         * It will throw if:
         *
         * - No Umbra wallet has been configured on the client.
         * - The latest blockhash cannot be fetched.
         * - Transaction signing fails.
         * - Forwarding the transaction fails.
         *
         * @example
         * ```ts
         * const txSig = await client.initialisePublicCommissionFeesPool(
         *   someMintAddress,
         *   1 as InstructionSeed,
         *   someAccountOffset,
         * );
         * console.log('Initialise public commission fees pool tx:', txSig);
         * ```
         */
        public async initialisePublicCommissionFeesPool(
                mintAddress: MintAddress,
                instructionSeed: InstructionSeed,
                accountOffset: AccountOffset
        ): Promise<SolanaTransactionSignature> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to initialise a public commission fees pool'
                        );
                }

                const signerPublicKey = await this.umbraWallet.signer.getPublicKey();

                const instruction = await buildInitialisePublicCommissionFeesPoolInstruction(
                        {
                                signer: signerPublicKey,
                                mint: mintAddress,
                        },
                        {
                                instructionSeed,
                                accountOffset,
                        }
                );

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: signerPublicKey,
                        recentBlockhash: blockhash,
                        instructions: [instruction],
                }).compileToV0Message();

                const versionedTransaction = new VersionedTransaction(transactionMessage);
                const signedTransaction =
                        await this.umbraWallet.signTransaction(versionedTransaction);

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Initialises the on-chain ZK Merkle tree for a given SPL mint.
         *
         * @param mintAddress - The SPL {@link MintAddress} whose ZK Merkle tree should be initialised.
         * @param optionalData - Optional {@link Sha3Hash} used to attach additional metadata.
         * @returns A {@link SolanaTransactionSignature} for the ZK Merkle tree initialisation tx.
         *
         * @remarks
         * This helper:
         *
         * - Uses the client's `UmbraWallet` signer as the payer and protocol signer.
         * - Builds an `initialise_zk_merkle_tree` instruction for the specified mint.
         * - Fetches a recent blockhash, signs the transaction, and forwards it via
         *   `connectionBasedForwarder`.
         *
         * It will throw if:
         *
         * - No Umbra wallet has been configured on the client.
         * - The latest blockhash cannot be fetched.
         * - Transaction signing fails.
         * - Forwarding the transaction fails.
         *
         * @example
         * ```ts
         * const txSig = await client.initialiseZkMerkleTree(
         *   someMintAddress,
         *   someOptionalDataSha3Hash,
         * );
         * console.log('Initialise ZK Merkle tree tx:', txSig);
         * ```
         */
        public async initialiseZkMerkleTree(
                mintAddress: MintAddress,
                optionalData: Sha3Hash
        ): Promise<SolanaTransactionSignature> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to initialise a ZK Merkle tree'
                        );
                }

                const signerPublicKey = await this.umbraWallet.signer.getPublicKey();

                const instruction = await buildInitialiseZkMerkleTreeInstruction(
                        {
                                mint: mintAddress,
                                signer: signerPublicKey,
                        },
                        {
                                optionalData,
                        }
                );

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: signerPublicKey,
                        recentBlockhash: blockhash,
                        instructions: [instruction],
                }).compileToV0Message();

                const versionedTransaction = new VersionedTransaction(transactionMessage);
                const signedTransaction =
                        await this.umbraWallet.signTransaction(versionedTransaction);

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Initialises the on-chain mixer pool for a given SPL mint.
         *
         * @param mintAddress - The SPL {@link MintAddress} whose mixer pool should be initialised.
         * @param optionalData - Optional {@link Sha3Hash} used to attach additional metadata.
         * @returns A {@link SolanaTransactionSignature} for the mixer pool initialisation tx.
         *
         * @remarks
         * This helper:
         *
         * - Uses the client's `UmbraWallet` signer as the payer and protocol signer.
         * - Builds an `initialise_mixer_pool` instruction for the specified mint.
         * - Fetches a recent blockhash, signs the transaction, and forwards it via
         *   `connectionBasedForwarder`.
         *
         * It will throw if:
         *
         * - No Umbra wallet has been configured on the client.
         * - The latest blockhash cannot be fetched.
         * - Transaction signing fails.
         * - Forwarding the transaction fails.
         *
         * @example
         * ```ts
         * const txSig = await client.initialiseMixerPool(
         *   someMintAddress,
         *   someOptionalDataSha3Hash,
         * );
         * console.log('Initialise mixer pool tx:', txSig);
         * ```
         */
        public async initialiseMixerPool(
                mintAddress: MintAddress,
                optionalData: Sha3Hash
        ): Promise<SolanaTransactionSignature> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Umbra wallet is required to initialise a mixer pool'
                        );
                }

                const signerPublicKey = await this.umbraWallet.signer.getPublicKey();

                const instruction = await buildInitialiseMixerPoolInstruction(
                        {
                                signer: signerPublicKey,
                                mint: mintAddress,
                        },
                        {
                                optionalData,
                        }
                );

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: signerPublicKey,
                        recentBlockhash: blockhash,
                        instructions: [instruction],
                }).compileToV0Message();

                const versionedTransaction = new VersionedTransaction(transactionMessage);
                const signedTransaction =
                        await this.umbraWallet.signTransaction(versionedTransaction);

                return await this.connectionBasedForwarder.forwardTransaction(signedTransaction);
        }

        /**
         * Helper function to get the default status byte array for an initialized user account.
         *
         * @remarks
         * After initialization, a user account has the following flags set:
         * - IS_INITIALISED (bit 0) = true
         * - IS_MXE_ENCRYPTED (bit 1) = true
         * - IS_ACTIVE (bit 3) = true
         *
         * @returns A status byte array with the default flags set
         */
        private static getDefaultInitializedUserAccountStatus(): Uint8Array {
                const status = new Uint8Array(1);
                // Set bit 0 (IS_INITIALISED)
                status[0]! |= 1 << 0;
                // Set bit 1 (IS_MXE_ENCRYPTED)
                status[0]! |= 1 << 1;
                // Set bit 3 (IS_ACTIVE)
                status[0]! |= 1 << 3;
                return status;
        }

        /**
         * Helper function to get the default status byte array for an initialized token account.
         *
         * @remarks
         * After initialization, a token account has the following flags set:
         * - IS_INITIALISED (bit 0) = true
         * - IS_ACTIVE (bit 1) = true
         * - IS_ARCIUM_BALANCE_INITIALISED (bit 2) = false (not set)
         * - IS_MXE_ENCRYPTED (bit 3) = true
         *
         * @returns A status byte array with the default flags set
         */
        private static getDefaultInitializedTokenAccountStatus(): Uint8Array {
                const status = new Uint8Array(1);
                // Set bit 0 (IS_INITIALISED)
                status[0]! |= 1 << 0;
                // Set bit 1 (IS_ACTIVE)
                status[0]! |= 1 << 1;
                // Set bit 3 (IS_MXE_ENCRYPTED)
                status[0]! |= 1 << 3;
                // Note: bit 2 (IS_ARCIUM_BALANCE_INITIALISED) is NOT set (false)
                return status;
        }

        /**
         * Claims a deposit confidentially from the mixer pool by generating a zero-knowledge proof
         * and executing the claim transaction through a relayer.
         *
         * @remarks
         * This method enables users to claim deposits from the mixer pool while maintaining privacy.
         * The claim process involves:
         * 1. Fetching and validating Arcium encrypted user and token accounts
         * 2. Generating cryptographic values (random secret, nullifier, linker hash)
         * 3. Creating encrypted commitments and zero-knowledge proofs
         * 4. Building appropriate deposit instructions based on account state
         * 5. Forwarding the transaction through a relayer
         *
         * **Account Initialization:**
         * If the user account or token account doesn't exist (null), initialization instructions
         * are automatically added to the transaction. After initialization:
         * - **User Account**: Initialized, MXE encrypted, and active
         * - **Token Account**: Initialized, active, Arcium balance uninitialized, and MXE encrypted
         *
         * **Deposit Instruction Selection:**
         * The method selects the appropriate deposit instruction based on account state:
         * - If token account's Arcium balance is initialized:
         *   - MXE encrypted → `buildExistingTokenDepositMxeInstruction`
         *   - Shared → `buildExistingTokenDepositSharedInstruction`
         * - If token account's Arcium balance is not initialized:
         *   - User account MXE encrypted → `buildNewTokenDepositMxeInstruction`
         *   - User account shared → `buildNewTokenDepositSharedInstruction`
         *
         * **Privacy Features:**
         * - Zero-knowledge proofs verify claim validity without revealing details
         * - Nullifier hash prevents double-spending
         * - Encrypted commitments maintain privacy
         * - Merkle tree proofs verify deposit inclusion
         *
         * **Requirements:**
         * - An Umbra wallet must be set on the client via {@link setUmbraWallet}
         * - A zero-knowledge prover must be set via {@link setZkProver}
         * - The wallet must have a valid master viewing key
         * - The commitment must exist in the mixer pool at the specified index
         *
         * **Mode Options:**
         * - **Default / `'relayer'`** – Forwards the transaction to the specified relayer service and
         *   returns the resulting {@link SolanaTransactionSignature}.
         * - **`'prepared'`** – Returns an unsigned {@link VersionedTransaction} with a fresh blockhash
         *   so it can be passed to the relayer (or another submitter) for signing.
         * - **`'signed'`** – Returns a {@link VersionedTransaction} signed by the client's Umbra wallet.
         *   The relayer (or any fee payer) must still append its signature before broadcasting.
         * - **`'raw'`** – Returns a {@link VersionedTransaction} built with a placeholder blockhash.
         *   The caller must replace the blockhash and ensure the same relayer key pair (or another
         *   designated fee payer) signs the transaction before submission. The ephemeral keys derived
         *   for the claim must remain unchanged when re-signing.
         *
         * @param mintAddress - The mint address of the token being claimed
         * @param destinationAddress - The destination address where the claimed tokens will be deposited
         * @param claimableBalance - The amount that can be claimed (after fees are deducted)
         * @param claimDepositArtifacts - Required artifacts for claiming the deposit, containing:
         *   - `commitmentInsertionIndex`: The index in the Merkle tree where the commitment was inserted
         *   - `relayerPublicKey`: The public key of the relayer that will process and pay for the transaction
         *   - `generationIndex`: The generation index used to derive cryptographic values (random secret, nullifier)
         *   - `time`: The timestamp when the original deposit was made (used for linker hash generation)
         * @param opts - Optional configuration object containing:
         *   - `optionalData`: Optional SHA3 hash for additional data. If not provided, a zero hash is used.
         *   - `mode`: Transaction handling mode. Defaults to `'relayer'` for claim operations.
         *
         * @returns Depending on the `mode`, either a {@link SolanaTransactionSignature} (relayer mode)
         * or a {@link VersionedTransaction} that can be further signed / submitted by the caller.
         *
         * @throws {@link UmbraClientError} When:
         * - No Umbra wallet is set on the client
         * - No zero-knowledge prover is set on the client
         * - The wallet's master viewing key is unavailable
         * - Account fetching fails
         * - Account decoding fails
         * - An existing account is not active (user or token account)
         * - Cryptographic value generation fails (random secret, nullifier, linker hash)
         * - Zero-knowledge proof generation fails or returns invalid results
         * - Ephemeral X25519 key pair generation fails
         * - Rescue cipher encryption fails
         * - Instruction building fails
         * - Transaction building or forwarding fails
         *
         * @example
         * ```typescript
         * const client = UmbraClient.create('https://api.mainnet-beta.solana.com');
         * await client.setUmbraWallet(signer);
         * await client.setZkProver(zkProver);
         *
         * const signature = await client.claimDepositConfidentiallyFromMixerPool(
         *   usdcMintAddress,
         *   destinationAddress,
         *   1000000n, // claimableBalance (1 USDC with 6 decimals)
         *   {
         *     commitmentInsertionIndex: 42n,
         *     relayerPublicKey: relayerPublicKey,
         *     generationIndex: 0n,
         *     time: 1704067200n // Unix timestamp
         *   },
         *   {
         *     optionalData: optionalDataHash
         *   }
         * );
         * ```
         */
        public async claimDepositConfidentiallyFromMixerPool(
                mintAddress: MintAddress,
                destinationAddress: SolanaAddress,
                claimableBalance: Amount,
                claimDepositArtifacts: ClaimDepositArtifacts,
                opts?: ClaimDepositOptions
        ): Promise<SolanaTransactionSignature | T | VersionedTransaction> {
                const mode = opts?.mode ?? 'relayer';
                const optionalData = opts?.optionalData ?? ZERO_SHA3_HASH;

                // Extract values from claimDepositArtifacts
                const { commitmentInsertionIndex, relayerPublicKey, generationIndex, time } =
                        claimDepositArtifacts;

                // Validate prerequisites
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Cannot claim deposit: Umbra wallet is not set. Call setUmbraWallet() first.'
                        );
                }

                if (!this.zkProver) {
                        throw new UmbraClientError(
                                'Cannot claim deposit: Zero-knowledge prover is not set. Call setZkProver() first.'
                        );
                }

                const masterViewingKey = this.umbraWallet.masterViewingKey;
                if (!masterViewingKey) {
                        throw new UmbraClientError(
                                'Cannot claim deposit: master viewing key is not available. The wallet may not be properly initialized.'
                        );
                }

                try {
                        // Derive PDAs for encrypted accounts
                        const umbraEncryptedUserAccountPda = getArciumEncryptedTokenAccountPda(
                                destinationAddress,
                                mintAddress
                        );
                        const umbraEncryptedTokenAccountPda = getArciumEncryptedTokenAccountPda(
                                destinationAddress,
                                mintAddress
                        );

                        // Fetch account data
                        const [
                                umbraEncryptedUserAccountRawData,
                                umbraEncryptedTokenAccountRawData,
                        ] = await this.connectionBasedForwarder.connection.getMultipleAccountsInfo([
                                umbraEncryptedUserAccountPda,
                                umbraEncryptedTokenAccountPda,
                        ]);

                        // Handle null accounts - decode if exists, otherwise use default status
                        let umbraEncryptedUserAccountData: Awaited<
                                ReturnType<
                                        typeof this.program.account.arciumEncryptedUserAccount.fetch
                                >
                        >;
                        let umbraEncryptedUserAccountStatusByte: number;

                        if (umbraEncryptedUserAccountRawData) {
                                try {
                                        umbraEncryptedUserAccountData =
                                                this.program.coder.accounts.decode(
                                                        'ArciumEncryptedUserAccount',
                                                        umbraEncryptedUserAccountRawData.data
                                                );
                                        umbraEncryptedUserAccountStatusByte =
                                                umbraEncryptedUserAccountData.status[0] ?? 0;
                                } catch (error) {
                                        throw new UmbraClientError(
                                                `Failed to decode user account data: ${error instanceof Error ? error.message : String(error)}`
                                        );
                                }
                        } else {
                                // Account doesn't exist - use default status for initialized account
                                umbraEncryptedUserAccountStatusByte =
                                        UmbraClient.getDefaultInitializedUserAccountStatus()[0] ??
                                        0;
                        }

                        let umbraEncryptedTokenAccountData: Awaited<
                                ReturnType<
                                        typeof this.program.account.arciumEncryptedTokenAccount.fetch
                                >
                        >;
                        let umbraEncryptedTokenAccountStatusByte: number;

                        if (umbraEncryptedTokenAccountRawData) {
                                try {
                                        umbraEncryptedTokenAccountData =
                                                this.program.coder.accounts.decode(
                                                        'ArciumEncryptedTokenAccount',
                                                        umbraEncryptedTokenAccountRawData.data
                                                );
                                        umbraEncryptedTokenAccountStatusByte =
                                                umbraEncryptedTokenAccountData.status[0] ?? 0;
                                } catch (error) {
                                        throw new UmbraClientError(
                                                `Failed to decode token account data: ${error instanceof Error ? error.message : String(error)}`
                                        );
                                }
                        } else {
                                // Account doesn't exist - use default status for initialized account
                                umbraEncryptedTokenAccountStatusByte =
                                        UmbraClient.getDefaultInitializedTokenAccountStatus()[0] ??
                                        0;
                        }

                        const instructions: Array<TransactionInstruction> = [];

                        // Generate cryptographic values
                        const randomSecret = this.umbraWallet.generateRandomSecret(generationIndex);
                        if (!randomSecret) {
                                throw new UmbraClientError(
                                        'Failed to generate random secret. The wallet may not be properly initialized.'
                                );
                        }

                        const nullifier = this.umbraWallet.generateNullifier(generationIndex);
                        if (!nullifier) {
                                throw new UmbraClientError(
                                        'Failed to generate nullifier. The wallet may not be properly initialized.'
                                );
                        }

                        const nullifierHash = PoseidonHasher.hash([nullifier]);

                        // Get Merkle tree path
                        const {
                                siblings: merkleSiblingPathElements,
                                siblingPathIndices: merkleSiblingPathIndices,
                                merkleRoot,
                        } = await this.getMerkleSiblingPathElements(commitmentInsertionIndex);

                        // Break addresses into low/high parts
                        const [destinationAddressLow, destinationAddressHigh] =
                                breakPublicKeyIntoTwoParts(destinationAddress);

                        const [mintPublicKeyLow, mintPublicKeyHigh] = breakPublicKeyIntoTwoParts(
                                mintAddress as unknown as SolanaAddress
                        );

                        const [relayerPublicKeyLow, relayerPublicKeyHigh] =
                                breakPublicKeyIntoTwoParts(
                                        relayerPublicKey as unknown as SolanaAddress
                                );

                        // Parse time components
                        const dateObj = new Date(Number(time) * 1000);
                        const year = dateObj.getUTCFullYear();
                        const month = dateObj.getUTCMonth() + 1; // Months are zero-based
                        const day = dateObj.getUTCDate();
                        const hour = dateObj.getUTCHours();
                        const minute = dateObj.getUTCMinutes();
                        const second = dateObj.getUTCSeconds();

                        // Generate blinding factor
                        const randomBlindingFactor = generateRandomBlindingFactor();

                        // Get fees configuration
                        const feesConfiguration =
                                await UmbraClient.getFeesConfigurationForClaimDepositConfidentiallyFromMixerPool(
                                        mintAddress,
                                        claimableBalance
                                );

                        // Generate linker hash
                        const linkerHash = this.umbraWallet.generateClaimDepositLinkerHash(
                                'claim_spl_deposit_with_hidden_amount',
                                BigInt(time) as Time,
                                claimDepositArtifacts.commitmentInsertionIndex
                        );
                        if (!linkerHash) {
                                throw new UmbraClientError(
                                        'Failed to generate linker hash. The wallet may not be properly initialized.'
                                );
                        }

                        // Generate SHA3 commitment
                        const sha3commitment = sha3_256(
                                Uint8Array.from([
                                        convertU128ToBeBytes(claimableBalance),
                                        convertU128ToBeBytes(destinationAddressLow),
                                        convertU128ToBeBytes(destinationAddressHigh),
                                        convertU128ToBeBytes(randomBlindingFactor),
                                ]).reverse()
                        ) as U256BeBytes;

                        // Generate ephemeral X25519 key pair
                        const { x25519PrivateKey, x25519PublicKey } =
                                this.generateEphemeralArciumX25519PublicKey(generationIndex);

                        // Create Rescue cipher and encrypt values
                        const rescueCipher = RescueCipher.fromX25519Pair(
                                x25519PrivateKey,
                                MXE_ARCIUM_X25519_PUBLIC_KEY
                        );
                        const [ciphertexts, nonce] = await rescueCipher.encrypt([
                                claimableBalance,
                                destinationAddressLow,
                                destinationAddressHigh,
                        ]);

                        if (!ciphertexts || ciphertexts.length < 4) {
                                throw new UmbraClientError(
                                        'Failed to encrypt values: insufficient ciphertexts returned'
                                );
                        }

                        // Generate zero-knowledge proof
                        const proofResult =
                                await this.zkProver.generateClaimSplDepositWithHiddenAmountProof(
                                        randomSecret,
                                        nullifier,
                                        masterViewingKey,
                                        merkleSiblingPathElements,
                                        merkleSiblingPathIndices,
                                        1,
                                        commitmentInsertionIndex as unknown as U128,
                                        destinationAddressLow,
                                        destinationAddressHigh,
                                        destinationAddressLow,
                                        destinationAddressHigh,
                                        1,
                                        claimableBalance,
                                        BigInt(year) as Year,
                                        BigInt(month) as Month,
                                        BigInt(day) as Day,
                                        BigInt(hour) as Hour,
                                        BigInt(minute) as Minute,
                                        BigInt(second) as Second,
                                        mintPublicKeyLow,
                                        mintPublicKeyHigh,
                                        randomBlindingFactor,
                                        feesConfiguration.commissionFeesLowerBound,
                                        feesConfiguration.commissionFeesUpperBound,
                                        relayerPublicKeyLow,
                                        relayerPublicKeyHigh,
                                        1,
                                        destinationAddressLow,
                                        destinationAddressHigh,
                                        1,
                                        merkleRoot,
                                        linkerHash,
                                        nullifierHash,
                                        aggregateSha3HashIntoSinglePoseidonRoot(
                                                Uint8Array.from(
                                                        sha3commitment
                                                ).reverse() as Sha3Hash
                                        ),
                                        feesConfiguration.commissionFeesLowerBound,
                                        feesConfiguration.commissionFeesUpperBound,
                                        mintPublicKeyLow,
                                        mintPublicKeyHigh,
                                        relayerPublicKeyLow,
                                        relayerPublicKeyHigh
                                );

                        if (!proofResult) {
                                throw new UmbraClientError(
                                        'Failed to generate zero-knowledge proof: prover returned null or undefined'
                                );
                        }

                        const [proofA, proofB, proofC] = proofResult;

                        if (!proofA || !proofB || !proofC) {
                                throw new UmbraClientError(
                                        'Failed to generate zero-knowledge proof: invalid proof components returned'
                                );
                        }

                        // Handle user account initialization
                        const isUserAccountInitialized = isBitSet(
                                umbraEncryptedUserAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED
                        );

                        if (!isUserAccountInitialized) {
                                // Account doesn't exist - add initialization instruction
                                instructions.push(
                                        await buildInitialiseArciumEncryptedUserAccountInstruction(
                                                {
                                                        destinationAddress: destinationAddress,
                                                        signer: relayerPublicKey,
                                                },
                                                {
                                                        optionalData,
                                                }
                                        )
                                );
                                // After initialization, assume default status
                                umbraEncryptedUserAccountStatusByte =
                                        UmbraClient.getDefaultInitializedUserAccountStatus()[0] ??
                                        0;
                        } else {
                                // Account exists - check if active
                                if (
                                        !isBitSet(
                                                umbraEncryptedUserAccountStatusByte,
                                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                                        )
                                ) {
                                        throw new UmbraClientError('User account is not active');
                                }
                        }

                        // Handle token account initialization
                        const isTokenAccountInitialized = isBitSet(
                                umbraEncryptedTokenAccountStatusByte,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED
                        );

                        if (!isTokenAccountInitialized) {
                                // Account doesn't exist - add initialization instruction
                                instructions.push(
                                        await buildInitialiseArciumEncryptedTokenAccountInstruction(
                                                {
                                                        destinationAddress: destinationAddress,
                                                        signer: relayerPublicKey,
                                                        mint: mintAddress,
                                                },
                                                {
                                                        optionalData,
                                                }
                                        )
                                );
                                // After initialization, assume default status
                                umbraEncryptedTokenAccountStatusByte =
                                        UmbraClient.getDefaultInitializedTokenAccountStatus()[0] ??
                                        0;
                        } else {
                                // Account exists - check if active
                                if (
                                        !isBitSet(
                                                umbraEncryptedTokenAccountStatusByte,
                                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                                        )
                                ) {
                                        throw new UmbraClientError('Token account is not active');
                                }
                        }

                        // Select appropriate deposit instruction based on account state
                        const isArciumBalanceInitialized = isBitSet(
                                umbraEncryptedTokenAccountStatusByte,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_ARCIUM_BALANCE_INITIALISED
                        );

                        if (isArciumBalanceInitialized) {
                                // Existing deposit - balance already initialized
                                const isTokenAccountMxeEncrypted = isBitSet(
                                        umbraEncryptedTokenAccountStatusByte,
                                        ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                                );

                                if (!isTokenAccountMxeEncrypted) {
                                        instructions.push(
                                                await buildExistingTokenDepositSharedInstruction(
                                                        {
                                                                relayer: relayerPublicKey,
                                                                destinationAddress:
                                                                        destinationAddress,
                                                                mint: mintAddress,
                                                        },
                                                        {
                                                                expectedNullifierHash:
                                                                        nullifierHash,
                                                                ephemeralArcisPublicKey:
                                                                        x25519PublicKey,
                                                                nonce,
                                                                depositAmountCiphertext:
                                                                        ciphertexts[0]!,
                                                                depositorAddressPart1Ciphertext:
                                                                        ciphertexts[1]!,
                                                                depositorAddressPart2Ciphertext:
                                                                        ciphertexts[2]!,
                                                                blindingFactor: ciphertexts[3]!,
                                                                commitment: Uint8Array.from(
                                                                        sha3commitment
                                                                ).reverse() as U256LeBytes,
                                                                groth16ProofA: proofA,
                                                                groth16ProofB: proofB,
                                                                groth16ProofC: proofC,
                                                                expectedMerkleRoot: merkleRoot,
                                                                expectedLinkerAddressHash:
                                                                        linkerHash,
                                                                optionalData,
                                                        }
                                                )
                                        );
                                } else {
                                        instructions.push(
                                                await buildExistingTokenDepositMxeInstruction(
                                                        {
                                                                relayer: relayerPublicKey,
                                                                destinationAddress:
                                                                        destinationAddress,
                                                                mint: mintAddress,
                                                        },
                                                        {
                                                                expectedNullifierHash:
                                                                        nullifierHash,
                                                                ephemeralArcisPublicKey:
                                                                        x25519PublicKey,
                                                                nonce,
                                                                depositAmountCiphertext:
                                                                        ciphertexts[0]!,
                                                                depositorAddressPart1Ciphertext:
                                                                        ciphertexts[1]!,
                                                                depositorAddressPart2Ciphertext:
                                                                        ciphertexts[2]!,
                                                                blindingFactor: ciphertexts[3]!,
                                                                commitment: Uint8Array.from(
                                                                        sha3commitment
                                                                ).reverse() as U256LeBytes,
                                                                groth16ProofA: proofA,
                                                                groth16ProofB: proofB,
                                                                groth16ProofC: proofC,
                                                                expectedMerkleRoot: merkleRoot,
                                                                expectedLinkerAddressHash:
                                                                        linkerHash,
                                                                optionalData,
                                                        }
                                                )
                                        );
                                }
                        } else {
                                // New deposit - balance not initialized
                                const isUserAccountMxeEncrypted = isBitSet(
                                        umbraEncryptedUserAccountStatusByte,
                                        ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                                );

                                if (!isUserAccountMxeEncrypted) {
                                        instructions.push(
                                                await buildNewTokenDepositSharedInstruction(
                                                        {
                                                                relayer: relayerPublicKey,
                                                                destinationAddress:
                                                                        destinationAddress,
                                                                mint: mintAddress,
                                                        },
                                                        {
                                                                expectedNullifierHash:
                                                                        nullifierHash,
                                                                ephemeralArcisPublicKey:
                                                                        x25519PublicKey,
                                                                nonce,
                                                                depositAmountCiphertext:
                                                                        ciphertexts[0]!,
                                                                depositorAddressPart1Ciphertext:
                                                                        ciphertexts[1]!,
                                                                depositorAddressPart2Ciphertext:
                                                                        ciphertexts[2]!,
                                                                blindingFactor: ciphertexts[3]!,
                                                                commitment: Uint8Array.from(
                                                                        sha3commitment
                                                                ).reverse() as U256LeBytes,
                                                                groth16ProofA: proofA,
                                                                groth16ProofB: proofB,
                                                                groth16ProofC: proofC,
                                                                expectedMerkleRoot: merkleRoot,
                                                                expectedLinkerAddressHash:
                                                                        linkerHash,
                                                                optionalData,
                                                        }
                                                )
                                        );
                                } else {
                                        instructions.push(
                                                await buildNewTokenDepositMxeInstruction(
                                                        {
                                                                relayer: relayerPublicKey,
                                                                destinationAddress:
                                                                        destinationAddress,
                                                                mint: mintAddress,
                                                        },
                                                        {
                                                                expectedNullifierHash:
                                                                        nullifierHash,
                                                                ephemeralArcisPublicKey:
                                                                        x25519PublicKey,
                                                                nonce,
                                                                depositAmountCiphertext:
                                                                        ciphertexts[0]!,
                                                                depositorAddressPart1Ciphertext:
                                                                        ciphertexts[1]!,
                                                                depositorAddressPart2Ciphertext:
                                                                        ciphertexts[2]!,
                                                                blindingFactor: ciphertexts[3]!,
                                                                commitment: Uint8Array.from(
                                                                        sha3commitment
                                                                ).reverse() as U256LeBytes,
                                                                groth16ProofA: proofA,
                                                                groth16ProofB: proofB,
                                                                groth16ProofC: proofC,
                                                                expectedMerkleRoot: merkleRoot,
                                                                expectedLinkerAddressHash:
                                                                        linkerHash,
                                                                optionalData,
                                                        }
                                                )
                                        );
                                }
                        }

                        if (mode === 'raw') {
                                const rawMessage = new TransactionMessage({
                                        payerKey: relayerPublicKey,
                                        recentBlockhash: '11111111111111111111111111111111',
                                        instructions,
                                }).compileToV0Message();

                                return new VersionedTransaction(rawMessage);
                        }

                        const { blockhash } = await this.connectionBasedForwarder
                                .getConnection()
                                .getLatestBlockhash();

                        const transactionMessage = new TransactionMessage({
                                payerKey: relayerPublicKey,
                                recentBlockhash: blockhash,
                                instructions,
                        }).compileToV0Message();

                        const preparedTransaction = new VersionedTransaction(transactionMessage);

                        if (mode === 'prepared') {
                                return preparedTransaction;
                        }

                        if (mode === 'signed') {
                                try {
                                        const transactionToSign = VersionedTransaction.deserialize(
                                                preparedTransaction.serialize()
                                        );
                                        return await this.umbraWallet.signTransaction(
                                                transactionToSign
                                        );
                                } catch (error) {
                                        throw new UmbraClientError(
                                                `Failed to sign claim transaction: ${
                                                        error instanceof Error
                                                                ? error.message
                                                                : String(error)
                                                }`
                                        );
                                }
                        }

                        const relayerForwarder = RelayerForwarder.fromPublicKey(relayerPublicKey);
                        return await relayerForwarder.forwardTransaction(preparedTransaction);
                } catch (error) {
                        if (error instanceof UmbraClientError) {
                                throw error;
                        }
                        throw new UmbraClientError(
                                `Failed to claim deposit confidentially from mixer pool: ${error instanceof Error ? error.message : String(error)}`
                        );
                }
        }

        /**
         * Transfers tokens confidentially between encrypted accounts using Rescue cipher encryption.
         *
         * @remarks
         * This method enables private token transfers between Arcium encrypted accounts. The transfer
         * amount is encrypted using Rescue cipher, ensuring that only authorized parties can decrypt
         * the transfer details. The method automatically handles account initialization and selects
         * the appropriate transfer instruction based on the receiver's account state.
         *
         * **Transfer Process:**
         * 1. Validates sender accounts (user and token accounts must be active and in shared mode)
         * 2. Fetches and decodes receiver account data
         * 3. Initializes receiver accounts if they don't exist
         * 4. Encrypts the transfer amount using Rescue cipher
         * 5. Builds appropriate transfer instructions based on receiver account state
         * 6. Signs and forwards the transaction through a relayer
         *
         * **Sender Account Requirements:**
         * - User account must be active and in shared mode (not MXE encrypted)
         * - Token account must be active and in shared mode (not MXE encrypted)
         * - User account must not require a SOL deposit
         *
         * **Receiver Account Initialization:**
         * If the receiver's user account or token account doesn't exist, initialization instructions
         * are automatically added to the transaction. After initialization:
         * - **User Account**: Initialized, MXE encrypted, and active
         * - **Token Account**: Initialized, active, Arcium balance uninitialized, and MXE encrypted
         *
         * **Transfer Instruction Selection:**
         * The method selects the appropriate transfer instruction based on receiver account state:
         * - If token account's Arcium balance is initialized:
         *   - MXE encrypted → `buildExistingTokenTransferSolMxeInstruction` / `buildExistingTokenTransferSplMxeInstruction`
         *   - Shared → `buildExistingTokenTransferSolSharedInstruction` / `buildExistingTokenTransferSplSharedInstruction`
         * - If token account's Arcium balance is not initialized:
         *   - User account MXE encrypted → `buildNewTokenTransferSolMxeInstruction` / `buildNewTokenTransferSplMxeInstruction`
         *   - User account shared → `buildNewTokenTransferSolSharedInstruction` / `buildNewTokenTransferSplSharedInstruction`
         *
         * **Privacy Features:**
         * - Transfer amount is encrypted using Rescue cipher with X25519 key exchange
         * - Sender and receiver identities are protected
         * - Transfer details are processed within the Arcium Multi-Execution Environment (MXE)
         * - Supports both SOL (via WSOL) and SPL token transfers
         *
         * **Relayer Support:**
         * If no `relayerPublicKey` is provided, a random relayer is automatically selected using
         * {@link getRandomRelayerForwarder}. The relayer pays transaction fees on behalf of the
         * user, enabling gasless transfers.
         *
         * **Mode Options:**
         * - **Default / `'relayer'`** – Forwards the transaction to the specified relayer service and
         *   returns the resulting {@link SolanaTransactionSignature}.
         * - **`'prepared'`** – Returns an unsigned {@link VersionedTransaction} with a fresh blockhash
         *   so it can be passed to the relayer (or another submitter) for signing.
         * - **`'signed'`** – Returns a {@link VersionedTransaction} signed by the client's Umbra wallet.
         *   The relayer (or any fee payer) must still append its signature before broadcasting.
         * - **`'raw'`** – Returns a {@link VersionedTransaction} built with a fresh blockhash.
         *   The caller must ensure the same relayer key pair (or another designated fee payer) signs
         *   the transaction before submission.
         *
         * **Requirements:**
         * - An Umbra wallet must be set on the client via {@link setUmbraWallet}
         * - The wallet must have a valid rescue cipher initialized
         * - Sender accounts must exist and be in the correct state
         *
         * @param amount - The amount of tokens to transfer (encrypted using Rescue cipher)
         * @param destinationAddress - The destination address where tokens will be transferred
         * @param mintAddress - The mint address of the token being transferred. Use {@link WSOL_MINT_ADDRESS} for SOL transfers
         * @param opts - Optional configuration object containing:
         *   - `relayerPublicKey`: Optional public key of the relayer. If not provided, a random relayer is selected automatically.
         *   - `optionalData`: Optional SHA3 hash for additional data. If not provided, a zero hash is used.
         *   - `mode`: Transaction handling mode. Defaults to `'relayer'` for confidential transfers.
         *
         * @returns Depending on the `mode`, an object with:
         * - `generationIndex`: the {@link U256} index used to derive the random secret and nullifier.
         * - `relayerPublicKey`: the {@link SolanaAddress} of the relayer used for this deposit.
         * - `claimableBalance`: the {@link Amount} that can be claimed after deducting relayer and commission fees.
         * - `txReturnedData`: either a {@link SolanaTransactionSignature} (relayer mode) or a {@link VersionedTransaction}
         *   that can be further signed/submitted by the caller.
         *
         * @throws {@link UmbraClientError} When:
         * - No Umbra wallet is set on the client
         * - Sender public key is unavailable
         * - Rescue cipher is not initialized
         * - Sender user account does not exist or is not active
         * - Sender user account is MXE encrypted (must be in shared mode)
         * - Sender token account does not exist or is not active
         * - Sender token account is MXE encrypted (must be in shared mode)
         * - Sender user account requires SOL deposit
         * - Receiver user account exists but is not active
         * - Receiver token account exists but is not active
         * - Account decoding fails
         * - Rescue cipher encryption fails
         * - Instruction building fails
         * - Transaction building or forwarding fails
         * - Unable to resolve relayer public key
         *
         * @example
         * ```typescript
         * const client = UmbraClient.create('https://api.mainnet-beta.solana.com');
         * await client.setUmbraWallet(signer);
         *
         * // Transfer with automatic relayer selection and default mode
         * const signature = await client.transferConfidentially(
         *   1000000n, // 1 USDC with 6 decimals
         *   destinationAddress,
         *   usdcMintAddress
         * );
         *
         * // Transfer with specific relayer and optional data
         * const signature2 = await client.transferConfidentially(
         *   1000000000n, // 1 SOL
         *   destinationAddress,
         *   WSOL_MINT_ADDRESS,
         *   {
         *     relayerPublicKey: specificRelayerPublicKey,
         *     optionalData: optionalDataHash
         *   }
         * );
         *
         * // Get prepared transaction for custom handling
         * const preparedTx = await client.transferConfidentially(
         *   1000000n,
         *   destinationAddress,
         *   usdcMintAddress,
         *   {
         *     optionalData: optionalDataHash,
         *     mode: 'prepared'
         *   }
         * );
         * ```
         */
        public async transferConfidentially(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts?: TransferConfidentiallyOptions
        ): Promise<SolanaTransactionSignature | VersionedTransaction> {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Cannot transfer confidentially: Umbra wallet is not set. Call setUmbraWallet() first.'
                        );
                }

                const resolvedOptionalData = opts?.optionalData ?? ZERO_SHA3_HASH;
                const mode = opts?.mode ?? 'relayer';

                let resolvedRelayerPublicKey = opts?.relayerPublicKey;
                if (!resolvedRelayerPublicKey) {
                        const randomRelayer = await UmbraClient.getRandomRelayerForwarder();
                        resolvedRelayerPublicKey = randomRelayer.relayerPublicKey;
                }
                if (!resolvedRelayerPublicKey) {
                        throw new UmbraClientError('Unable to resolve relayer public key');
                }

                const senderPublicKey = await this.umbraWallet.signer.getPublicKey();
                if (!senderPublicKey) {
                        throw new UmbraClientError(
                                'Cannot transfer confidentially: sender public key is unavailable.'
                        );
                }

                const rescueCipher = this.umbraWallet.rescueCiphers.get(
                        MXE_ARCIUM_X25519_PUBLIC_KEY
                );
                if (!rescueCipher) {
                        throw new UmbraClientError(
                                'Cannot transfer confidentially: rescue cipher is not initialized.'
                        );
                }

                const [ciphertexts, nonce] = await rescueCipher.encrypt([amount]);
                if (!ciphertexts || !ciphertexts[0]) {
                        throw new UmbraClientError(
                                'Failed to encrypt transfer amount: rescue cipher returned no ciphertexts'
                        );
                }

                const senderArciumEncryptedUserAccountPda =
                        getArciumEncryptedUserAccountPda(senderPublicKey)!;
                const senderArciumEncryptedTokenAccountPda = getArciumEncryptedTokenAccountPda(
                        senderPublicKey,
                        mintAddress
                )!;
                const receiverArciumEncryptedUserAccountPda =
                        getArciumEncryptedUserAccountPda(destinationAddress)!;
                const receiverArciumEncryptedTokenAccountPda = getArciumEncryptedTokenAccountPda(
                        destinationAddress,
                        mintAddress
                )!;

                const [
                        senderArciumEncryptedUserAccountRawData,
                        senderArciumEncryptedTokenAccountRawData,
                        receiverArciumEncryptedUserAccountRawData,
                        receiverArciumEncryptedTokenAccountRawData,
                ] = await this.connectionBasedForwarder.connection.getMultipleAccountsInfo([
                        senderArciumEncryptedUserAccountPda,
                        senderArciumEncryptedTokenAccountPda,
                        receiverArciumEncryptedUserAccountPda,
                        receiverArciumEncryptedTokenAccountPda,
                ]);

                if (!senderArciumEncryptedUserAccountRawData) {
                        throw new UmbraClientError('Sender user account does not exist');
                }
                if (!senderArciumEncryptedTokenAccountRawData) {
                        throw new UmbraClientError('Sender token account does not exist');
                }

                let senderArciumEncryptedUserAccount: Awaited<
                        ReturnType<typeof this.program.account.arciumEncryptedUserAccount.fetch>
                >;
                let senderArciumEncryptedTokenAccount: Awaited<
                        ReturnType<typeof this.program.account.arciumEncryptedTokenAccount.fetch>
                >;
                try {
                        senderArciumEncryptedUserAccount = this.program.coder.accounts.decode(
                                'ArciumEncryptedUserAccount',
                                senderArciumEncryptedUserAccountRawData.data
                        );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to decode sender user account data: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                try {
                        senderArciumEncryptedTokenAccount = this.program.coder.accounts.decode(
                                'ArciumEncryptedTokenAccount',
                                senderArciumEncryptedTokenAccountRawData.data
                        );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to decode sender token account data: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                let receiverArciumEncryptedUserAccountStatusByte: number;
                if (receiverArciumEncryptedUserAccountRawData) {
                        try {
                                const receiverAccount = this.program.coder.accounts.decode(
                                        'ArciumEncryptedUserAccount',
                                        receiverArciumEncryptedUserAccountRawData.data
                                );
                                receiverArciumEncryptedUserAccountStatusByte =
                                        receiverAccount.status[0] ?? 0;
                        } catch (error) {
                                throw new UmbraClientError(
                                        `Failed to decode receiver user account data: ${
                                                error instanceof Error
                                                        ? error.message
                                                        : String(error)
                                        }`
                                );
                        }
                } else {
                        receiverArciumEncryptedUserAccountStatusByte = 0;
                }

                let receiverArciumEncryptedTokenAccountStatusByte: number;
                if (receiverArciumEncryptedTokenAccountRawData) {
                        try {
                                const receiverTokenAccount = this.program.coder.accounts.decode(
                                        'ArciumEncryptedTokenAccount',
                                        receiverArciumEncryptedTokenAccountRawData.data
                                );
                                receiverArciumEncryptedTokenAccountStatusByte =
                                        receiverTokenAccount.status[0] ?? 0;
                        } catch (error) {
                                throw new UmbraClientError(
                                        `Failed to decode receiver token account data: ${
                                                error instanceof Error
                                                        ? error.message
                                                        : String(error)
                                        }`
                                );
                        }
                } else {
                        receiverArciumEncryptedTokenAccountStatusByte = 0;
                }

                if (
                        !isBitSet(
                                senderArciumEncryptedUserAccount.status[0] ?? 0,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                        )
                ) {
                        throw new UmbraClientError('Sender user account is not active');
                }
                if (
                        isBitSet(
                                senderArciumEncryptedUserAccount.status[0] ?? 0,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                        )
                ) {
                        throw new UmbraClientError(
                                'Sender user account must be in shared mode (not MXE encrypted)'
                        );
                }
                if (
                        !isBitSet(
                                senderArciumEncryptedTokenAccount.status[0] ?? 0,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                        )
                ) {
                        throw new UmbraClientError('Sender token account is not active');
                }
                if (
                        isBitSet(
                                senderArciumEncryptedTokenAccount.status[0] ?? 0,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                        )
                ) {
                        throw new UmbraClientError(
                                'Sender token account must be in shared mode (not MXE encrypted)'
                        );
                }

                if (
                        isBitSet(
                                senderArciumEncryptedUserAccount.status[0] ?? 0,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_REQUIRES_SOL_DEPOSIT
                        )
                ) {
                        throw new UmbraClientError('Sender user account requires SOL deposit');
                }

                const instructions: Array<TransactionInstruction> = [];

                const isReceiverUserAccountInitialized = isBitSet(
                        receiverArciumEncryptedUserAccountStatusByte,
                        ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED
                );

                if (!isReceiverUserAccountInitialized) {
                        instructions.push(
                                await buildInitialiseArciumEncryptedUserAccountInstruction(
                                        {
                                                destinationAddress: destinationAddress,
                                                signer: resolvedRelayerPublicKey,
                                        },
                                        {
                                                optionalData: resolvedOptionalData,
                                        }
                                )
                        );
                        receiverArciumEncryptedUserAccountStatusByte =
                                UmbraClient.getDefaultInitializedUserAccountStatus()[0] ?? 0;
                } else if (
                        !isBitSet(
                                receiverArciumEncryptedUserAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                        )
                ) {
                        throw new UmbraClientError('Receiver user account is not active');
                }

                const isReceiverTokenAccountInitialized = isBitSet(
                        receiverArciumEncryptedTokenAccountStatusByte,
                        ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED
                );

                if (!isReceiverTokenAccountInitialized) {
                        instructions.push(
                                await buildInitialiseArciumEncryptedTokenAccountInstruction(
                                        {
                                                destinationAddress: destinationAddress,
                                                signer: resolvedRelayerPublicKey,
                                                mint: mintAddress,
                                        },
                                        {
                                                optionalData: resolvedOptionalData,
                                        }
                                )
                        );
                        receiverArciumEncryptedTokenAccountStatusByte =
                                UmbraClient.getDefaultInitializedTokenAccountStatus()[0] ?? 0;
                } else if (
                        !isBitSet(
                                receiverArciumEncryptedTokenAccountStatusByte,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                        )
                ) {
                        throw new UmbraClientError('Receiver token account is not active');
                }

                const isReceiverTokenAccountArciumBalanceInitialized = isBitSet(
                        receiverArciumEncryptedTokenAccountStatusByte,
                        ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_ARCIUM_BALANCE_INITIALISED
                );
                const isReceiverTokenAccountMxeEncrypted = isBitSet(
                        receiverArciumEncryptedTokenAccountStatusByte,
                        ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                );
                const isReceiverUserAccountMxeEncrypted = isBitSet(
                        receiverArciumEncryptedUserAccountStatusByte,
                        ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                );
                const isSolTransfer = mintAddress === WSOL_MINT_ADDRESS;
                const transferInstructionArgs = {
                        transferAmountCiphertext: ciphertexts[0]!,
                        transferAmountNonce: nonce,
                        optionalData: resolvedOptionalData,
                };

                if (isReceiverTokenAccountArciumBalanceInitialized) {
                        if (isReceiverTokenAccountMxeEncrypted) {
                                instructions.push(
                                        await (isSolTransfer
                                                ? buildExistingTokenTransferSolMxeInstruction(
                                                          {
                                                                  relayer: resolvedRelayerPublicKey,
                                                                  arciumSenderSigner:
                                                                          senderPublicKey,
                                                                  receiver: destinationAddress,
                                                          },
                                                          transferInstructionArgs
                                                  )
                                                : buildExistingTokenTransferSplMxeInstruction(
                                                          {
                                                                  relayer: resolvedRelayerPublicKey,
                                                                  arciumSenderSigner:
                                                                          senderPublicKey,
                                                                  receiver: destinationAddress,
                                                                  mint: mintAddress,
                                                          },
                                                          transferInstructionArgs
                                                  ))
                                );
                        } else {
                                instructions.push(
                                        await (isSolTransfer
                                                ? buildExistingTokenTransferSolSharedInstruction(
                                                          {
                                                                  relayer: resolvedRelayerPublicKey,
                                                                  arciumSenderSigner:
                                                                          senderPublicKey,
                                                                  receiver: destinationAddress,
                                                          },
                                                          transferInstructionArgs
                                                  )
                                                : buildExistingTokenTransferSplSharedInstruction(
                                                          {
                                                                  relayer: resolvedRelayerPublicKey,
                                                                  arciumSenderSigner:
                                                                          senderPublicKey,
                                                                  receiver: destinationAddress,
                                                                  mint: mintAddress,
                                                          },
                                                          transferInstructionArgs
                                                  ))
                                );
                        }
                } else if (isReceiverUserAccountMxeEncrypted) {
                        instructions.push(
                                await (isSolTransfer
                                        ? buildNewTokenTransferSolMxeInstruction(
                                                  {
                                                          relayer: resolvedRelayerPublicKey,
                                                          arciumSenderSigner: senderPublicKey,
                                                          receiver: destinationAddress,
                                                  },
                                                  transferInstructionArgs
                                          )
                                        : buildNewTokenTransferSplMxeInstruction(
                                                  {
                                                          relayer: resolvedRelayerPublicKey,
                                                          arciumSenderSigner: senderPublicKey,
                                                          receiver: destinationAddress,
                                                          mint: mintAddress,
                                                  },
                                                  transferInstructionArgs
                                          ))
                        );
                } else {
                        instructions.push(
                                await (isSolTransfer
                                        ? buildNewTokenTransferSolSharedInstruction(
                                                  {
                                                          relayer: resolvedRelayerPublicKey,
                                                          arciumSenderSigner: senderPublicKey,
                                                          receiver: destinationAddress,
                                                  },
                                                  transferInstructionArgs
                                          )
                                        : buildNewTokenTransferSplSharedInstruction(
                                                  {
                                                          relayer: resolvedRelayerPublicKey,
                                                          arciumSenderSigner: senderPublicKey,
                                                          receiver: destinationAddress,
                                                          mint: mintAddress,
                                                  },
                                                  transferInstructionArgs
                                          ))
                        );
                }

                if (mode === 'raw') {
                        const rawMessage = new TransactionMessage({
                                payerKey: resolvedRelayerPublicKey,
                                recentBlockhash: (
                                        await this.connectionBasedForwarder
                                                .getConnection()
                                                .getLatestBlockhash()
                                ).blockhash,
                                instructions,
                        }).compileToV0Message();

                        return new VersionedTransaction(rawMessage);
                }

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: resolvedRelayerPublicKey,
                        recentBlockhash: blockhash,
                        instructions,
                }).compileToV0Message();

                const preparedTransaction = new VersionedTransaction(transactionMessage);

                if (mode === 'prepared') {
                        return preparedTransaction;
                }

                try {
                        const transactionToSign = VersionedTransaction.deserialize(
                                preparedTransaction.serialize()
                        );
                        const signedTransaction =
                                await this.umbraWallet.signTransaction(transactionToSign);

                        if (mode === 'signed') {
                                return signedTransaction;
                        }

                        const relayerForwarder =
                                RelayerForwarder.fromPublicKey(resolvedRelayerPublicKey);
                        return await relayerForwarder.forwardTransaction(signedTransaction);
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to transfer confidentially: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }
        }

        /**
         * @internal
         *
         * SOL/WSOL-specific implementation invoked by {@link depositConfidentiallyIntoMixerPool}
         * when `mintAddress === WSOL_MINT_ADDRESS`.
         */
        private async depositConfidentiallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts?: DepositConfidentiallyOptions
        ): Promise<
                DepositConfidentiallyResult<SolanaTransactionSignature | T | VersionedTransaction>
        > {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Cannot deposit confidentially: Umbra wallet is not set. Call setUmbraWallet() first.'
                        );
                }

                if (!this.zkProver) {
                        throw new UmbraClientError(
                                'Cannot deposit confidentially: Zero-knowledge prover is not set. Call setZkProver() first.'
                        );
                }

                const masterViewingKey = this.umbraWallet.masterViewingKey;
                if (!masterViewingKey) {
                        throw new UmbraClientError(
                                'Cannot deposit confidentially: master viewing key is not available. The wallet may not be properly initialized.'
                        );
                }

                // Parse options with defaults
                const resolvedIndex = opts?.index ?? (generateRandomU256() as U256);
                const resolvedOptionalData = opts?.optionalData ?? ZERO_SHA3_HASH;
                const mode = opts?.mode ?? 'relayer';

                // Resolve relayer public key
                let resolvedRelayerPublicKey: SolanaAddress;
                if (opts?.relayerPublicKey) {
                        resolvedRelayerPublicKey = opts.relayerPublicKey;
                } else {
                        const randomRelayer = await UmbraClient.getRandomRelayerForwarder();
                        resolvedRelayerPublicKey = randomRelayer.relayerPublicKey;
                }

                if (!resolvedRelayerPublicKey) {
                        throw new UmbraClientError('Unable to resolve relayer public key');
                }

                const userAccountPda = getArciumEncryptedUserAccountPda(destinationAddress);
                const userTokenAccountPda = getArciumEncryptedTokenAccountPda(
                        destinationAddress,
                        mintAddress
                );

                const [userAccountRawData, userTokenAccountRawData] =
                        await this.connectionBasedForwarder.connection.getMultipleAccountsInfo([
                                userAccountPda,
                                userTokenAccountPda,
                        ]);

                if (!userAccountRawData) {
                        throw new UmbraClientError('User account does not exist');
                }
                if (!userTokenAccountRawData) {
                        throw new UmbraClientError('Token account does not exist');
                }

                let userAccountData;
                let userTokenAccountData;

                try {
                        userAccountData = this.program.coder.accounts.decode(
                                'ArciumEncryptedUserAccount',
                                userAccountRawData.data
                        );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to decode user account data: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                try {
                        userTokenAccountData = this.program.coder.accounts.decode(
                                'ArciumEncryptedTokenAccount',
                                userTokenAccountRawData.data
                        );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to decode token account data: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                const userAccountStatusByte = userAccountData.status[0] ?? 0;
                const tokenAccountStatusByte = userTokenAccountData.status[0] ?? 0;

                // Validate user account
                if (
                        !isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED
                        )
                ) {
                        throw new UmbraClientError('User account is not initialised');
                }

                if (
                        !isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                        )
                ) {
                        throw new UmbraClientError('User account is not active');
                }

                if (
                        !isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FOR_HAS_REGISTERED_MASTER_VIEWING_KEY
                        )
                ) {
                        throw new UmbraClientError(
                                'User account has not registered master viewing key'
                        );
                }

                if (
                        isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_REQUIRES_SOL_DEPOSIT
                        )
                ) {
                        throw new UmbraClientError('User account requires SOL deposit');
                }

                if (
                        isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                        )
                ) {
                        throw new UmbraClientError(
                                'User account must be in shared mode (not MXE encrypted)'
                        );
                }

                // Validate token account
                if (
                        !isBitSet(
                                tokenAccountStatusByte,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED
                        )
                ) {
                        throw new UmbraClientError('Token account is not initialised');
                }

                if (
                        !isBitSet(
                                tokenAccountStatusByte,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                        )
                ) {
                        throw new UmbraClientError('Token account is not active');
                }

                if (
                        isBitSet(
                                tokenAccountStatusByte,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                        )
                ) {
                        throw new UmbraClientError(
                                'Token account must be in shared mode (not MXE encrypted)'
                        );
                }

                const blindingFactor = generateRandomBlindingFactor();

                const sha3Commitment = sha3_256(
                        Uint8Array.from([
                                convertU128ToBeBytes(amount),
                                convertU128ToBeBytes(blindingFactor),
                        ]).reverse()
                ) as U256BeBytes;

                const rescueCipher = this.umbraWallet.rescueCiphers.get(
                        MXE_ARCIUM_X25519_PUBLIC_KEY
                );
                if (!rescueCipher) {
                        throw new UmbraClientError(
                                'Rescue cipher is not initialized. Cannot encrypt deposit amount.'
                        );
                }

                const [destinationAddressLow, destinationAddressHigh] =
                        breakPublicKeyIntoTwoParts(destinationAddress);

                const randomSecret = this.umbraWallet.generateRandomSecret(resolvedIndex);
                if (!randomSecret) {
                        throw new UmbraClientError(
                                'Failed to generate random secret. The wallet may not be properly initialized.'
                        );
                }

                const nullifier = this.umbraWallet.generateNullifier(resolvedIndex);
                if (!nullifier) {
                        throw new UmbraClientError(
                                'Failed to generate nullifier. The wallet may not be properly initialized.'
                        );
                }

                let feesConfiguration: {
                        relayerFees: Amount;
                        commissionFees: BasisPoints;
                        commissionFeesLowerBound: Amount;
                        commissionFeesUpperBound: Amount;
                };
                try {
                        feesConfiguration =
                                await this.getFeesConfigurationForDepositConfidentiallyIntoMixerPool(
                                        mintAddress,
                                        amount
                                );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to get fees configuration: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                if (amount < feesConfiguration.relayerFees) {
                        throw new UmbraClientError(
                                `Deposit amount (${amount}) is less than relayer fees (${feesConfiguration.relayerFees})`
                        );
                }

                const [ciphertexts, nonce] = await rescueCipher.encrypt([amount, blindingFactor]);
                if (!ciphertexts || ciphertexts.length < 2 || !nonce) {
                        throw new UmbraClientError(
                                'Invalid encryption result: missing ciphertexts or nonce'
                        );
                }

                if (!ciphertexts[0] || !ciphertexts[1]) {
                        throw new UmbraClientError(
                                'Invalid encryption result: missing ciphertexts'
                        );
                }

                const amountAfterRelayerFees = amount - feesConfiguration.relayerFees;
                const commissionFees =
                        (amountAfterRelayerFees * feesConfiguration.commissionFees) / 10000n;
                const remainder =
                        (amountAfterRelayerFees * feesConfiguration.commissionFees) % 10000n;

                const amountAfterCommissionFees = amountAfterRelayerFees - commissionFees;
                const claimableBalance = amountAfterCommissionFees as Amount;

                const time = Math.floor(Date.now() / 1000);
                const dateObj = new Date(time * 1000);
                const year = dateObj.getUTCFullYear();
                const month = dateObj.getUTCMonth() + 1;
                const day = dateObj.getUTCDate();
                const hour = dateObj.getUTCHours();
                const minute = dateObj.getUTCMinutes();
                const second = dateObj.getUTCSeconds();

                const linkerAddressHash = this.umbraWallet.generateCreateDepositLinkerHash(
                        'create_spl_deposit_with_hidden_amount',
                        BigInt(time) as Time,
                        destinationAddress
                );
                if (!linkerAddressHash) {
                        throw new UmbraClientError(
                                'Failed to generate linker hash. The wallet may not be properly initialized.'
                        );
                }

                const onChainMvkHash = PoseidonHasher.hash([
                        this.umbraWallet.masterViewingKey,
                        this.umbraWallet.masterViewingKeyPoseidonBlindingFactor,
                ]);

                const depositDataHash = PoseidonHasher.hash([
                        randomSecret,
                        nullifier,
                        claimableBalance,
                        this.umbraWallet.masterViewingKey,
                        destinationAddressLow,
                        destinationAddressHigh,
                ]);

                let proofA: Groth16ProofABeBytes;
                let proofB: Groth16ProofBBeBytes;
                let proofC: Groth16ProofCBeBytes;
                try {
                        [proofA, proofB, proofC] =
                                await this.zkProver.generateCreateSplDepositWithHiddenAmountProof(
                                        this.umbraWallet.masterViewingKey,
                                        this.umbraWallet.masterViewingKeyPoseidonBlindingFactor,
                                        destinationAddressLow,
                                        destinationAddressHigh,
                                        randomSecret,
                                        nullifier,
                                        amount,
                                        feesConfiguration.relayerFees,
                                        feesConfiguration.commissionFeesLowerBound,
                                        feesConfiguration.commissionFeesUpperBound,
                                        feesConfiguration.commissionFees,
                                        commissionFees as U128,
                                        remainder as U128,
                                        BigInt(year) as Year,
                                        BigInt(month) as Month,
                                        BigInt(day) as Day,
                                        BigInt(hour) as Hour,
                                        BigInt(minute) as Minute,
                                        BigInt(second) as Second,
                                        BigInt(year) as Year,
                                        BigInt(month) as Month,
                                        BigInt(day) as Day,
                                        BigInt(hour) as Hour,
                                        BigInt(minute) as Minute,
                                        BigInt(second) as Second,
                                        linkerAddressHash,
                                        depositDataHash,
                                        onChainMvkHash,
                                        aggregateSha3HashIntoSinglePoseidonRoot(
                                                Uint8Array.from(
                                                        sha3Commitment
                                                ).reverse() as Sha3Hash
                                        ),
                                        feesConfiguration.relayerFees,
                                        feesConfiguration.commissionFeesLowerBound,
                                        feesConfiguration.commissionFeesUpperBound,
                                        feesConfiguration.commissionFees
                                );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to generate zero-knowledge proof: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                if (!proofA || !proofB || !proofC) {
                        throw new UmbraClientError(
                                'Invalid zero-knowledge proof: missing proof components'
                        );
                }

                const arciumSignerPublicKey = await this.umbraWallet.signer.getPublicKey();
                if (!arciumSignerPublicKey) {
                        throw new UmbraClientError(
                                'Failed to get Arcium signer public key from wallet'
                        );
                }

                let depositInstruction: TransactionInstruction;
                try {
                        depositInstruction = await buildWithdrawIntoMixerPoolSolInstruction(
                                {
                                        arciumSigner: arciumSignerPublicKey,
                                        relayer: resolvedRelayerPublicKey,
                                },
                                {
                                        withdrawalAmountCiphertext: ciphertexts[0]!,
                                        withdrawalAmountBlindingFactor: ciphertexts[1]!,
                                        withdrawalAmountNonce: nonce,
                                        withdrawalAmountCommitment: Uint8Array.from(
                                                sha3Commitment
                                        ).reverse() as U256LeBytes,
                                        groth16ProofA: proofA,
                                        groth16ProofB: proofB,
                                        groth16ProofC: proofC,
                                        time: BigInt(time) as Time,
                                        linkerHash: linkerAddressHash,
                                        depositCommitment: depositDataHash,
                                        optionalData: resolvedOptionalData,
                                }
                        );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to build deposit instruction: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                const instructions: Array<TransactionInstruction> = [depositInstruction];

                if (mode === 'raw') {
                        const rawMessage = new TransactionMessage({
                                payerKey: resolvedRelayerPublicKey,
                                recentBlockhash: '11111111111111111111111111111111',
                                instructions,
                        }).compileToV0Message();

                        return {
                                generationIndex: resolvedIndex,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance,
                                txReturnedData: new VersionedTransaction(rawMessage),
                        };
                }

                let blockhash: string;
                try {
                        const blockhashResult = await this.connectionBasedForwarder
                                .getConnection()
                                .getLatestBlockhash();
                        blockhash = blockhashResult.blockhash;
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to get latest blockhash: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                const transactionMessage = new TransactionMessage({
                        payerKey: resolvedRelayerPublicKey,
                        recentBlockhash: blockhash,
                        instructions,
                }).compileToV0Message();

                const preparedTransaction = new VersionedTransaction(transactionMessage);

                if (mode === 'prepared') {
                        return {
                                generationIndex: resolvedIndex,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance,
                                txReturnedData: preparedTransaction,
                        };
                }

                try {
                        const transactionToSign = VersionedTransaction.deserialize(
                                preparedTransaction.serialize()
                        );
                        const signedTransaction =
                                await this.umbraWallet.signTransaction(transactionToSign);

                        if (mode === 'signed') {
                                return {
                                        generationIndex: resolvedIndex,
                                        relayerPublicKey: resolvedRelayerPublicKey,
                                        claimableBalance,
                                        txReturnedData: signedTransaction,
                                };
                        }

                        // mode === 'relayer'
                        const relayerForwarder =
                                RelayerForwarder.fromPublicKey(resolvedRelayerPublicKey);
                        return {
                                generationIndex: resolvedIndex,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance,
                                txReturnedData:
                                        await relayerForwarder.forwardTransaction(
                                                signedTransaction
                                        ),
                        };
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to deposit confidentially: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }
        }

        /**
         * Deposits SPL tokens confidentially into the Umbra mixer pool using encrypted amounts and zero-knowledge proofs.
         *
         * @remarks
         * This method enables private SPL token deposits into the mixer pool. The deposit amount is encrypted using
         * Rescue cipher, ensuring that only authorized parties can decrypt the deposit details. The method
         * generates a zero-knowledge proof to verify the deposit validity without revealing sensitive information.
         *
         * **Deposit Process:**
         * 1. Validates user and token accounts (must be initialized, active, and in shared mode)
         * 2. Encrypts the deposit amount and blinding factor using Rescue cipher
         * 3. Generates cryptographic values (random secret, nullifier) from the index
         * 4. Calculates fees (relayer fees and commission fees)
         * 5. Generates zero-knowledge proof for the deposit
         * 6. Builds deposit instruction and forwards transaction through relayer
         *
         * **Account Requirements:**
         * - User account must be initialized, active, have registered master viewing key, not require SOL deposit,
         *   and be in shared mode (not MXE encrypted)
         * - Token account must be initialized, active, and in shared mode (not MXE encrypted)
         *
         * **Privacy Features:**
         * - Deposit amount is encrypted using Rescue cipher with X25519 key exchange
         * - Zero-knowledge proof verifies deposit validity without revealing amount
         * - Blinding factor ensures commitment privacy
         * - Nullifier prevents double-spending
         * - Linker hash binds deposit to destination address and time
         *
         * **Relayer Support:**
         * If no `relayerPublicKey` is provided, a random relayer is automatically selected using
         * {@link getRandomRelayerForwarder}. The relayer pays transaction fees on behalf of the
         * user, enabling gasless deposits.
         *
         * **Index Generation:**
         * If no `index` is provided, a random index is generated using {@link generateRandomU256}.
         * The index is used to derive the random secret and nullifier deterministically.
         *
         * **Transaction Modes:**
         * The method supports different transaction handling modes via the `opts` parameter:
         * - `'relayer'` (default): Signs the transaction and forwards it through the relayer, returning a transaction signature
         * - `'prepared'`: Returns a prepared but unsigned {@link VersionedTransaction}
         * - `'signed'`: Returns a signed {@link VersionedTransaction} ready to be forwarded
         * - `'raw'`: Returns a raw {@link VersionedTransaction} with a dummy blockhash (for testing/estimation)
         *
         * **Requirements:**
         * - An Umbra wallet must be set on the client via {@link setUmbraWallet}
         * - A zero-knowledge prover must be set via {@link setZkProver}
         * - The wallet must have a valid master viewing key
         * - User and token accounts must exist and be in the correct state
         *
         * @param amount - The amount of SPL tokens to deposit (will be encrypted)
         * @param destinationAddress - The destination address where withdrawn funds should ultimately be sent
         * @param mintAddress - The mint address of the SPL token being deposited
         * @param opts - Optional configuration object containing:
         *   - `index`: Optional index used to derive random secret and nullifier. If not provided, a random index is generated.
         *   - `relayerPublicKey`: Optional public key of the relayer. If not provided, a random relayer is selected automatically.
         *   - `optionalData`: Optional SHA3 hash for additional data. If not provided, a zero hash is used.
         *   - `mode`: Transaction handling mode. Defaults to `'relayer'` for confidential deposits.
         *
         * @returns Depending on the `mode`, either a {@link SolanaTransactionSignature} (relayer mode)
         * or a {@link VersionedTransaction} that can be further signed / submitted by the caller.
         *
         * @throws {@link UmbraClientError} When:
         * - No Umbra wallet is set on the client
         * - No zero-knowledge prover is set on the client
         * - Master viewing key is unavailable
         * - User account does not exist or is not in the correct state
         * - Token account does not exist or is not in the correct state
         * - Account decoding fails
         * - Rescue cipher is not initialized
         * - Cryptographic value generation fails (random secret, nullifier, linker hash)
         * - Zero-knowledge proof generation fails or returns invalid results
         * - Instruction building fails
         * - Transaction building or forwarding fails
         * - Unable to resolve relayer public key
         *
         * @example
         * ```typescript
         * const client = UmbraClient.create('https://api.mainnet-beta.solana.com');
         * await client.setUmbraWallet(signer);
         * await client.setZkProver(zkProver);
         *
         * // Deposit with automatic index, relayer, and optionalData
         * const signature = await client.depositConfidentiallyIntoMixerPoolSpl(
         *   1000000n, // 1 USDC with 6 decimals
         *   destinationAddress,
         *   usdcMintAddress
         * );
         *
         * // Deposit with specific index and optionalData
         * const signature2 = await client.depositConfidentiallyIntoMixerPoolSpl(
         *   1000000n,
         *   destinationAddress,
         *   usdcMintAddress,
         *   {
         *     index: 42n,
         *     optionalData: optionalDataHash
         *   }
         * );
         *
         * // Deposit with specific relayer and mode
         * const preparedTx = await client.depositConfidentiallyIntoMixerPoolSpl(
         *   1000000n,
         *   destinationAddress,
         *   usdcMintAddress,
         *   {
         *     relayerPublicKey: specificRelayerPublicKey,
         *     mode: 'prepared'
         *   }
         * );
         *
         * // Deposit with signed transaction
         * const signedTx = await client.depositConfidentiallyIntoMixerPoolSpl(
         *   1000000n,
         *   destinationAddress,
         *   usdcMintAddress,
         *   {
         *     index: 42n,
         *     mode: 'signed'
         *   }
         * );
         * ```
         */
        public async depositConfidentiallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts?: DepositConfidentiallyOptions
        ): Promise<
                DepositConfidentiallyResult<SolanaTransactionSignature | T | VersionedTransaction>
        > {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Cannot deposit confidentially: Umbra wallet is not set. Call setUmbraWallet() first.'
                        );
                }

                if (!this.zkProver) {
                        throw new UmbraClientError(
                                'Cannot deposit confidentially: Zero-knowledge prover is not set. Call setZkProver() first.'
                        );
                }

                const masterViewingKey = this.umbraWallet.masterViewingKey;
                if (!masterViewingKey) {
                        throw new UmbraClientError(
                                'Cannot deposit confidentially: master viewing key is not available. The wallet may not be properly initialized.'
                        );
                }

                // Parse options with defaults
                const resolvedIndex = opts?.index ?? (generateRandomU256() as U256);
                const resolvedOptionalData = opts?.optionalData ?? ZERO_SHA3_HASH;
                const mode = opts?.mode ?? 'relayer';

                // Resolve relayer public key
                let resolvedRelayerPublicKey: SolanaAddress;
                if (opts?.relayerPublicKey) {
                        resolvedRelayerPublicKey = opts.relayerPublicKey;
                } else {
                        const randomRelayer = await UmbraClient.getRandomRelayerForwarder();
                        resolvedRelayerPublicKey = randomRelayer.relayerPublicKey;
                }

                if (!resolvedRelayerPublicKey) {
                        throw new UmbraClientError('Unable to resolve relayer public key');
                }

                const userAccountPda = getArciumEncryptedUserAccountPda(destinationAddress);
                const userTokenAccountPda = getArciumEncryptedTokenAccountPda(
                        destinationAddress,
                        mintAddress
                );

                const [userAccountRawData, userTokenAccountRawData] =
                        await this.connectionBasedForwarder.connection.getMultipleAccountsInfo([
                                userAccountPda,
                                userTokenAccountPda,
                        ]);

                if (!userAccountRawData) {
                        throw new UmbraClientError('User account does not exist');
                }
                if (!userTokenAccountRawData) {
                        throw new UmbraClientError('Token account does not exist');
                }

                let userAccountData;
                let userTokenAccountData;

                try {
                        userAccountData = this.program.coder.accounts.decode(
                                'ArciumEncryptedUserAccount',
                                userAccountRawData.data
                        );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to decode user account data: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                try {
                        userTokenAccountData = this.program.coder.accounts.decode(
                                'ArciumEncryptedTokenAccount',
                                userTokenAccountRawData.data
                        );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to decode token account data: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                const userAccountStatusByte = userAccountData.status[0] ?? 0;
                const tokenAccountStatusByte = userTokenAccountData.status[0] ?? 0;

                // Validate user account
                if (
                        !isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED
                        )
                ) {
                        throw new UmbraClientError('User account is not initialised');
                }

                if (
                        !isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                        )
                ) {
                        throw new UmbraClientError('User account is not active');
                }

                if (
                        !isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FOR_HAS_REGISTERED_MASTER_VIEWING_KEY
                        )
                ) {
                        throw new UmbraClientError(
                                'User account has not registered master viewing key'
                        );
                }

                if (
                        isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_REQUIRES_SOL_DEPOSIT
                        )
                ) {
                        throw new UmbraClientError('User account requires SOL deposit');
                }

                if (
                        isBitSet(
                                userAccountStatusByte,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                        )
                ) {
                        throw new UmbraClientError(
                                'User account must be in shared mode (not MXE encrypted)'
                        );
                }

                // Validate token account
                if (
                        !isBitSet(
                                tokenAccountStatusByte,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED
                        )
                ) {
                        throw new UmbraClientError('Token account is not initialised');
                }

                if (
                        !isBitSet(
                                tokenAccountStatusByte,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                        )
                ) {
                        throw new UmbraClientError('Token account is not active');
                }

                if (
                        isBitSet(
                                tokenAccountStatusByte,
                                ARCIUM_ENCRYPTED_TOKEN_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                        )
                ) {
                        throw new UmbraClientError(
                                'Token account must be in shared mode (not MXE encrypted)'
                        );
                }

                const blindingFactor = generateRandomBlindingFactor();

                const sha3Commitment = sha3_256(
                        Uint8Array.from([
                                convertU128ToBeBytes(amount),
                                convertU128ToBeBytes(blindingFactor),
                        ]).reverse()
                ) as U256BeBytes;

                const rescueCipher = this.umbraWallet.rescueCiphers.get(
                        MXE_ARCIUM_X25519_PUBLIC_KEY
                );
                if (!rescueCipher) {
                        throw new UmbraClientError(
                                'Rescue cipher is not initialized. Cannot encrypt deposit amount.'
                        );
                }

                let ciphertexts: Array<RescueCiphertext>;
                let nonce: U128;
                try {
                        [ciphertexts, nonce] = await rescueCipher.encrypt([amount, blindingFactor]);
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to encrypt deposit amount: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                if (!ciphertexts || ciphertexts.length < 2 || !nonce) {
                        throw new UmbraClientError(
                                'Invalid encryption result: missing ciphertexts or nonce'
                        );
                }

                const [destinationAddressLow, destinationAddressHigh] =
                        breakPublicKeyIntoTwoParts(destinationAddress);

                const randomSecret = this.umbraWallet.generateRandomSecret(resolvedIndex);
                if (!randomSecret) {
                        throw new UmbraClientError(
                                'Failed to generate random secret. The wallet may not be properly initialized.'
                        );
                }

                const nullifier = this.umbraWallet.generateNullifier(resolvedIndex);
                if (!nullifier) {
                        throw new UmbraClientError(
                                'Failed to generate nullifier. The wallet may not be properly initialized.'
                        );
                }

                let feesConfiguration: {
                        relayerFees: Amount;
                        commissionFees: BasisPoints;
                        commissionFeesLowerBound: Amount;
                        commissionFeesUpperBound: Amount;
                };
                try {
                        feesConfiguration =
                                await this.getFeesConfigurationForDepositConfidentiallyIntoMixerPool(
                                        mintAddress,
                                        amount
                                );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to get fees configuration: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                if (amount < feesConfiguration.relayerFees) {
                        throw new UmbraClientError(
                                `Deposit amount (${amount}) is less than relayer fees (${feesConfiguration.relayerFees})`
                        );
                }

                const commissionFees = (amount * feesConfiguration.commissionFees) / 10000n;
                const remainder = (amount * feesConfiguration.commissionFees) % 10000n;

                const amountAfterCommissionFees = amount - commissionFees;
                const claimableBalance = amountAfterCommissionFees as Amount;

                const time = Math.floor(Date.now() / 1000);
                const dateObj = new Date(time * 1000);
                const year = dateObj.getUTCFullYear();
                const month = dateObj.getUTCMonth() + 1;
                const day = dateObj.getUTCDate();
                const hour = dateObj.getUTCHours();
                const minute = dateObj.getUTCMinutes();
                const second = dateObj.getUTCSeconds();

                const linkerAddressHash = this.umbraWallet.generateCreateDepositLinkerHash(
                        'create_spl_deposit_with_hidden_amount',
                        BigInt(time) as Time,
                        destinationAddress
                );
                if (!linkerAddressHash) {
                        throw new UmbraClientError(
                                'Failed to generate linker hash. The wallet may not be properly initialized.'
                        );
                }

                const onChainMvkHash = PoseidonHasher.hash([
                        this.umbraWallet.masterViewingKey,
                        this.umbraWallet.masterViewingKeyPoseidonBlindingFactor,
                ]);

                const depositDataHash = PoseidonHasher.hash([
                        randomSecret,
                        nullifier,
                        claimableBalance,
                        claimableBalance,
                        this.umbraWallet.masterViewingKey,
                        destinationAddressLow,
                        destinationAddressHigh,
                ]);

                let proofA: Groth16ProofABeBytes;
                let proofB: Groth16ProofBBeBytes;
                let proofC: Groth16ProofCBeBytes;
                try {
                        [proofA, proofB, proofC] =
                                await this.zkProver.generateCreateSplDepositWithHiddenAmountProof(
                                        this.umbraWallet.masterViewingKey,
                                        this.umbraWallet.masterViewingKeyPoseidonBlindingFactor,
                                        destinationAddressLow,
                                        destinationAddressHigh,
                                        randomSecret,
                                        nullifier,
                                        amount,
                                        BigInt(0) as U128,
                                        feesConfiguration.commissionFeesLowerBound,
                                        feesConfiguration.commissionFeesUpperBound,
                                        feesConfiguration.commissionFees,
                                        commissionFees as U128,
                                        remainder as U128,
                                        BigInt(year) as Year,
                                        BigInt(month) as Month,
                                        BigInt(day) as Day,
                                        BigInt(hour) as Hour,
                                        BigInt(minute) as Minute,
                                        BigInt(second) as Second,
                                        BigInt(year) as Year,
                                        BigInt(month) as Month,
                                        BigInt(day) as Day,
                                        BigInt(hour) as Hour,
                                        BigInt(minute) as Minute,
                                        BigInt(second) as Second,
                                        linkerAddressHash,
                                        depositDataHash,
                                        onChainMvkHash,
                                        aggregateSha3HashIntoSinglePoseidonRoot(
                                                Uint8Array.from(
                                                        sha3Commitment
                                                ).reverse() as Sha3Hash
                                        ),
                                        feesConfiguration.relayerFees,
                                        feesConfiguration.commissionFeesLowerBound,
                                        feesConfiguration.commissionFeesUpperBound,
                                        feesConfiguration.commissionFees
                                );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to generate zero-knowledge proof: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                if (!proofA || !proofB || !proofC) {
                        throw new UmbraClientError(
                                'Invalid zero-knowledge proof: missing proof components'
                        );
                }

                const arciumSignerPublicKey = await this.umbraWallet.signer.getPublicKey();
                if (!arciumSignerPublicKey) {
                        throw new UmbraClientError(
                                'Failed to get Arcium signer public key from wallet'
                        );
                }

                let depositInstruction: TransactionInstruction;
                try {
                        depositInstruction = await buildWithdrawIntoMixerPoolSplInstruction(
                                {
                                        arciumSigner: arciumSignerPublicKey,
                                        relayer: resolvedRelayerPublicKey,
                                        mint: mintAddress,
                                },
                                {
                                        withdrawalAmountCiphertext: ciphertexts[0]!,
                                        withdrawalAmountBlindingFactor: ciphertexts[1]!,
                                        withdrawalAmountNonce: nonce,
                                        withdrawalAmountCommitment: Uint8Array.from(
                                                sha3Commitment
                                        ).reverse() as Sha3Hash,
                                        groth16ProofA: proofA,
                                        groth16ProofB: proofB,
                                        groth16ProofC: proofC,
                                        time: BigInt(time) as Time,
                                        linkerHash: linkerAddressHash,
                                        depositCommitment: depositDataHash,
                                        optionalData: resolvedOptionalData,
                                }
                        );
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to build deposit instruction: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                const instructions: Array<TransactionInstruction> = [depositInstruction];

                if (mode === 'raw') {
                        const rawMessage = new TransactionMessage({
                                payerKey: resolvedRelayerPublicKey,
                                recentBlockhash: '11111111111111111111111111111111',
                                instructions,
                        }).compileToV0Message();

                        return {
                                generationIndex: resolvedIndex,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance,
                                txReturnedData: new VersionedTransaction(rawMessage),
                        };
                }

                let blockhash: string;
                try {
                        const blockhashResult = await this.connectionBasedForwarder
                                .getConnection()
                                .getLatestBlockhash();
                        blockhash = blockhashResult.blockhash;
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to get latest blockhash: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                const transactionMessage = new TransactionMessage({
                        payerKey: resolvedRelayerPublicKey,
                        recentBlockhash: blockhash,
                        instructions,
                }).compileToV0Message();

                const preparedTransaction = new VersionedTransaction(transactionMessage);

                if (mode === 'prepared') {
                        return {
                                generationIndex: resolvedIndex,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance,
                                txReturnedData: preparedTransaction,
                        };
                }

                try {
                        const transactionToSign = VersionedTransaction.deserialize(
                                preparedTransaction.serialize()
                        );
                        const signedTransaction =
                                await this.umbraWallet.signTransaction(transactionToSign);

                        if (mode === 'signed') {
                                return {
                                        generationIndex: resolvedIndex,
                                        relayerPublicKey: resolvedRelayerPublicKey,
                                        claimableBalance,
                                        txReturnedData: signedTransaction,
                                };
                        }

                        // mode === 'relayer'
                        const relayerForwarder =
                                RelayerForwarder.fromPublicKey(resolvedRelayerPublicKey);
                        return {
                                generationIndex: resolvedIndex,
                                relayerPublicKey: resolvedRelayerPublicKey,
                                claimableBalance,
                                txReturnedData:
                                        await relayerForwarder.forwardTransaction(
                                                signedTransaction
                                        ),
                        };
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to deposit confidentially: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }
        }

        /**
         * Convenience wrapper that deposits either SOL (via {@link WSOL_MINT_ADDRESS}) or SPL tokens
         * confidentially into the Umbra mixer pool. Internally delegates to
         * {@link depositConfidentiallyIntoMixerPoolSol} when the mint is `WSOL_MINT_ADDRESS` and to
         * {@link depositConfidentiallyIntoMixerPoolSpl} for every other mint.
         *
         * @param amount - Amount to deposit (encrypted when routed through the SPL path).
         * @param destinationAddress - The destination address where withdrawn funds should ultimately be sent.
         * @param mintAddress - SPL mint address for the asset being deposited.
         * @param opts - Optional configuration object; passed through to the underlying implementation.
         *
         * @returns A {@link DepositConfidentiallyResult} containing the generation index, relayer public key,
         * claimable balance after fees, and mode-dependent transaction data.
         */
        public async depositConfidentiallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts?: DepositConfidentiallyOptions
        ): Promise<
                DepositConfidentiallyResult<SolanaTransactionSignature | T | VersionedTransaction>
        > {
                if (mintAddress === WSOL_MINT_ADDRESS) {
                        return this.depositConfidentiallyIntoMixerPoolSol(
                                amount,
                                destinationAddress,
                                mintAddress,
                                opts
                        );
                }

                return this.depositConfidentiallyIntoMixerPoolSpl(
                        amount,
                        destinationAddress,
                        mintAddress,
                        opts
                );
        }

        public async claimPubliclyFromMixerPoolSol(
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                claimDepositArtifacts: ClaimDepositArtifacts,
                opts?: {
                        optionalData?: Sha3Hash;
                        mode?: 'relayer' | 'forwarder' | 'signed' | 'prepared' | 'raw';
                }
        ): Promise<SolanaTransactionSignature | T | VersionedTransaction> {
                const mode = opts?.mode ?? 'relayer';
                const destinationArciumUserAccount =
                        getArciumEncryptedUserAccountPda(destinationAddress);

                let destinationArciumUserAccountStatus = 0;
                let destinationUserAccountExists = true;

                try {
                        const destinationArciumUserAccountData =
                                await this.program.account.arciumEncryptedUserAccount.fetch(
                                        destinationArciumUserAccount
                                );
                        destinationArciumUserAccountStatus =
                                destinationArciumUserAccountData.status[0];
                } catch {
                        destinationUserAccountExists = false;
                }

                const destinationUserAccountInitialised =
                        destinationUserAccountExists &&
                        isBitSet(
                                destinationArciumUserAccountStatus,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_INITIALISED
                        );

                if (
                        destinationUserAccountInitialised &&
                        !isBitSet(
                                destinationArciumUserAccountStatus,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_ACTIVE
                        )
                ) {
                        throw new UmbraClientError(
                                'Destination user account must be active before claiming publicly from the mixer pool.'
                        );
                }

                const destinationUserAccountIsMxeEncrypted =
                        !destinationUserAccountInitialised ||
                        isBitSet(
                                destinationArciumUserAccountStatus,
                                ARCIUM_ENCRYPTED_USER_ACCOUNT_FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                        );

                const nullifier = this.umbraWallet!.generateNullifier(
                        claimDepositArtifacts.generationIndex
                );
                const nullifierHash = PoseidonHasher.hash([nullifier]);

                const randomSecret = this.umbraWallet!.generateRandomSecret(
                        claimDepositArtifacts.generationIndex
                );

                const linkerHash = this.umbraWallet!.generateClaimDepositLinkerHash(
                        'claim_spl_deposit_with_public_amount',
                        claimDepositArtifacts.time,
                        claimDepositArtifacts.commitmentInsertionIndex
                );

                const {
                        siblings: merkleSiblingPathElements,
                        siblingPathIndices: merkleSiblingPathIndices,
                        merkleRoot,
                } = await this.getMerkleSiblingPathElements(
                        claimDepositArtifacts.commitmentInsertionIndex
                );

                const randomBlindingFactor = generateRandomBlindingFactor();
                const ephemeralKeypair = this.generateEphemeralKeypair(
                        claimDepositArtifacts.generationIndex
                );

                const [destinationAddressLow, destinationAddressHigh] =
                        breakPublicKeyIntoTwoParts(destinationAddress);

                const userPublicKey = await this.umbraWallet!.signer.getPublicKey();

                const [userPublicKeyLow, userPublicKeyHigh] =
                        breakPublicKeyIntoTwoParts(userPublicKey);
                const [mintPublicKeyLow, mintPublicKeyHigh] = breakPublicKeyIntoTwoParts(
                        mintAddress as unknown as SolanaAddress
                );
                const [relayerPublicKeyLow, relayerPublicKeyHigh] = breakPublicKeyIntoTwoParts(
                        claimDepositArtifacts.relayerPublicKey
                );

                const dateObj = new Date(Number(claimDepositArtifacts.time) * 1000);
                const year = dateObj.getUTCFullYear();
                const month = dateObj.getUTCMonth() + 1; // Months are zero-based
                const day = dateObj.getUTCDate();
                const hour = dateObj.getUTCHours();
                const minute = dateObj.getUTCMinutes();
                const second = dateObj.getUTCSeconds();

                const sha3Commitment = sha3_256(
                        Uint8Array.from([
                                ...convertU128ToBeBytes(userPublicKeyLow),
                                ...convertU128ToBeBytes(userPublicKeyHigh),
                                ...convertU128ToBeBytes(randomBlindingFactor),
                        ]).reverse()
                ) as U256BeBytes;

                const [proofA, proofB, proofC] = await this.zkProver!.generateClaimSplDepositProof(
                        randomSecret,
                        nullifier,
                        this.umbraWallet!.masterViewingKey,
                        merkleSiblingPathElements,
                        merkleSiblingPathIndices,
                        BigInt(1) as U8,
                        claimDepositArtifacts.commitmentInsertionIndex as unknown as U128,
                        destinationAddressLow,
                        destinationAddressHigh,
                        userPublicKeyLow,
                        userPublicKeyHigh,
                        BigInt(0) as U8,
                        claimDepositArtifacts.claimableBalance,
                        BigInt(year) as Year,
                        BigInt(month) as Month,
                        BigInt(day) as Day,
                        BigInt(hour) as Hour,
                        BigInt(minute) as Minute,
                        BigInt(second) as Second,
                        mintPublicKeyLow,
                        mintPublicKeyHigh,
                        randomBlindingFactor,
                        relayerPublicKeyLow,
                        relayerPublicKeyHigh,
                        BigInt(1) as U8,
                        BigInt(0) as U8,
                        destinationAddressLow,
                        destinationAddressHigh,
                        claimDepositArtifacts.claimableBalance,
                        mintPublicKeyLow,
                        mintPublicKeyHigh,
                        merkleRoot,
                        linkerHash,
                        nullifierHash,
                        aggregateSha3HashIntoSinglePoseidonRoot(
                                Uint8Array.from(sha3Commitment).reverse() as Sha3Hash
                        ),
                        relayerPublicKeyLow,
                        relayerPublicKeyHigh
                );

                const { x25519PrivateKey, x25519PublicKey } =
                        this.generateEphemeralArciumX25519PublicKey(
                                claimDepositArtifacts.generationIndex
                        );

                const rescueCipher = RescueCipher.fromX25519Pair(
                        x25519PrivateKey,
                        MXE_ARCIUM_X25519_PUBLIC_KEY
                );
                const [ciphertexts, nonce] = await rescueCipher.encrypt([
                        userPublicKeyLow,
                        userPublicKeyHigh,
                        randomBlindingFactor,
                ]);

                const optionalData = opts?.optionalData ?? ZERO_SHA3_HASH;
                const noteCommitment = Uint8Array.from(sha3Commitment).reverse() as Sha3Hash;

                const instructions: Array<TransactionInstruction> = [];

                if (destinationUserAccountInitialised && !destinationUserAccountIsMxeEncrypted) {
                        instructions.push(
                                await buildWithdrawFromMixerSharedInstruction(
                                        {
                                                relayer: claimDepositArtifacts.relayerPublicKey,
                                                destinationAddress,
                                                mint: mintAddress,
                                                ephemeralPublicKey:
                                                        ephemeralKeypair.publicKey as unknown as SolanaAddress,
                                        },
                                        {
                                                expectednullifierHash: nullifierHash,
                                                expectedMerkleRoot: merkleRoot,
                                                expectedLinkerAddressHash: linkerHash,
                                                groth16ProofA: proofA,
                                                groth16ProofB: proofB,
                                                groth16ProofC: proofC,
                                                ephemeralArcisPublicKey: x25519PublicKey,
                                                nonce,
                                                note_creator_address_part1_ciphertext:
                                                        ciphertexts[0]!,
                                                note_creator_address_part2_ciphertext:
                                                        ciphertexts[1]!,
                                                blinding_factor_ciphertext: ciphertexts[2]!,
                                                note_creator_address_commitment: noteCommitment,
                                                amount_to_withdraw:
                                                        claimDepositArtifacts.claimableBalance,
                                                optionalData,
                                        }
                                )
                        );
                } else {
                        instructions.push(
                                await buildWithdrawFromMixerMxeInstruction(
                                        {
                                                relayer: claimDepositArtifacts.relayerPublicKey,
                                                destinationAddress,
                                                mint: mintAddress,
                                                ephemeralPublicKey:
                                                        ephemeralKeypair.publicKey as unknown as SolanaAddress,
                                        },
                                        {
                                                expectednullifierHash: nullifierHash,
                                                expectedMerkleRoot: merkleRoot,
                                                expectedLinkerAddressHash: linkerHash,
                                                groth16ProofA: proofA,
                                                groth16ProofB: proofB,
                                                groth16ProofC: proofC,
                                                ephemeralArcisPublicKey: x25519PublicKey,
                                                nonce,
                                                noteRecipientAddressPart1Ciphertext:
                                                        ciphertexts[0]!,
                                                noteRecipientAddressPart2Ciphertext:
                                                        ciphertexts[1]!,
                                                noteRecipientBlindingFactorCiphertext:
                                                        ciphertexts[2]!,
                                                noteRecipientAddressCommitment: noteCommitment,
                                                amountToWithdraw:
                                                        claimDepositArtifacts.claimableBalance,
                                                optionalData,
                                        }
                                )
                        );
                }

                if (mode === 'raw') {
                        const rawMessage = new TransactionMessage({
                                payerKey: claimDepositArtifacts.relayerPublicKey,
                                recentBlockhash: '11111111111111111111111111111111',
                                instructions,
                        }).compileToV0Message();

                        return new VersionedTransaction(rawMessage);
                }

                const { blockhash } = await this.connectionBasedForwarder
                        .getConnection()
                        .getLatestBlockhash();

                const transactionMessage = new TransactionMessage({
                        payerKey: claimDepositArtifacts.relayerPublicKey,
                        recentBlockhash: blockhash,
                        instructions,
                }).compileToV0Message();

                const preparedTransaction = new VersionedTransaction(transactionMessage);

                if (mode === 'prepared') {
                        return preparedTransaction;
                }

                const transactionToSign = VersionedTransaction.deserialize(
                        preparedTransaction.serialize()
                );
                transactionToSign.sign([ephemeralKeypair]);

                if (mode === 'signed') {
                        return transactionToSign;
                }

                if (mode === 'forwarder') {
                        if (!this.txForwarder) {
                                throw new UmbraClientError(
                                        'No transaction forwarder configured on UmbraClient'
                                );
                        }

                        return await this.txForwarder.forwardTransaction(transactionToSign);
                }

                return await RelayerForwarder.fromPublicKey(
                        claimDepositArtifacts.relayerPublicKey
                ).forwardTransaction(transactionToSign);
        }

        /**
         * Retrieves the commission-fee slab configuration for confidential mixer-claim transactions.
         *
         * @remarks
         * The confidential-claim path requires the relayer to know the commission fee percentage
         * (expressed in basis points) as well as the amount range (lower and upper bounds) that
         * correspond to the slab being used. This helper will eventually return that metadata so
         * callers can:
         *
         * - Embed the same values inside the zero-knowledge proof inputs.
         * - Ensure the on-chain program enforces the same configuration when validating the proof.
         *
         * The current implementation is a placeholder and always throws because the indexed fee
         * configuration service has not been implemented yet.
         *
         * @param _mintAddress - SPL mint whose configuration should be fetched.
         * @param _amount - Claimed amount that determines which fee slab applies.
         *
         * @returns A promise that resolves to the commission fee metadata (basis points plus lower/
         * upper bounds) once implemented.
         *
         * @throws {@link UmbraClientError} Always for now, until the configuration source exists.
         */
        public static async getFeesConfigurationForClaimDepositConfidentiallyFromMixerPool(
                _mintAddress: MintAddress,
                _amount: Amount
        ): Promise<{
                commissionFees: BasisPoints;
                commissionFeesLowerBound: Amount;
                commissionFeesUpperBound: Amount;
        }> {
                return {
                        commissionFees: BigInt(0) as U16,
                        commissionFeesLowerBound: BigInt(0) as U128,
                        commissionFeesUpperBound: BigInt(2 ** 64 - 1) as U128,
                };
        }

        public async getFeesConfigurationForDepositConfidentiallyIntoMixerPool(
                _mintAddress: MintAddress,
                _amount: Amount
        ): Promise<{
                relayerFees: Amount;
                commissionFees: BasisPoints;
                commissionFeesLowerBound: Amount;
                commissionFeesUpperBound: Amount;
        }> {
                return {
                        relayerFees: BigInt(0) as U128,
                        commissionFees: BigInt(0) as U16,
                        commissionFeesLowerBound: BigInt(0) as U128,
                        commissionFeesUpperBound: BigInt(2 ** 64 - 1) as U128,
                };
        }

        /**
         * Generates an ephemeral Solana keypair deterministically from a master viewing key and index.
         *
         * @remarks
         * This method derives a unique ephemeral keypair for each index value using a two-step
         * KMAC256-based key derivation process:
         * 1. First, it derives a domain-separated seed from the master viewing key using the
         *    domain separator "Umbra Privacy - Ephemeral Keypair Seed"
         * 2. Then, it derives the final ephemeral keypair seed by hashing the index with the
         *    domain-separated seed
         *
         * The resulting keypair is deterministic: the same master viewing key and index will
         * always produce the same keypair. This enables applications to generate ephemeral
         * keypairs for privacy-preserving operations without storing them explicitly.
         *
         * **Requirements:**
         * - An Umbra wallet must be set on the client via {@link setUmbraWallet}
         * - The wallet must have a valid master viewing key
         *
         * @param index - A 256-bit unsigned integer used as an index for keypair derivation.
         *                Different index values will produce different keypairs.
         *
         * @returns A Solana `Keypair` instance derived from the master viewing key and index
         *
         * @throws {@link UmbraClientError} When:
         * - No Umbra wallet is set on the client (`umbraWallet` is undefined)
         * - The wallet's master viewing key is undefined or invalid
         * - Key derivation fails (e.g., due to cryptographic operation errors)
         * - Keypair creation fails (e.g., due to invalid seed length or format)
         *
         * @example
         * ```typescript
         * const client = UmbraClient.create('https://api.mainnet-beta.solana.com');
         * await client.setUmbraWallet(signer);
         *
         * // Generate an ephemeral keypair for index 0
         * const keypair0 = client.generateEphemeralKeypair(0n);
         *
         * // Generate a different ephemeral keypair for index 1
         * const keypair1 = client.generateEphemeralKeypair(1n);
         *
         * // The same index will always produce the same keypair
         * const keypair0Again = client.generateEphemeralKeypair(0n);
         * console.log(keypair0.publicKey.equals(keypair0Again.publicKey)); // true
         * ```
         */
        public generateEphemeralKeypair(index: U256): Keypair {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Cannot generate ephemeral keypair: Umbra wallet is not set. Call setUmbraWallet() first.'
                        );
                }

                const masterViewingKey = this.umbraWallet.masterViewingKey;
                if (!masterViewingKey) {
                        throw new UmbraClientError(
                                'Cannot generate ephemeral keypair: master viewing key is not available. The wallet may not be properly initialized.'
                        );
                }

                try {
                        const domainSeparatedSeed = kmac256(
                                new TextEncoder().encode('Umbra Privacy - Ephemeral Keypair Seed'),
                                convertU128ToLeBytes(masterViewingKey)
                        ) as U256LeBytes;

                        const ephemeralKeypairSeed = kmac256(
                                convertU256ToLeBytes(index),
                                domainSeparatedSeed
                        ) as U256LeBytes;

                        const ephemeralKeypair = Keypair.fromSecretKey(ephemeralKeypairSeed);

                        return ephemeralKeypair;
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to generate ephemeral keypair: ${error instanceof Error ? error.message : String(error)}`
                        );
                }
        }

        /**
         * Generates an ephemeral X25519 key pair deterministically from a master viewing key and index.
         *
         * @remarks
         * This method derives a unique ephemeral X25519 key pair for each index value using a two-step
         * KMAC256-based key derivation process:
         * 1. First, it derives a domain-separated seed from the master viewing key using the
         *    domain separator "Umbra Privacy - Ephemeral Arcium X25519 Public Key Seed"
         * 2. Then, it derives the final ephemeral X25519 secret key seed by hashing the index with the
         *    domain-separated seed
         * 3. The derived seed (first 32 bytes) is used directly as the X25519 private key
         * 4. The corresponding public key is computed using X25519 scalar multiplication
         *
         * The resulting key pair is deterministic: the same master viewing key and index will
         * always produce the same X25519 key pair. This enables applications to generate ephemeral
         * X25519 keys for privacy-preserving operations (such as establishing Rescue cipher shared
         * secrets) without storing them explicitly.
         *
         * **Requirements:**
         * - An Umbra wallet must be set on the client via {@link setUmbraWallet}
         * - The wallet must have a valid master viewing key
         *
         * **Use Cases:**
         * Ephemeral X25519 key pairs are commonly used for:
         * - Establishing temporary encrypted communication channels
         * - Creating one-time Rescue cipher instances for specific operations
         * - Privacy-preserving key exchange protocols
         *
         * @param index - A 256-bit unsigned integer used as an index for key pair derivation.
         *                Different index values will produce different key pairs.
         *
         * @returns An object containing:
         * - `x25519PrivateKey`: The derived X25519 secret key (32 bytes)
         * - `x25519PublicKey`: The corresponding X25519 public key (32 bytes)
         *
         * @throws {@link UmbraClientError} When:
         * - No Umbra wallet is set on the client (`umbraWallet` is undefined)
         * - The wallet's master viewing key is undefined or invalid
         * - Key derivation fails (e.g., due to cryptographic operation errors)
         * - X25519 key pair generation fails (e.g., due to invalid key material)
         *
         * @example
         * ```typescript
         * const client = UmbraClient.create('https://api.mainnet-beta.solana.com');
         * await client.setUmbraWallet(signer);
         *
         * // Generate an ephemeral X25519 key pair for index 0
         * const { x25519PrivateKey, x25519PublicKey } = client.generateEphemeralArciumX25519PublicKey(0n);
         *
         * // Use the public key to establish a Rescue cipher with another party
         * const cipher = RescueCipher.fromX25519Pair(x25519PrivateKey, otherPartyPublicKey);
         *
         * // Generate a different key pair for index 1
         * const keyPair1 = client.generateEphemeralArciumX25519PublicKey(1n);
         *
         * // The same index will always produce the same key pair
         * const keyPair0Again = client.generateEphemeralArciumX25519PublicKey(0n);
         * // Compare public keys byte-by-byte
         * const keysMatch = keyPair0Again.x25519PublicKey.every(
         *   (byte, i) => byte === x25519PublicKey[i]
         * );
         * console.log(keysMatch); // true
         * ```
         */
        public generateEphemeralArciumX25519PublicKey(index: U256): {
                x25519PrivateKey: ArciumX25519SecretKey;
                x25519PublicKey: ArciumX25519PublicKey;
        } {
                if (!this.umbraWallet) {
                        throw new UmbraClientError(
                                'Cannot generate ephemeral X25519 key pair: Umbra wallet is not set. Call setUmbraWallet() first.'
                        );
                }

                const masterViewingKey = this.umbraWallet.masterViewingKey;
                if (!masterViewingKey) {
                        throw new UmbraClientError(
                                'Cannot generate ephemeral X25519 key pair: master viewing key is not available. The wallet may not be properly initialized.'
                        );
                }

                try {
                        const domainSeparateSeed = kmac256(
                                new TextEncoder().encode(
                                        'Umbra Privacy - Ephemeral Arcium X25519 Public Key Seed'
                                ),
                                convertU128ToLeBytes(masterViewingKey)
                        );

                        const ephemeralArciumX25519SecretKeySeed = kmac256(
                                convertU256ToLeBytes(index),
                                domainSeparateSeed
                        );

                        // Use the derived seed as the X25519 private key (32 bytes)
                        // KMAC256 returns 32 bytes, which is the correct size for X25519 private keys
                        const ephemeralArciumX25519SecretKey = Uint8Array.from(
                                ephemeralArciumX25519SecretKeySeed.slice(0, 32)
                        ) as ArciumX25519SecretKey;

                        const ephemeralArciumX25519PublicKey = x25519.getPublicKey(
                                ephemeralArciumX25519SecretKey
                        ) as ArciumX25519PublicKey;

                        return {
                                x25519PrivateKey: ephemeralArciumX25519SecretKey,
                                x25519PublicKey: ephemeralArciumX25519PublicKey,
                        };
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to generate ephemeral X25519 key pair: ${error instanceof Error ? error.message : String(error)}`
                        );
                }
        }

        public async getMerkleSiblingPathElements(index: U64): Promise<{
                siblings: Array<PoseidonHash>;
                siblingPathIndices: Array<0 | 1>;
                merkleRoot: PoseidonHash;
        }> {
                try {
                        const siblings = await this.indexer.getMerkleSiblings(index);
                        if (!siblings.length) {
                                throw new UmbraClientError(
                                        `Indexer returned an empty Merkle proof for index ${index.toString()}.`
                                );
                        }

                        const siblingPathIndices = getSiblingMerkleIndicesFromInsertionIndex(index);
                        const merkleRoot = siblings[siblings.length - 1]!;

                        return {
                                siblings,
                                siblingPathIndices,
                                merkleRoot,
                        };
                } catch (error) {
                        throw new UmbraClientError(
                                `Failed to retrieve Merkle siblings: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }
        }
}
