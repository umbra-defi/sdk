import { SolanaTransactionSignature } from '@/types';
import { ITransactionForwarder, TransactionForwarderError } from '@/client/interface';
import { Connection, VersionedTransaction } from '@solana/web3.js';

/**
 * Error thrown when a single transaction forwarding operation fails.
 *
 * @remarks
 * This error is thrown when `forwardTransaction` fails due to network errors,
 * invalid transaction, insufficient fees, or other forwarding issues.
 *
 * @public
 */
export class TransactionForwardingError extends TransactionForwarderError {
        /**
         * Unique identifier code for this error type.
         */
        public readonly code = 'CONNECTION_FORWARDER_TRANSACTION_ERROR';

        /**
         * Creates a new instance of TransactionForwardingError.
         *
         * @param message - Human-readable error message describing what went wrong
         * @param cause - Optional underlying error that caused this error
         */
        public constructor(message: string, cause?: TransactionForwarderError) {
                super(message, cause);
        }
}

/**
 * Error thrown when batch transaction forwarding operation fails.
 *
 * @remarks
 * This error is thrown when `forwardTransactions` fails for any transaction
 * in the batch. The error message should indicate which transaction(s) failed.
 *
 * @public
 */
export class BatchTransactionForwardingError extends TransactionForwarderError {
        /**
         * Unique identifier code for this error type.
         */
        public readonly code = 'CONNECTION_FORWARDER_BATCH_ERROR';

        /**
         * Creates a new instance of BatchTransactionForwardingError.
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
 * delays array length does not match `transactions.length - 1`.
 *
 * @public
 */
export class InvalidDelayArrayError extends TransactionForwarderError {
        /**
         * Unique identifier code for this error type.
         */
        public readonly code = 'CONNECTION_FORWARDER_INVALID_DELAY_ARRAY';

        /**
         * Creates a new instance of InvalidDelayArrayError.
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
 * Transaction forwarder implementation that uses a Solana Connection to forward transactions.
 *
 * @remarks
 * This forwarder directly submits transactions to the Solana network using the provided
 * `Connection` instance. It supports forwarding single transactions and batches of transactions,
 * with optional delays between transactions to prevent rate limiting.
 *
 * **Features:**
 * - Direct RPC submission via Solana Connection
 * - Sequential transaction forwarding with confirmation
 * - Fixed and variable delay support between transactions (after confirmation)
 * - Comprehensive error handling with specific error types
 *
 * @public
 *
 * @example
 * ```typescript
 * // Create from existing connection
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const forwarder = ConnectionBasedForwarder.fromConnection(connection);
 *
 * // Or create from RPC URL
 * const forwarder = ConnectionBasedForwarder.fromRpcUrl('https://api.mainnet-beta.solana.com');
 *
 * // Forward a single transaction
 * const signature = await forwarder.forwardTransaction(signedTx);
 *
 * // Forward multiple transactions sequentially (each confirmed before next)
 * const signatures = await forwarder.forwardTransactions([tx1, tx2, tx3]);
 *
 * // Forward with fixed delay
 * const signatures = await forwarder.forwardTransactions([tx1, tx2, tx3], 500);
 *
 * // Forward with variable delays
 * const delays = [200, 500, 300];
 * const signatures = await forwarder.forwardTransactions([tx1, tx2, tx3, tx4], delays);
 *
 * // Resume from offset with fixed delay
 * const signatures = await forwarder.forwardTransactions([tx1, tx2, tx3], 1, 500);
 *
 * // Resume from offset with variable delays
 * const delays = [200, 500];
 * const signatures = await forwarder.forwardTransactions([tx1, tx2, tx3, tx4], 1, delays);
 * ```
 */
export class ConnectionBasedForwarder extends ITransactionForwarder<SolanaTransactionSignature> {
        /**
         * The Solana Connection instance used for forwarding transactions.
         */
        public readonly connection: Connection;

        /**
         * Creates a new instance of ConnectionBasedForwarder.
         *
         * @param connection - The Solana Connection instance to use for forwarding
         */
        private constructor(connection: Connection) {
                super();
                this.connection = connection;
        }

        /**
         * Returns the underlying Solana `Connection` instance used by this forwarder.
         *
         * @returns The `Connection` instance.
         */
        public getConnection(): Connection {
                return this.connection;
        }

        /**
         * Creates a ConnectionBasedForwarder from an existing Connection instance.
         *
         * @param connection - The Solana Connection instance to use
         * @returns A new ConnectionBasedForwarder instance
         *
         * @example
         * ```typescript
         * const connection = new Connection('https://api.mainnet-beta.solana.com');
         * const forwarder = ConnectionBasedForwarder.fromConnection(connection);
         * ```
         */
        public static fromConnection(connection: Connection): ConnectionBasedForwarder {
                return new ConnectionBasedForwarder(connection);
        }

        /**
         * Creates a ConnectionBasedForwarder from an RPC URL.
         *
         * @param rpcUrl - The RPC endpoint URL (e.g., 'https://api.mainnet-beta.solana.com')
         * @returns A new ConnectionBasedForwarder instance
         *
         * @example
         * ```typescript
         * const forwarder = ConnectionBasedForwarder.fromRpcUrl('https://api.mainnet-beta.solana.com');
         * ```
         */
        public static fromRpcUrl(rpcUrl: string): ConnectionBasedForwarder {
                return new ConnectionBasedForwarder(new Connection(rpcUrl));
        }

        /**
         * Forwards a single signed transaction to the network and waits for confirmation.
         *
         * @param transaction - The signed `VersionedTransaction` to forward
         * @returns A promise resolving to the transaction signature
         *
         * @throws {@link TransactionForwardingError} When forwarding fails due to network errors, invalid transaction, insufficient fees, or connection issues
         *
         * @remarks
         * This method submits a single signed transaction to the Solana network using the
         * underlying Connection's `sendTransaction` method and waits for confirmation before
         * returning. The transaction must be fully signed before calling this method.
         *
         * @example
         * ```typescript
         * const signedTx = await signer.signTransaction(transaction);
         * const signature = await forwarder.forwardTransaction(signedTx);
         * console.log(`Transaction forwarded and confirmed: ${signature}`);
         * ```
         */
        public async forwardTransaction(
                transaction: VersionedTransaction
        ): Promise<SolanaTransactionSignature> {
                try {
                        const signature = await this.connection.sendTransaction(transaction);
                        await this.connection.confirmTransaction(signature);
                        return signature;
                } catch (error) {
                        throw new TransactionForwardingError(
                                `Failed to forward transaction: ${error instanceof Error ? error.message : String(error)}`,
                                error instanceof TransactionForwarderError ? error : undefined
                        );
                }
        }

        /**
         * Forwards multiple signed transactions to the network in a batch operation.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @returns A promise resolving to an array of transaction signatures in the same order as input
         *
         * @throws {@link BatchTransactionForwardingError} When forwarding fails for any transaction in the batch
         *
         * @remarks
         * This method submits multiple signed transactions to the Solana network sequentially.
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
         * @throws {@link BatchTransactionForwardingError} When forwarding fails for any transaction in the batch
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
         * @throws {@link BatchTransactionForwardingError} When forwarding fails for any transaction in the batch
         * @throws {@link InvalidDelayArrayError} When the delays array length does not match `transactions.length - 1`
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
         * @throws {@link BatchTransactionForwardingError} When forwarding fails for any transaction in the batch or when offset is out of bounds
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
         * @throws {@link BatchTransactionForwardingError} When forwarding fails for any transaction in the batch or when offset is out of bounds
         * @throws {@link InvalidDelayArrayError} When the delays array length does not match `(transactions.length - offset) - 1`
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
                                        throw new BatchTransactionForwardingError(
                                                'Invalid offset parameter type'
                                        );
                                }

                                if (offset < 0 || offset >= transactions.length) {
                                        throw new BatchTransactionForwardingError(
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

                                throw new BatchTransactionForwardingError(
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

                        throw new BatchTransactionForwardingError('Invalid parameter type');
                } catch (error) {
                        if (error instanceof TransactionForwarderError) {
                                throw error;
                        }
                        throw new BatchTransactionForwardingError(
                                `Failed to forward batch transactions: ${error instanceof Error ? error.message : String(error)}`,
                                error instanceof TransactionForwarderError ? error : undefined
                        );
                }
        }

        /**
         * Forwards transactions sequentially, confirming each before sending the next.
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
                                throw new BatchTransactionForwardingError(
                                        `Transaction is undefined`
                                );
                        }

                        const signature = await this.connection.sendTransaction(transaction);
                        await this.connection.confirmTransaction(signature);
                        signatures.push(signature);
                }

                return signatures;
        }

        /**
         * Forwards transactions sequentially with a fixed delay between each, confirming each before sending the next.
         *
         * @param transactions - Array of transactions to forward
         * @param delayMs - Fixed delay in milliseconds between transactions (after confirmation)
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
                                throw new BatchTransactionForwardingError(
                                        `Transaction at index ${i} is undefined`
                                );
                        }

                        const signature = await this.connection.sendTransaction(transaction);
                        await this.connection.confirmTransaction(signature);
                        signatures.push(signature);

                        if (i < transactions.length - 1) {
                                await this.sleep(delayMs);
                        }
                }

                return signatures;
        }

        /**
         * Forwards transactions sequentially with variable delays between each, confirming each before sending the next.
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
                        throw new InvalidDelayArrayError(transactions.length, delaysMs.length);
                }

                const signatures: Array<SolanaTransactionSignature> = [];

                for (let i = 0; i < transactions.length; i++) {
                        const transaction = transactions[i];
                        if (!transaction) {
                                throw new BatchTransactionForwardingError(
                                        `Transaction at index ${i} is undefined`
                                );
                        }

                        const signature = await this.connection.sendTransaction(transaction);
                        await this.connection.confirmTransaction(signature);
                        signatures.push(signature);

                        if (i < transactions.length - 1) {
                                const delay = delaysMs[i];
                                if (delay === undefined) {
                                        throw new BatchTransactionForwardingError(
                                                `Delay at index ${i} is undefined`
                                        );
                                }
                                await this.sleep(delay);
                        }
                }

                return signatures;
        }

        /**
         * Forwards transactions sequentially starting from a specific offset with a fixed delay, confirming each before sending the next.
         *
         * @param transactions - Array of transactions to forward
         * @param offset - The index to start from
         * @param delayMs - Fixed delay in milliseconds between transactions (after confirmation)
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
                                throw new BatchTransactionForwardingError(
                                        `Transaction at index ${i} is undefined`
                                );
                        }

                        const signature = await this.connection.sendTransaction(transaction);
                        await this.connection.confirmTransaction(signature);
                        signatures.push(signature);

                        // Wait before next transaction (except after the last one)
                        if (i < transactions.length - 1 && delayMs > 0) {
                                await this.sleep(delayMs);
                        }
                }

                return signatures;
        }

        /**
         * Forwards transactions sequentially starting from a specific offset with variable delays, confirming each before sending the next.
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
                        throw new InvalidDelayArrayError(remainingCount, delaysMs.length);
                }

                const signatures: Array<SolanaTransactionSignature> = [];
                let delayIndex = 0;

                for (let i = offset; i < transactions.length; i++) {
                        const transaction = transactions[i];
                        if (!transaction) {
                                throw new BatchTransactionForwardingError(
                                        `Transaction at index ${i} is undefined`
                                );
                        }

                        const signature = await this.connection.sendTransaction(transaction);
                        await this.connection.confirmTransaction(signature);
                        signatures.push(signature);

                        // Wait before next transaction (except after the last one)
                        if (i < transactions.length - 1) {
                                const delay = delaysMs[delayIndex];
                                if (delay === undefined) {
                                        throw new BatchTransactionForwardingError(
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
