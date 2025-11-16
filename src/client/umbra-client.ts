import { UmbraWallet, UmbraWalletError } from '@/client/umbra-wallet';
import { ITransactionForwarder, ISigner, IZkProver } from '@/client/interface';
import {
        AccountOffset,
        Amount,
        ArciumX25519Nonce,
        BasisPoints,
        Day,
        Hour,
        InstructionSeed,
        MintAddress,
        Minute,
        Month,
        NumberOfTransactions,
        RescueCiphertext,
        RiskThreshold,
        Second,
        Sha3Hash,
        SolanaAddress,
        SolanaTransactionSignature,
        Time,
        U256,
        U256BeBytes,
        U256LeBytes,
        Year,
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
import { breakPublicKeyIntoTwoParts, generateRandomU256, isBitSet } from '@/utils/miscellaneous';
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
import {
        buildDepositIntoMixerSolInstruction,
        buildDepositIntoMixerPoolSplInstruction,
} from './instruction-builders/deposit';
import { WSOL_MINT_ADDRESS } from '@/constants/anchor';
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
         * @param opts - Optional transaction handling mode (see remarks).
         * @returns Depending on the `mode`, a tuple `[index, value]` where:
         * - `index` is the {@link U256} nullifier index used to derive the random secret and nullifier.
         * - `value` is either a transaction signature, a forwarded result of type `T`, or a prepared/signed
         *   {@link VersionedTransaction}.
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
         * The behavior is controlled by the `mode` option:
         *
         * - **Default / `'forwarder'`**
         *   Signs the transaction with the client's `umbraWallet` and forwards it via `txForwarder`,
         *   returning the generic type `T`. This is the recommended mode when using a relayer.
         *
         * - **`'connection'`**
         *   Signs the transaction with the client's `umbraWallet` and sends it directly via
         *   `connectionBasedForwarder`, returning a {@link SolanaTransactionSignature}.
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
         * // Basic usage with a randomly derived index and default 'forwarder' mode.
         * const signatureOrResult = await client.depositPublicallyIntoMixerPoolSol(
         *   amount,
         *   destinationAddress,
         * );
         * ```
         *
         * @example
         * ```ts
         * // Usage with a fixed index for reproducible commitments / proofs.
         * const index: U256 = /* obtain index *\/;
         * const tx = await client.depositPublicallyIntoMixerPoolSol(
         *   amount,
         *   destinationAddress,
         *   index,
         *   { mode: 'signed' },
         * );
         * ```
         */
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                index: U256
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: { mode: 'connection' }
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                index: U256,
                opts: { mode: 'connection' }
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: { mode: 'forwarder' }
        ): Promise<[U256, T]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                index: U256,
                opts: { mode: 'forwarder' }
        ): Promise<[U256, T]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: { mode: 'signed' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                index: U256,
                opts: { mode: 'signed' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: { mode: 'prepared' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                index: U256,
                opts: { mode: 'prepared' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                index: U256,
                opts: { mode: 'raw' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                opts: { mode: 'raw' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSol(
                amount: Amount,
                destinationAddress: SolanaAddress,
                indexOrOpts?:
                        | U256
                        | { mode: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw' },
                maybeOpts?: { mode: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw' }
        ): Promise<[U256, SolanaTransactionSignature | T | VersionedTransaction]> {
                const mode = ((typeof indexOrOpts === 'bigint' ? maybeOpts : indexOrOpts)?.mode ??
                        'forwarder') as 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw';

                const index: U256 =
                        typeof indexOrOpts === 'bigint'
                                ? (indexOrOpts as U256)
                                : (generateRandomU256() as U256);

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

                const randomRelayer = await UmbraClient.getRandomRelayerForwarder();
                const relayerPublicKey = randomRelayer.relayerPublicKey;

                const feesConfiguration =
                        await UmbraClient.getFeesConfigurationForPublicDepositIntoMixerPoolSol(
                                amount
                        );

                const amountAfterRelayerFees = amount - feesConfiguration.relayerFees;
                const commissionFees =
                        (amountAfterRelayerFees * feesConfiguration.commissionFees) / 10000n;
                const amountAfterCommissionFees = amountAfterRelayerFees - commissionFees;

                const innerCommitment = PoseidonHasher.hash([
                        randomSecret,
                        nullifier,
                        amountAfterCommissionFees,
                        this.umbraWallet.masterViewingKey,
                        destinationAddressLo,
                        destinationAddressHi,
                ]);

                const time = Math.floor(Date.now() / 1000);

                const linkerHash = this.umbraWallet.generateLinkerHashForDepositsIntoMixerPool(
                        'deposit_into_mixer_pool_sol',
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
                                amountAfterCommissionFees as Amount,
                                BigInt(time) as Year,
                                BigInt(time) as Month,
                                BigInt(time) as Day,
                                BigInt(time) as Hour,
                                BigInt(time) as Minute,
                                BigInt(time) as Second,
                                amountAfterCommissionFees as Amount,
                                BigInt(time) as Year,
                                BigInt(time) as Month,
                                BigInt(time) as Day,
                                BigInt(time) as Hour,
                                BigInt(time) as Minute,
                                BigInt(time) as Second,
                                linkerHash,
                                innerCommitment,
                                onChainMvkHash
                        );

                const instructions: Array<TransactionInstruction> = [];

                instructions.push(
                        await buildDepositIntoMixerSolInstruction(
                                {
                                        arciumSigner: userPublicKey,
                                        relayer: relayerPublicKey,
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

                        return [index, new VersionedTransaction(rawMessage)];
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
                        return [index, preparedTransaction];
                }

                const signedTransaction =
                        await this.umbraWallet.signTransaction(preparedTransaction);

                if (mode === 'signed') {
                        return [index, signedTransaction];
                }

                if (mode === 'forwarder') {
                        if (!this.txForwarder) {
                                throw new UmbraClientError(
                                        'No transaction forwarder configured on UmbraClient'
                                );
                        }
                        return [
                                index,
                                await this.txForwarder.forwardTransaction(signedTransaction),
                        ];
                }

                // 'connection' mode: send via connectionBasedForwarder.
                return [
                        index,
                        await this.connectionBasedForwarder.forwardTransaction(signedTransaction),
                ];
        }

        /**
         * Deposits SPL tokens publicly into the Umbra mixer pool via a relayer, generating the required
         * zero-knowledge proof and commitment/linker hashes.
         *
         * @param amount - The amount of SPL tokens to deposit into the mixer pool.
         * @param destinationAddress - The Solana address where withdrawn funds should ultimately be sent.
         * @param mintAddress - The SPL token mint address being deposited.
         * @param indexOrOpts - Optional fixed index (`U256`) or options object controlling transaction mode.
         * @param maybeOpts - Optional options object when a fixed index is provided.
         * @returns Depending on the `mode`, either a transaction signature, a forwarded result of type `T`,
         *          or a prepared/signed {@link VersionedTransaction}.
         *
         * @remarks
         * This method mirrors {@link depositPublicallyIntoMixerPoolSol} but operates on SPL tokens.
         * The key differences are:
         * - No relayer fee cut is subtracted from the deposited SPL `amount` itself.
         * - The commission fees are not subtracted from the deposited SPL `amount`; the full `amount` is
         *   committed into the mixer pool, while commission accounting is handled separately.
         * - The relayer fees are instead paid out of the user's wrapped SOL (WSOL) balance when the
         *   transaction is forwarded by the relayer.
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
         * {@link depositPublicallyIntoMixerPoolSol}.
         *
         * @example
         * ```ts
         * // Basic SPL deposit with a randomly derived index and default 'forwarder' mode.
         * const result = await client.depositPublicallyIntoMixerPoolSpl(
         *   amount,
         *   destinationAddress,
         *   splMintAddress,
         * );
         * ```
         *
         * @example
         * ```ts
         * // SPL deposit with a fixed index and a prepared transaction.
         * const index: U256 = /* obtain index *\/;
         * const tx = await client.depositPublicallyIntoMixerPoolSpl(
         *   amount,
         *   destinationAddress,
         *   splMintAddress,
         *   index,
         *   { mode: 'prepared' },
         * );
         * ```
         */
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'connection' }
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256,
                opts: { mode: 'connection' }
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'forwarder' }
        ): Promise<[U256, T]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256,
                opts: { mode: 'forwarder' }
        ): Promise<[U256, T]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'signed' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256,
                opts: { mode: 'signed' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'prepared' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256,
                opts: { mode: 'prepared' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256,
                opts: { mode: 'raw' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'raw' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPoolSpl(
                amount: Amount,
                destinationAddress: SolanaAddress,
                _mintAddress: MintAddress,
                indexOrOpts?:
                        | U256
                        | { mode: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw' },
                maybeOpts?: { mode: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw' }
        ): Promise<[U256, SolanaTransactionSignature | T | VersionedTransaction]> {
                const mode = ((typeof indexOrOpts === 'bigint' ? maybeOpts : indexOrOpts)?.mode ??
                        'forwarder') as 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw';

                const index: U256 =
                        typeof indexOrOpts === 'bigint'
                                ? (indexOrOpts as U256)
                                : (generateRandomU256() as U256);

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

                const randomRelayer = await UmbraClient.getRandomRelayerForwarder();
                const relayerPublicKey = randomRelayer.relayerPublicKey;

                const feesConfiguration =
                        await UmbraClient.getFeesConfigurationForPublicDepositIntoMixerPoolSol(
                                amount
                        );

                // For SPL deposits, we do not subtract relayer fees or commission fees from the amount.
                const amountAfterRelayerFees = amount;
                const commissionFees =
                        (amountAfterRelayerFees * feesConfiguration.commissionFees) / 10000n;
                const amountAfterCommissionFees = amountAfterRelayerFees - commissionFees;

                const innerCommitment = PoseidonHasher.hash([
                        randomSecret,
                        nullifier,
                        amountAfterCommissionFees,
                        this.umbraWallet.masterViewingKey,
                        destinationAddressLo,
                        destinationAddressHi,
                ]);

                const time = Math.floor(Date.now() / 1000);

                const linkerHash = this.umbraWallet.generateLinkerHashForDepositsIntoMixerPool(
                        'deposit_into_mixer_pool_spl',
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
                                amountAfterCommissionFees as Amount,
                                BigInt(time) as Year,
                                BigInt(time) as Month,
                                BigInt(time) as Day,
                                BigInt(time) as Hour,
                                BigInt(time) as Minute,
                                BigInt(time) as Second,
                                amountAfterCommissionFees as Amount,
                                BigInt(time) as Year,
                                BigInt(time) as Month,
                                BigInt(time) as Day,
                                BigInt(time) as Hour,
                                BigInt(time) as Minute,
                                BigInt(time) as Second,
                                linkerHash,
                                innerCommitment,
                                onChainMvkHash
                        );

                const instructions: Array<TransactionInstruction> = [];

                instructions.push(
                        await buildDepositIntoMixerPoolSplInstruction(
                                {
                                        arciumSigner: userPublicKey,
                                        relayer: relayerPublicKey,
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

                        return [index, new VersionedTransaction(rawMessage)];
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
                        return [index, preparedTransaction];
                }

                const signedTransaction =
                        await this.umbraWallet.signTransaction(preparedTransaction);

                if (mode === 'signed') {
                        return [index, signedTransaction];
                }

                if (mode === 'forwarder') {
                        if (!this.txForwarder) {
                                throw new UmbraClientError(
                                        'No transaction forwarder configured on UmbraClient'
                                );
                        }
                        return [
                                index,
                                await this.txForwarder.forwardTransaction(signedTransaction),
                        ];
                }

                // 'connection' mode: send via connectionBasedForwarder.
                return [
                        index,
                        await this.connectionBasedForwarder.forwardTransaction(signedTransaction),
                ];
        }

        /**
         * Convenience wrapper that deposits either SOL (via WSOL) or SPL tokens into the mixer pool,
         * delegating to {@link depositPublicallyIntoMixerPoolSol} or
         * {@link depositPublicallyIntoMixerPoolSpl} as appropriate based on the mint.
         *
         * @param amount - The amount of SOL/SPL tokens to deposit.
         * @param destinationAddress - The Solana address where withdrawn funds should ultimately be sent.
         * @param mintAddress - The SPL mint address. If this is `WSOL_MINT_ADDRESS`, the SOL path is used.
         * @param indexOrOpts - Optional fixed index (`U256`) or options object controlling transaction mode.
         * @param maybeOpts - Optional options object when a fixed index is provided.
         *
         * @remarks
         * - When `mintAddress === WSOL_MINT_ADDRESS`, this method behaves exactly like
         *   {@link depositPublicallyIntoMixerPoolSol}, including relayer and commission fee cuts
         *   from the deposited amount.
         * - For all other mints, it behaves like {@link depositPublicallyIntoMixerPoolSpl}, where
         *   the full SPL `amount` is committed into the mixer pool and relayer fees are paid from WSOL.
         *
         * All `mode` and `index` semantics mirror the underlying SOL/SPL methods.
         */
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress
        ): Promise<[U256, SolanaTransactionSignature | T | VersionedTransaction]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256
        ): Promise<[U256, SolanaTransactionSignature | T | VersionedTransaction]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'connection' }
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256,
                opts: { mode: 'connection' }
        ): Promise<[U256, SolanaTransactionSignature]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'forwarder' }
        ): Promise<[U256, T]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256,
                opts: { mode: 'forwarder' }
        ): Promise<[U256, T]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'signed' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256,
                opts: { mode: 'signed' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'prepared' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                index: U256,
                opts: { mode: 'prepared' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                opts: { mode: 'raw' }
        ): Promise<[U256, VersionedTransaction]>;
        public async depositPublicallyIntoMixerPool(
                amount: Amount,
                destinationAddress: SolanaAddress,
                mintAddress: MintAddress,
                indexOrOpts?:
                        | U256
                        | { mode: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw' },
                maybeOpts?: { mode: 'connection' | 'forwarder' | 'signed' | 'prepared' | 'raw' }
        ): Promise<[U256, SolanaTransactionSignature | T | VersionedTransaction]> {
                const optsParam = (typeof indexOrOpts === 'bigint' ? maybeOpts : indexOrOpts) ?? {
                        mode: 'forwarder',
                };
                const index = typeof indexOrOpts === 'bigint' ? (indexOrOpts as U256) : undefined;
                const mode = optsParam.mode;

                if (mintAddress === WSOL_MINT_ADDRESS) {
                        if (index !== undefined) {
                                if (mode === 'connection') {
                                        return this.depositPublicallyIntoMixerPoolSol(
                                                amount,
                                                destinationAddress,
                                                index,
                                                { mode: 'connection' }
                                        );
                                }
                                if (mode === 'forwarder') {
                                        return this.depositPublicallyIntoMixerPoolSol(
                                                amount,
                                                destinationAddress,
                                                index,
                                                { mode: 'forwarder' }
                                        );
                                }
                                if (mode === 'signed') {
                                        return this.depositPublicallyIntoMixerPoolSol(
                                                amount,
                                                destinationAddress,
                                                index,
                                                { mode: 'signed' }
                                        );
                                }
                                if (mode === 'prepared') {
                                        return this.depositPublicallyIntoMixerPoolSol(
                                                amount,
                                                destinationAddress,
                                                index,
                                                { mode: 'prepared' }
                                        );
                                }
                                return this.depositPublicallyIntoMixerPoolSol(
                                        amount,
                                        destinationAddress,
                                        index,
                                        { mode: 'raw' }
                                );
                        }

                        if (mode === 'connection') {
                                return this.depositPublicallyIntoMixerPoolSol(
                                        amount,
                                        destinationAddress,
                                        { mode: 'connection' }
                                );
                        }
                        if (mode === 'forwarder') {
                                return this.depositPublicallyIntoMixerPoolSol(
                                        amount,
                                        destinationAddress,
                                        { mode: 'forwarder' }
                                );
                        }
                        if (mode === 'signed') {
                                return this.depositPublicallyIntoMixerPoolSol(
                                        amount,
                                        destinationAddress,
                                        { mode: 'signed' }
                                );
                        }
                        if (mode === 'prepared') {
                                return this.depositPublicallyIntoMixerPoolSol(
                                        amount,
                                        destinationAddress,
                                        { mode: 'prepared' }
                                );
                        }
                        return this.depositPublicallyIntoMixerPoolSol(amount, destinationAddress, {
                                mode: 'raw',
                        });
                }

                if (index !== undefined) {
                        if (mode === 'connection') {
                                return this.depositPublicallyIntoMixerPoolSpl(
                                        amount,
                                        destinationAddress,
                                        mintAddress,
                                        index,
                                        { mode: 'connection' }
                                );
                        }
                        if (mode === 'forwarder') {
                                return this.depositPublicallyIntoMixerPoolSpl(
                                        amount,
                                        destinationAddress,
                                        mintAddress,
                                        index,
                                        { mode: 'forwarder' }
                                );
                        }
                        if (mode === 'signed') {
                                return this.depositPublicallyIntoMixerPoolSpl(
                                        amount,
                                        destinationAddress,
                                        mintAddress,
                                        index,
                                        { mode: 'signed' }
                                );
                        }
                        if (mode === 'prepared') {
                                return this.depositPublicallyIntoMixerPoolSpl(
                                        amount,
                                        destinationAddress,
                                        mintAddress,
                                        index,
                                        { mode: 'prepared' }
                                );
                        }
                        return this.depositPublicallyIntoMixerPoolSpl(
                                amount,
                                destinationAddress,
                                mintAddress,
                                index,
                                { mode: 'raw' }
                        );
                }

                if (mode === 'connection') {
                        return this.depositPublicallyIntoMixerPoolSpl(
                                amount,
                                destinationAddress,
                                mintAddress,
                                { mode: 'connection' }
                        );
                }
                if (mode === 'forwarder') {
                        return this.depositPublicallyIntoMixerPoolSpl(
                                amount,
                                destinationAddress,
                                mintAddress,
                                { mode: 'forwarder' }
                        );
                }
                if (mode === 'signed') {
                        return this.depositPublicallyIntoMixerPoolSpl(
                                amount,
                                destinationAddress,
                                mintAddress,
                                { mode: 'signed' }
                        );
                }
                if (mode === 'prepared') {
                        return this.depositPublicallyIntoMixerPoolSpl(
                                amount,
                                destinationAddress,
                                mintAddress,
                                { mode: 'prepared' }
                        );
                }

                return this.depositPublicallyIntoMixerPoolSpl(
                        amount,
                        destinationAddress,
                        mintAddress,
                        { mode: 'raw' }
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
}
