import { UmbraWallet, UmbraWalletError } from '@/client/umbra-wallet';
import { ITransactionForwarder, ISigner, IZkProver } from '@/client/interface';
import {
        Sha3Hash,
        SolanaAddress,
        SolanaTransactionSignature,
        U256BeBytes,
        U256LeBytes,
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
import { getArciumEncryptedUserAccountPda } from '@/utils/pda-generators';
import { isBitSet } from '@/utils/miscellaneous';
import { buildInitialiseArciumEncryptedUserAccountInstruction } from './instruction-builders/account-initialisation';
import {
        buildConvertUserAccountFromMxeToSharedInstruction,
        buildUpdateMasterViewingKeyInstruction,
} from './instruction-builders/conversion';
import { MXE_ARCIUM_X25519_PUBLIC_KEY } from '@/constants';
import { sha3_256 } from '@noble/hashes/sha3.js';
import { convertU128ToBeBytes } from '@/utils/convertors';
import { aggregateSha3HashIntoSinglePoseidonRoot, PoseidonHasher } from '@/utils/hasher';
import { WasmZkProver, WasmZkProverConfig } from '@/client/implementation/wasm-zk-prover';

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
        public readonly program: Program<Umbra>;

        private constructor(
                umbraWallet: UmbraWallet | undefined,
                connectionBasedForwarder: ConnectionBasedForwarder,
                program: Program<Umbra>,
                zkProver?: IZkProver
        ) {
                this.umbraWallet = umbraWallet;
                this.connectionBasedForwarder = connectionBasedForwarder;
                this.program = program;
                this.txForwarder = undefined;
                this.zkProver = zkProver;
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
                const userArciumEncryptedAccountData =
                        await this.program.account.arciumEncryptedUserAccount.fetch(
                                userArciumEncryptedAccountPda
                        );

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
                } else if (
                        !isBitSet(userArciumEncryptedAccountData.status[0], FLAG_BIT_FOR_IS_ACTIVE)
                ) {
                        throw new UmbraClientError('User account is not active');
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
                        !isBitSet(
                                userArciumEncryptedAccountData.status[0],
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
}
