import { UmbraWallet, UmbraWalletError } from '@/client/umbra-wallet';
import { ITransactionForwarder, ISigner } from './interface';
import { SolanaAddress, SolanaTransactionSignature } from '@/types';
import { ConnectionBasedForwarder } from '@/client/implementation/connection-based-forwarder';
import { Connection, Keypair } from '@solana/web3.js';
import { RelayerForwarder } from '@/client/implementation/relayer-forwarder';
import { Umbra } from '@/idl';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import idl from '@/idl/idl.json';

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
 * const wallets = client.umbraWallets;
 * const forwarders = client.txForwarders;
 * const connectionForwarder = client.connectionBasedForwarder;
 * ```
 */
export class UmbraClient<T = SolanaTransactionSignature> {
        /**
         * Array of Umbra wallets managed by this client.
         *
         * @remarks
         * Each wallet provides cryptographic operations, transaction signing, and encryption
         * capabilities. Wallets are created from signers and handle all key derivation
         * and cipher management internally.
         */
        public readonly umbraWallets: Array<UmbraWallet>;

        /**
         * Array of transaction forwarders managed by this client.
         *
         * @remarks
         * Transaction forwarders handle submitting signed transactions to the network.
         * Different forwarders can use different strategies (direct RPC, relayer services, etc.).
         * The generic type `T` determines the return type of forwarding operations.
         */
        public readonly txForwarders: Array<ITransactionForwarder<T>>;

        /**
         * The connection-based transaction forwarder for direct RPC submission.
         *
         * @remarks
         * This forwarder uses a Solana Connection to submit transactions directly to the network.
         * It supports sequential transaction forwarding with confirmation, delays, and offset-based
         * resumption. This is the primary forwarder created during client initialization.
         */
        public readonly connectionBasedForwarder: ConnectionBasedForwarder;
        public readonly program: Program<Umbra>;

        private constructor(
                umbraWallets: Array<UmbraWallet>,
                txForwarders: Array<ITransactionForwarder<T>>,
                connectionBasedForwarder: ConnectionBasedForwarder,
                program: Program<Umbra>
        ) {
                this.umbraWallets = umbraWallets;
                this.txForwarders = txForwarders;
                this.connectionBasedForwarder = connectionBasedForwarder;
                this.program = program;
        }

        /**
         * Creates an UmbraClient from a ConnectionBasedForwarder instance.
         *
         * @param connectionBasedForwarder - An existing ConnectionBasedForwarder instance that contains a Solana Connection
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
         *
         * @example
         * ```typescript
         * const forwarder = ConnectionBasedForwarder.fromConnection(connection);
         * const client = UmbraClient.create(forwarder);
         * ```
         */
        public static create(connectionBasedForwarder: ConnectionBasedForwarder): UmbraClient;

        /**
         * Creates an UmbraClient from a Solana Connection instance.
         *
         * @param connection - The Solana Connection instance to use for all on-chain operations
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
        public static create(connection: Connection): UmbraClient;

        /**
         * Creates an UmbraClient from an RPC URL.
         *
         * @param rpcUrl - The RPC endpoint URL (e.g., 'https://api.mainnet-beta.solana.com')
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
         * - Initialize empty arrays for wallets and forwarders (to be populated later)
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
        public static create(rpcUrl: string): UmbraClient;

        /**
         * Implementation of create that handles all overloads.
         *
         * @internal
         */
        public static create(
                connectionOrForwarderOrRpcUrl: Connection | ConnectionBasedForwarder | string
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

                return new UmbraClient([], [], connectionBasedForwarder, program);
        }

        /**
         * Adds an Umbra wallet to the client from an existing UmbraWallet instance.
         *
         * @param umbraWallet - An existing UmbraWallet instance to add to the client
         * @returns A promise that resolves when the wallet is successfully added
         *
         * @throws {@link UmbraWalletAdditionError} When the wallet is null, undefined, or invalid
         *
         * @remarks
         * Use this overload when you already have a created UmbraWallet instance and want to
         * add it to the client. This is useful when you've created the wallet separately
         * and want to manage it through the client.
         *
         * **Wallet Management:**
         * Once added, the wallet is stored in the client's `umbraWallets` array and can be
         * accessed for cryptographic operations, transaction signing, and encryption.
         *
         * @example
         * ```typescript
         * // Create wallet separately
         * const wallet = await UmbraWallet.fromSigner(signer);
         *
         * // Add to client
         * await client.addUmbraWallet(wallet);
         * ```
         */
        public async addUmbraWallet(umbraWallet: UmbraWallet): Promise<void>;

        /**
         * Adds an Umbra wallet to the client by creating it from an ISigner.
         *
         * @param signer - An ISigner instance to create the UmbraWallet from
         * @returns A promise that resolves when the wallet is successfully created and added
         *
         * @throws {@link UmbraWalletAdditionError} When wallet creation fails due to signer errors, key derivation failures, or initialization issues
         *
         * @remarks
         * Use this overload when you have a signer and want the client to automatically create
         * the UmbraWallet for you. This is the most convenient approach as it handles all
         * wallet initialization internally.
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
         * // Create wallet from signer directly
         * await client.addUmbraWallet(signer);
         *
         * // Access the created wallet
         * const wallet = client.umbraWallets[0];
         * ```
         */
        public async addUmbraWallet(signer: ISigner): Promise<void>;

        /**
         * Implementation of addUmbraWallet that handles all overloads.
         *
         * @internal
         */
        public async addUmbraWallet(umbraWalletOrSigner: UmbraWallet | ISigner): Promise<void> {
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

                        this.umbraWallets.push(wallet);
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
}
