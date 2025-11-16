import { UmbraWallet, UmbraWalletError } from '@/client/umbra-wallet';
import { ITransactionForwarder, ISigner } from './interface';
import { Sha3Hash, SolanaAddress, SolanaTransactionSignature } from '@/types';
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
import { getArciumEncryptedUserAccountPda } from '@/utils/pda-generators';
import { isBitSet } from '@/utils/miscellaneous';
import { buildInitialiseArciumEncryptedUserAccountInstruction } from './instruction-builders/account-initialisation';
import { buildConvertUserAccountFromMxeToSharedInstruction } from './instruction-builders/conversion';

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
                umbraWallet: UmbraWallet | undefined,
                connectionBasedForwarder: ConnectionBasedForwarder,
                program: Program<Umbra>
        ) {
                this.umbraWallet = umbraWallet;
                this.connectionBasedForwarder = connectionBasedForwarder;
                this.program = program;
                this.txForwarder = undefined;
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

                return new UmbraClient(undefined, connectionBasedForwarder, program);
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
         * Builds and optionally signs and forwards a transaction to register the user's account
         * for confidentiality. Behavior is controlled via the `mode` option.
         *
         * @remarks
         * Overloads:
         * - Default / `'connection'`: Signs with the client's `umbraWallet` and sends via
         *   `connectionBasedForwarder`, returning a `SolanaTransactionSignature`.
         * - `'forwarder'`: Signs with the client's `umbraWallet` and forwards via `txForwarder`,
         *   returning the generic type `T`.
         * - `'signed'`: Signs with the client's `umbraWallet` and returns the signed
         *   `VersionedTransaction` without sending it.
         * - `'prepared'`: Returns an unsigned `VersionedTransaction` with fee payer and recent
         *   blockhash populated.
         * - `'raw'`: Returns an unsigned `VersionedTransaction` built only from the instructions
         *   with a placeholder blockhash; no real fee payer / blockhash setup is performed.
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
                const userArciumEncryptedAccountData =
                        await this.program.account.arciumEncryptedUserAccount.fetch(
                                userArciumEncryptedAccountPda
                        );

                const FLAG_BIT_FOR_IS_INITIALISED = 0;
                const FLAG_BIT_FOR_IS_MXE_ENCRYPTED = 1;
                const FLAG_BIT_FOR_IS_ACTIVE = 3;

                const instructions: Array<TransactionInstruction> = [];

                if (
                        !isBitSet(
                                userArciumEncryptedAccountData.status[0],
                                FLAG_BIT_FOR_IS_INITIALISED
                        )
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
                } else {
                        if (
                                !isBitSet(
                                        userArciumEncryptedAccountData.status[0],
                                        FLAG_BIT_FOR_IS_ACTIVE
                                )
                        ) {
                                throw new UmbraClientError('User account is not active');
                        }
                }

                if (
                        isBitSet(
                                userArciumEncryptedAccountData.status[0],
                                FLAG_BIT_FOR_IS_MXE_ENCRYPTED
                        )
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
}
