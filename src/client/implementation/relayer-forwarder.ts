import { SolanaAddress, SolanaTransactionSignature } from '@/types';
import { ITransactionForwarder, TransactionForwarderError } from '@/client/interface';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { RELAYER_BASE_URL } from '@/constants/anchor';

/**
 * Error thrown when a single transaction forwarding operation fails via relayer.
 *
 * @remarks
 * This error is thrown when `forwardTransaction` fails due to network errors,
 * invalid transaction, relayer service errors, or other forwarding issues.
 *
 * @public
 */
export class RelayerTransactionForwardingError extends TransactionForwarderError {
        /**
         * Unique identifier code for this error type.
         */
        public readonly code = 'RELAYER_FORWARDER_TRANSACTION_ERROR';

        /**
         * Creates a new instance of RelayerTransactionForwardingError.
         *
         * @param message - Human-readable error message describing what went wrong
         * @param cause - Optional underlying error that caused this error
         */
        public constructor(message: string, cause?: TransactionForwarderError) {
                super(message, cause);
        }
}

/**
 * Error thrown when batch transaction forwarding operation fails via relayer.
 *
 * @remarks
 * This error is thrown when `forwardTransactions` fails for any transaction
 * in the batch. The error message should indicate which transaction(s) failed.
 *
 * @public
 */
export class RelayerBatchTransactionForwardingError extends TransactionForwarderError {
        /**
         * Unique identifier code for this error type.
         */
        public readonly code = 'RELAYER_FORWARDER_BATCH_ERROR';

        /**
         * Creates a new instance of RelayerBatchTransactionForwardingError.
         *
         * @param message - Human-readable error message describing what went wrong
         * @param cause - Optional underlying error that caused this error
         */
        public constructor(message: string, cause?: TransactionForwarderError) {
                super(message, cause);
        }
}

/**
 * Error thrown when the delays array length is invalid for variable delay forwarding.
 *
 * @remarks
 * This error is thrown when `forwardTransactions` is called with variable delays and the
 * delays array length does not match the expected length.
 *
 * @public
 */
export class RelayerInvalidDelayArrayError extends TransactionForwarderError {
        /**
         * Unique identifier code for this error type.
         */
        public readonly code = 'RELAYER_FORWARDER_INVALID_DELAY_ARRAY';

        /**
         * Creates a new instance of RelayerInvalidDelayArrayError.
         *
         * @param transactionsLength - The number of transactions
         * @param delaysLength - The number of delays provided
         * @param cause - Optional underlying error that caused this error
         */
        public constructor(
                transactionsLength: number,
                delaysLength: number,
                cause?: TransactionForwarderError
        ) {
                super(
                        `Invalid delays array length: expected ${transactionsLength - 1} delays for ${transactionsLength} transactions, but got ${delaysLength}`,
                        cause
                );
        }
}

/**
 * Error thrown when the relayer service returns an error response.
 *
 * @remarks
 * This error is thrown when the relayer endpoint returns an error object
 * in the response instead of a transaction signature.
 *
 * @public
 */
export class RelayerServiceError extends TransactionForwarderError {
        /**
         * Unique identifier code for this error type.
         */
        public readonly code = 'RELAYER_FORWARDER_SERVICE_ERROR';

        /**
         * The error object returned by the relayer service.
         */
        public readonly relayerError: unknown;

        /**
         * Creates a new instance of RelayerServiceError.
         *
         * @param message - Human-readable error message describing what went wrong
         * @param relayerError - The error object returned by the relayer service
         * @param cause - Optional underlying error that caused this error
         */
        public constructor(
                message: string,
                relayerError: unknown,
                cause?: TransactionForwarderError
        ) {
                super(message, cause);
                this.relayerError = relayerError;
        }
}

/**
 * Response type from relayer service on success.
 */
interface RelayerSuccessResponse {
        txSignature: string;
}

/**
 * Response type from relayer service on error.
 */
interface RelayerErrorResponse {
        error: unknown;
}

/**
 * Transaction forwarder implementation that uses a relayer service to forward transactions.
 *
 * @remarks
 * This forwarder submits transactions to a relayer service endpoint. The endpoint URL is
 * constructed by appending the relayer's public key to the base URL defined in
 * `RELAYER_BASE_URL`. Transactions are sent as base64-encoded payloads and the relayer
 * returns transaction signatures.
 *
 * **Features:**
 * - Relayer service submission via HTTP
 * - Sequential transaction forwarding
 * - Fixed and variable delay support between transactions
 * - Offset-based forwarding support
 * - Comprehensive error handling with specific error types
 *
 * @public
 *
 * @example
 * ```typescript
 * // Create from relayer public key (uses RELAYER_BASE_URL constant)
 * const relayerPublicKey = new PublicKey('...') as SolanaAddress;
 * const forwarder = RelayerForwarder.fromPublicKey(relayerPublicKey);
 *
 * // Forward a single transaction
 * const signature = await forwarder.forwardTransaction(signedTx);
 *
 * // Forward multiple transactions sequentially
 * const signatures = await forwarder.forwardTransactions([tx1, tx2, tx3]);
 * ```
 */
export class RelayerForwarder extends ITransactionForwarder<SolanaTransactionSignature> {
        /**
         * The relayer's public key used to construct the endpoint URL.
         */
        public readonly relayerPublicKey: SolanaAddress;

        /**
         * Creates a new instance of RelayerForwarder.
         *
         * @param relayerPublicKey - The relayer's public key
         */
        private constructor(relayerPublicKey: SolanaAddress) {
                super();
                this.relayerPublicKey = relayerPublicKey;
        }

        /**
         * Creates a RelayerForwarder from a relayer public key.
         *
         * @remarks
         * The endpoint URL is constructed using the `RELAYER_BASE_URL` constant
         * from `@/constants/anchor` with the relayer's public key appended.
         * The full endpoint URL will be: `${RELAYER_BASE_URL}${relayerPublicKey.toBase58()}`
         *
         * @param relayerPublicKey - The relayer's public key (will be appended to RELAYER_BASE_URL)
         * @returns A new RelayerForwarder instance
         *
         * @example
         * ```typescript
         * const relayerPublicKey = new PublicKey('...') as SolanaAddress;
         * const forwarder = RelayerForwarder.fromPublicKey(relayerPublicKey);
         * ```
         */
        public static fromPublicKey(relayerPublicKey: SolanaAddress): RelayerForwarder {
                return new RelayerForwarder(relayerPublicKey);
        }

        /**
         * Creates a RelayerForwarder using a randomly selected relayer.
         *
         * @remarks
         * This method selects a random relayer index and queries the relayer
         * discovery service at `https://relayer.umbraprivacy.com` to obtain
         * the corresponding relayer public key.
         *
         * **Request body**
         * ```json
         * { "relayerIndex": number }
         * ```
         *
         * **Successful response**
         * ```json
         * { "relayerPublicKey": string }
         * ```
         *
         * **Error response**
         * ```json
         * { "error": object }
         * ```
         *
         * @returns A promise resolving to a new RelayerForwarder instance.
         *
         * @throws {@link RelayerServiceError} When the relayer discovery service
         *         returns an error object.
         * @throws {@link RelayerTransactionForwardingError} When the HTTP request
         *         fails or the response format is invalid.
         */
        public static async getRandomRelayerForwarder(): Promise<RelayerForwarder> {
                const NUMBER_OF_RELAYERS = 1;
                const relayerIndex = Math.floor(Math.random() * NUMBER_OF_RELAYERS);

                try {
                        const response = (await fetch('https://relayer.umbraprivacy.com', {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ relayerIndex }),
                        })) as {
                                ok: boolean;
                                status: number;
                                statusText: string;
                                json(): Promise<unknown>;
                        };

                        if (!response.ok) {
                                throw new RelayerTransactionForwardingError(
                                        `Relayer discovery service returned status ${response.status}: ${response.statusText}`
                                );
                        }

                        const jsonData = await response.json();
                        const data = jsonData as { relayerPublicKey?: string } | { error: unknown };

                        if ('error' in data) {
                                throw new RelayerServiceError(
                                        'Relayer discovery service returned an error',
                                        (data as { error: unknown }).error
                                );
                        }

                        const relayerPublicKey = (data as { relayerPublicKey?: string })
                                .relayerPublicKey;

                        if (typeof relayerPublicKey !== 'string' || relayerPublicKey.length === 0) {
                                throw new RelayerTransactionForwardingError(
                                        'Invalid response format from relayer discovery service: missing or invalid relayerPublicKey'
                                );
                        }

                        const publicKey = new PublicKey(relayerPublicKey) as SolanaAddress;
                        return RelayerForwarder.fromPublicKey(publicKey);
                } catch (error) {
                        if (error instanceof TransactionForwarderError) {
                                throw error;
                        }

                        throw new RelayerTransactionForwardingError(
                                `Failed to get random relayer forwarder: ${
                                        error instanceof Error ? error.message : String(error)
                                }`,
                                error instanceof TransactionForwarderError ? error : undefined
                        );
                }
        }

        /**
         * Fetches the list of currently registered relayer public keys.
         *
         * @remarks
         * This method performs a simple GET request to `https://relayer.umbraprivacy.com`.
         * The service responds with either:
         *
         * **Successful response**
         * ```json
         * { "relayerPublicKeys": string[] }
         * ```
         *
         * **Error response**
         * ```json
         * { "error": object }
         * ```
         *
         * At most 10 relayer public keys will be returned.
         *
         * @returns A promise resolving to an array of `SolanaAddress` values.
         *
         * @throws {@link RelayerServiceError} When the relayer discovery service
         *         returns an error object.
         * @throws {@link RelayerTransactionForwardingError} When the HTTP request
         *         fails or the response format is invalid.
         */
        public static async getRelayerList(): Promise<Array<SolanaAddress>> {
                try {
                        const response = (await fetch('https://relayer.umbraprivacy.com', {
                                method: 'GET',
                        })) as {
                                ok: boolean;
                                status: number;
                                statusText: string;
                                json(): Promise<unknown>;
                        };

                        if (!response.ok) {
                                throw new RelayerTransactionForwardingError(
                                        `Relayer discovery service returned status ${response.status}: ${response.statusText}`
                                );
                        }

                        const jsonData = await response.json();
                        const data = jsonData as
                                | { relayerPublicKeys?: Array<string> }
                                | {
                                          error: unknown;
                                  };

                        if ('error' in data) {
                                throw new RelayerServiceError(
                                        'Relayer discovery service returned an error',
                                        (data as { error: unknown }).error
                                );
                        }

                        const relayerPublicKeys = (
                                data as {
                                        relayerPublicKeys?: Array<string>;
                                }
                        ).relayerPublicKeys;

                        if (
                                !Array.isArray(relayerPublicKeys) ||
                                relayerPublicKeys.some(
                                        (key) => typeof key !== 'string' || key.length === 0
                                )
                        ) {
                                throw new RelayerTransactionForwardingError(
                                        'Invalid response format from relayer discovery service: missing or invalid relayerPublicKeys'
                                );
                        }

                        return relayerPublicKeys.map((key) => new PublicKey(key) as SolanaAddress);
                } catch (error) {
                        if (error instanceof TransactionForwarderError) {
                                throw error;
                        }

                        throw new RelayerTransactionForwardingError(
                                `Failed to get relayer list: ${
                                        error instanceof Error ? error.message : String(error)
                                }`,
                                error instanceof TransactionForwarderError ? error : undefined
                        );
                }
        }

        /**
         * Gets the full endpoint URL for this relayer.
         *
         * @returns The endpoint URL constructed from RELAYER_BASE_URL and relayer public key
         *
         * @internal
         */
        private getEndpointUrl(): string {
                const publicKeyString = this.relayerPublicKey.toBase58();
                return `${RELAYER_BASE_URL}${publicKeyString}`;
        }

        /**
         * Encodes a transaction to base64.
         *
         * @param transaction - The transaction to encode
         * @returns Base64-encoded transaction string
         *
         * @internal
         */
        private encodeTransactionToBase64(transaction: VersionedTransaction): string {
                const serialized = transaction.serialize();
                return Buffer.from(serialized).toString('base64');
        }

        /**
         * Sends a transaction to the relayer service and returns the signature.
         *
         * @param transaction - The transaction to forward
         * @returns A promise resolving to the transaction signature
         *
         * @throws {@link RelayerTransactionForwardingError} When forwarding fails
         * @throws {@link RelayerServiceError} When the relayer service returns an error
         *
         * @internal
         */
        private async sendTransactionToRelayer(
                transaction: VersionedTransaction
        ): Promise<SolanaTransactionSignature> {
                const endpointUrl = this.getEndpointUrl();
                const txBase64 = this.encodeTransactionToBase64(transaction);

                try {
                        const response = (await fetch(endpointUrl, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ tx: txBase64 }),
                        })) as {
                                ok: boolean;
                                status: number;
                                statusText: string;
                                json(): Promise<unknown>;
                        };

                        if (!response.ok) {
                                throw new RelayerTransactionForwardingError(
                                        `Relayer service returned status ${response.status}: ${response.statusText}`
                                );
                        }

                        const jsonData = await response.json();
                        const data = jsonData as RelayerSuccessResponse | RelayerErrorResponse;

                        if ('error' in data) {
                                throw new RelayerServiceError(
                                        'Relayer service returned an error',
                                        data.error
                                );
                        }

                        if (!('txSignature' in data) || typeof data.txSignature !== 'string') {
                                throw new RelayerTransactionForwardingError(
                                        'Invalid response format from relayer service: missing or invalid txSignature'
                                );
                        }

                        return data.txSignature;
                } catch (error) {
                        if (error instanceof TransactionForwarderError) {
                                throw error;
                        }
                        throw new RelayerTransactionForwardingError(
                                `Failed to forward transaction to relayer: ${error instanceof Error ? error.message : String(error)}`,
                                error instanceof TransactionForwarderError ? error : undefined
                        );
                }
        }

        /**
         * Forwards a single signed transaction to the network via relayer service.
         *
         * @param transaction - The signed `VersionedTransaction` to forward
         * @returns A promise resolving to the transaction signature
         *
         * @throws {@link RelayerTransactionForwardingError} When forwarding fails due to network errors, invalid transaction, or relayer service errors
         *
         * @remarks
         * This method submits a single signed transaction to the relayer service endpoint.
         * The transaction is base64-encoded and sent via HTTP POST. The relayer service
         * processes the transaction and returns the signature. The transaction must be
         * fully signed before calling this method.
         *
         * @example
         * ```typescript
         * const signedTx = await signer.signTransaction(transaction);
         * const signature = await forwarder.forwardTransaction(signedTx);
         * console.log(`Transaction forwarded via relayer: ${signature}`);
         * ```
         */
        public async forwardTransaction(
                transaction: VersionedTransaction
        ): Promise<SolanaTransactionSignature> {
                return await this.sendTransactionToRelayer(transaction);
        }

        /**
         * Forwards multiple signed transactions to the network in a batch operation.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @returns A promise resolving to an array of transaction signatures in the same order as input
         *
         * @throws {@link RelayerBatchTransactionForwardingError} When forwarding fails for any transaction in the batch
         *
         * @remarks
         * This method submits multiple signed transactions to the relayer service sequentially.
         * Each transaction is sent and confirmed before the next one is sent. All transactions
         * must be fully signed before calling this method.
         *
         * **Execution Flow:**
         * 1. Send and confirm `transactions[0]`
         * 2. Send and confirm `transactions[1]`
         * 3. Continue for all transactions
         *
         * @example
         * ```typescript
         * const signedTxs = await signer.signTransactions(transactions);
         * const signatures = await forwarder.forwardTransactions(signedTxs);
         * // signatures[0] corresponds to transactions[0], signatures[1] to transactions[1], etc.
         * ```
         */
        public async forwardTransactions(
                transactions: Array<VersionedTransaction>
        ): Promise<Array<SolanaTransactionSignature>>;

        /**
         * Forwards multiple signed transactions to the network with a fixed delay between each transaction.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @param delayMs - Fixed delay in milliseconds to wait between forwarding each transaction
         * @returns A promise resolving to an array of transaction signatures in the same order as input
         *
         * @throws {@link RelayerBatchTransactionForwardingError} When forwarding fails for any transaction in the batch
         *
         * @remarks
         * This overload submits transactions sequentially with a fixed delay between each submission.
         * The delay helps prevent rate limiting and allows for better transaction ordering control.
         *
         * **Execution Flow:**
         * 1. Send and confirm `transactions[0]`
         * 2. Wait `delayMs` milliseconds
         * 3. Send and confirm `transactions[1]`
         * 4. Wait `delayMs` milliseconds
         * 5. Continue for all transactions
         *
         * This is useful when you need to space out transactions to avoid network congestion or
         * rate limiting issues.
         *
         * @example
         * ```typescript
         * const signedTxs = await signer.signTransactions(transactions);
         * // Forward with 500ms delay between each transaction
         * const signatures = await forwarder.forwardTransactions(signedTxs, 500);
         * ```
         */
        public async forwardTransactions(
                transactions: Array<VersionedTransaction>,
                delayMs: number
        ): Promise<Array<SolanaTransactionSignature>>;

        /**
         * Forwards multiple signed transactions to the network with variable delays between transactions.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @param delaysMs - Array of delays in milliseconds between each transaction (must have length `transactions.length - 1`)
         * @returns A promise resolving to an array of transaction signatures in the same order as input
         *
         * @throws {@link RelayerBatchTransactionForwardingError} When forwarding fails for any transaction in the batch
         * @throws {@link RelayerInvalidDelayArrayError} When the delays array length does not match `transactions.length - 1`
         *
         * @remarks
         * This overload submits transactions sequentially with variable delays between each submission.
         * Each delay in the array corresponds to the wait time after forwarding the transaction at
         * the same index.
         *
         * **Execution Flow:**
         * 1. Send and confirm `transactions[0]`
         * 2. Wait `delaysMs[0]` milliseconds
         * 3. Send and confirm `transactions[1]`
         * 4. Wait `delaysMs[1]` milliseconds
         * 5. Continue for all transactions
         *
         * The `delaysMs` array must have exactly `transactions.length - 1` elements, as there is
         * one delay between each pair of transactions (no delay needed after the last transaction).
         *
         * This is useful when you need different delays between different transactions, such as
         * longer delays for more critical transactions or adaptive delays based on network conditions.
         *
         * @example
         * ```typescript
         * const signedTxs = await signer.signTransactions(transactions);
         * // Variable delays: 200ms after first, 500ms after second, 300ms after third
         * const delays = [200, 500, 300];
         * const signatures = await forwarder.forwardTransactions(signedTxs, delays);
         * ```
         */
        public async forwardTransactions(
                transactions: Array<VersionedTransaction>,
                delaysMs: Array<number>
        ): Promise<Array<SolanaTransactionSignature>>;

        /**
         * Forwards multiple signed transactions to the network starting from a specific offset with a fixed delay between each transaction.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @param offset - The index in the array to start forwarding from (0-based). Transactions before this index are skipped.
         * @param delayMs - Fixed delay in milliseconds to wait between forwarding each transaction
         * @returns A promise resolving to an array of transaction signatures in the same order as the remaining transactions
         *
         * @throws {@link RelayerBatchTransactionForwardingError} When forwarding fails for any transaction in the batch or when offset is out of bounds
         *
         * @remarks
         * This overload combines offset-based forwarding with a fixed delay between transactions.
         * Transactions before the offset are skipped, and the remaining transactions are forwarded
         * sequentially with a fixed delay between each. To forward without delay, pass `0` as `delayMs`.
         *
         * **Execution Flow:**
         * 1. Skip transactions from index 0 to `offset - 1`
         * 2. Send and confirm `transactions[offset]`
         * 3. Wait `delayMs` milliseconds (if `delayMs > 0`)
         * 4. Send and confirm `transactions[offset + 1]`
         * 5. Wait `delayMs` milliseconds (if `delayMs > 0`)
         * 6. Continue for all remaining transactions
         *
         * The returned array contains results only for transactions starting from the offset.
         * For example, if `offset = 2` and there are 5 transactions, only results for
         * `transactions[2]`, `transactions[3]`, and `transactions[4]` are returned.
         *
         * @example
         * ```typescript
         * const signedTxs = await signer.signTransactions(transactions);
         * // Resume from index 2 with 500ms delay between each
         * const signatures = await forwarder.forwardTransactions(signedTxs, 2, 500);
         * // Or resume from index 3 without delay
         * const signatures = await forwarder.forwardTransactions(signedTxs, 3, 0);
         * ```
         */
        public async forwardTransactions(
                transactions: Array<VersionedTransaction>,
                offset: number,
                delayMs: number
        ): Promise<Array<SolanaTransactionSignature>>;

        /**
         * Forwards multiple signed transactions to the network starting from a specific offset with variable delays between transactions.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @param offset - The index in the array to start forwarding from (0-based). Transactions before this index are skipped.
         * @param delaysMs - Array of delays in milliseconds between each transaction (must have length equal to remaining transactions minus 1)
         * @returns A promise resolving to an array of transaction signatures in the same order as the remaining transactions
         *
         * @throws {@link RelayerBatchTransactionForwardingError} When forwarding fails for any transaction in the batch or when offset is out of bounds
         * @throws {@link RelayerInvalidDelayArrayError} When the delays array length does not match `(transactions.length - offset) - 1`
         *
         * @remarks
         * This overload combines offset-based forwarding with variable delays between transactions.
         * Transactions before the offset are skipped, and the remaining transactions are forwarded
         * sequentially with variable delays between each.
         *
         * **Execution Flow:**
         * 1. Skip transactions from index 0 to `offset - 1`
         * 2. Send and confirm `transactions[offset]`
         * 3. Wait `delaysMs[0]` milliseconds
         * 4. Send and confirm `transactions[offset + 1]`
         * 5. Wait `delaysMs[1]` milliseconds
         * 6. Continue for all remaining transactions
         *
         * The `delaysMs` array must have exactly `(transactions.length - offset) - 1` elements,
         * as there is one delay between each pair of remaining transactions.
         *
         * @example
         * ```typescript
         * const signedTxs = await signer.signTransactions(transactions);
         * // Resume from index 1 with variable delays: 200ms, 500ms, 300ms
         * const delays = [200, 500, 300];
         * const signatures = await forwarder.forwardTransactions(signedTxs, 1, delays);
         * ```
         */
        public async forwardTransactions(
                transactions: Array<VersionedTransaction>,
                offset: number,
                delaysMs: Array<number>
        ): Promise<Array<SolanaTransactionSignature>>;

        /**
         * Implementation of forwardTransactions that handles all overloads.
         *
         * @internal
         */
        public async forwardTransactions(
                transactions: Array<VersionedTransaction>,
                delayOrDelaysOrOffset?: number | Array<number>,
                delayOrDelays?: number | Array<number>
        ): Promise<Array<SolanaTransactionSignature>> {
                try {
                        // Handle offset-based overloads (3 parameters)
                        if (delayOrDelays !== undefined) {
                                const offset = delayOrDelaysOrOffset;
                                if (typeof offset !== 'number') {
                                        throw new RelayerBatchTransactionForwardingError(
                                                'Invalid offset parameter type'
                                        );
                                }

                                if (offset < 0 || offset >= transactions.length) {
                                        throw new RelayerBatchTransactionForwardingError(
                                                `Offset ${offset} is out of bounds for array of length ${transactions.length}`
                                        );
                                }

                                if (typeof delayOrDelays === 'number') {
                                        return await this.forwardTransactionsWithOffsetAndFixedDelay(
                                                transactions,
                                                offset,
                                                delayOrDelays
                                        );
                                }

                                if (Array.isArray(delayOrDelays)) {
                                        return await this.forwardTransactionsWithOffsetAndVariableDelays(
                                                transactions,
                                                offset,
                                                delayOrDelays
                                        );
                                }

                                throw new RelayerBatchTransactionForwardingError(
                                        'Invalid delay parameter type for offset overload'
                                );
                        }

                        // Handle non-offset overloads (2 parameters or less)
                        if (delayOrDelaysOrOffset === undefined) {
                                return await this.forwardTransactionsSequentially(transactions);
                        }

                        if (typeof delayOrDelaysOrOffset === 'number') {
                                return await this.forwardTransactionsWithFixedDelay(
                                        transactions,
                                        delayOrDelaysOrOffset
                                );
                        }

                        if (Array.isArray(delayOrDelaysOrOffset)) {
                                return await this.forwardTransactionsWithVariableDelays(
                                        transactions,
                                        delayOrDelaysOrOffset
                                );
                        }

                        throw new RelayerBatchTransactionForwardingError('Invalid parameter type');
                } catch (error) {
                        if (error instanceof TransactionForwarderError) {
                                throw error;
                        }
                        throw new RelayerBatchTransactionForwardingError(
                                `Failed to forward batch transactions: ${error instanceof Error ? error.message : String(error)}`,
                                error instanceof TransactionForwarderError ? error : undefined
                        );
                }
        }

        /**
         * Forwards transactions sequentially, sending each to relayer service.
         *
         * @param transactions - Array of transactions to forward
         * @returns Array of transaction signatures
         *
         * @internal
         */
        private async forwardTransactionsSequentially(
                transactions: Array<VersionedTransaction>
        ): Promise<Array<SolanaTransactionSignature>> {
                const signatures: Array<SolanaTransactionSignature> = [];

                for (const transaction of transactions) {
                        if (!transaction) {
                                throw new RelayerBatchTransactionForwardingError(
                                        `Transaction is undefined`
                                );
                        }

                        const signature = await this.sendTransactionToRelayer(transaction);
                        signatures.push(signature);
                }

                return signatures;
        }

        /**
         * Forwards transactions sequentially with a fixed delay between each.
         *
         * @param transactions - Array of transactions to forward
         * @param delayMs - Fixed delay in milliseconds between transactions
         * @returns Array of transaction signatures
         *
         * @internal
         */
        private async forwardTransactionsWithFixedDelay(
                transactions: Array<VersionedTransaction>,
                delayMs: number
        ): Promise<Array<SolanaTransactionSignature>> {
                const signatures: Array<SolanaTransactionSignature> = [];

                for (let i = 0; i < transactions.length; i++) {
                        const transaction = transactions[i];
                        if (!transaction) {
                                throw new RelayerBatchTransactionForwardingError(
                                        `Transaction at index ${i} is undefined`
                                );
                        }

                        const signature = await this.sendTransactionToRelayer(transaction);
                        signatures.push(signature);

                        if (i < transactions.length - 1 && delayMs > 0) {
                                await this.sleep(delayMs);
                        }
                }

                return signatures;
        }

        /**
         * Forwards transactions sequentially with variable delays between each.
         *
         * @param transactions - Array of transactions to forward
         * @param delaysMs - Array of delays in milliseconds (must have length `transactions.length - 1`)
         * @returns Array of transaction signatures
         *
         * @internal
         */
        private async forwardTransactionsWithVariableDelays(
                transactions: Array<VersionedTransaction>,
                delaysMs: Array<number>
        ): Promise<Array<SolanaTransactionSignature>> {
                if (delaysMs.length !== transactions.length - 1) {
                        throw new RelayerInvalidDelayArrayError(
                                transactions.length,
                                delaysMs.length
                        );
                }

                const signatures: Array<SolanaTransactionSignature> = [];

                for (let i = 0; i < transactions.length; i++) {
                        const transaction = transactions[i];
                        if (!transaction) {
                                throw new RelayerBatchTransactionForwardingError(
                                        `Transaction at index ${i} is undefined`
                                );
                        }

                        const signature = await this.sendTransactionToRelayer(transaction);
                        signatures.push(signature);

                        if (i < transactions.length - 1) {
                                const delay = delaysMs[i];
                                if (delay === undefined) {
                                        throw new RelayerBatchTransactionForwardingError(
                                                `Delay at index ${i} is undefined`
                                        );
                                }
                                await this.sleep(delay);
                        }
                }

                return signatures;
        }

        /**
         * Forwards transactions sequentially starting from a specific offset with a fixed delay.
         *
         * @param transactions - Array of transactions to forward
         * @param offset - The index to start from
         * @param delayMs - Fixed delay in milliseconds between transactions
         * @returns Array of transaction signatures for the remaining transactions
         *
         * @internal
         */
        private async forwardTransactionsWithOffsetAndFixedDelay(
                transactions: Array<VersionedTransaction>,
                offset: number,
                delayMs: number
        ): Promise<Array<SolanaTransactionSignature>> {
                const signatures: Array<SolanaTransactionSignature> = [];

                for (let i = offset; i < transactions.length; i++) {
                        const transaction = transactions[i];
                        if (!transaction) {
                                throw new RelayerBatchTransactionForwardingError(
                                        `Transaction at index ${i} is undefined`
                                );
                        }

                        const signature = await this.sendTransactionToRelayer(transaction);
                        signatures.push(signature);

                        if (i < transactions.length - 1 && delayMs > 0) {
                                await this.sleep(delayMs);
                        }
                }

                return signatures;
        }

        /**
         * Forwards transactions sequentially starting from a specific offset with variable delays.
         *
         * @param transactions - Array of transactions to forward
         * @param offset - The index to start from
         * @param delaysMs - Array of delays in milliseconds (must have length `(transactions.length - offset) - 1`)
         * @returns Array of transaction signatures for the remaining transactions
         *
         * @internal
         */
        private async forwardTransactionsWithOffsetAndVariableDelays(
                transactions: Array<VersionedTransaction>,
                offset: number,
                delaysMs: Array<number>
        ): Promise<Array<SolanaTransactionSignature>> {
                const remainingCount = transactions.length - offset;
                const expectedDelaysLength = remainingCount - 1;

                if (delaysMs.length !== expectedDelaysLength) {
                        throw new RelayerInvalidDelayArrayError(remainingCount, delaysMs.length);
                }

                const signatures: Array<SolanaTransactionSignature> = [];
                let delayIndex = 0;

                for (let i = offset; i < transactions.length; i++) {
                        const transaction = transactions[i];
                        if (!transaction) {
                                throw new RelayerBatchTransactionForwardingError(
                                        `Transaction at index ${i} is undefined`
                                );
                        }

                        const signature = await this.sendTransactionToRelayer(transaction);
                        signatures.push(signature);

                        if (i < transactions.length - 1) {
                                const delay = delaysMs[delayIndex];
                                if (delay === undefined) {
                                        throw new RelayerBatchTransactionForwardingError(
                                                `Delay at index ${delayIndex} is undefined`
                                        );
                                }
                                await this.sleep(delay);
                                delayIndex++;
                        }
                }

                return signatures;
        }

        /**
         * Sleeps for the specified number of milliseconds.
         *
         * @param ms - Number of milliseconds to sleep
         * @returns A promise that resolves after the specified delay
         *
         * @internal
         */
        private sleep(ms: number): Promise<void> {
                return new Promise((resolve) => setTimeout(resolve, ms));
        }
}
