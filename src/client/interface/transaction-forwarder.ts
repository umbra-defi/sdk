import { VersionedTransaction } from '@solana/web3.js';

/**
 * Abstract base class for all transaction forwarder-related errors.
 *
 * @remarks
 * This class provides a foundation for all transaction forwarder errors, ensuring consistent
 * error handling and type safety across forwarder implementations. All transaction forwarder errors
 * in implementations should extend this class and provide a unique error code.
 *
 * The error code serves as an identifier for programmatic error handling and allows implementations
 * to define specific error types with associated codes for different failure scenarios.
 *
 * @public
 */
export abstract class TransactionForwarderError extends Error {
        /**
         * Unique identifier code for this error type.
         *
         * @remarks
         * This code is used to identify the specific error type programmatically.
         * Each error subclass in implementations should define a unique code.
         */
        public abstract readonly code: string;

        /**
         * Creates a new instance of TransactionForwarderError.
         *
         * @param message - Human-readable error message describing what went wrong
         * @param cause - Optional underlying error that caused this error
         */
        public constructor(message: string, cause?: TransactionForwarderError) {
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
 * Abstract base class defining the contract for forwarding Solana transactions.
 *
 * @remarks
 * Implementations of this class must provide transaction forwarding capabilities for Solana
 * blockchain operations. Transaction forwarders are responsible for submitting signed transactions
 * to the network, handling retries, and managing transaction lifecycle.
 *
 * This interface supports forwarding both single transactions and batches of transactions,
 * allowing implementations to optimize for different use cases such as:
 * - Direct RPC submission
 * - Relayer services
 * - Transaction batching and optimization
 * - Custom routing logic
 *
 * The generic type parameter `T` represents the return type of the forwarding operation,
 * which may vary by implementation (e.g., transaction signatures, receipt objects, or custom response types).
 *
 * @typeParam T - The type returned after successfully forwarding a transaction
 *
 * @public
 *
 * @example
 * ```typescript
 * // Example with transaction signature as return type
 * class RpcTransactionForwarder extends ITransactionForwarder<string> {
 *   async forwardTransaction(tx: VersionedTransaction): Promise<string> {
 *     const signature = await this.connection.sendTransaction(tx);
 *     return signature;
 *   }
 *
 *   async forwardTransactions(txs: VersionedTransaction[]): Promise<string[]> {
 *     const signatures = await Promise.all(
 *       txs.map(tx => this.connection.sendTransaction(tx))
 *     );
 *     return signatures;
 *   }
 * }
 *
 * // Example with custom response type
 * interface ForwardResponse {
 *   signature: string;
 *   slot: number;
 *   confirmation: string;
 * }
 *
 * class RelayerForwarder extends ITransactionForwarder<ForwardResponse> {
 *   async forwardTransaction(tx: VersionedTransaction): Promise<ForwardResponse> {
 *     // Implementation using relayer service
 *   }
 *   // ... other methods
 * }
 * ```
 */
export abstract class ITransactionForwarder<T> {
        /**
         * Forwards a single signed transaction to the network.
         *
         * @param transaction - The signed `VersionedTransaction` to forward
         * @returns A promise resolving to the result of forwarding the transaction (type `T`)
         *
         * @throws {@link TransactionForwarderError} When forwarding fails due to network errors, invalid transaction, insufficient fees, or forwarding service unavailability
         *
         * @remarks
         * This method submits a single signed transaction to the Solana network. The transaction
         * must be fully signed before calling this method. Implementations should handle:
         * - Network connectivity issues
         * - Transaction validation
         * - Fee estimation and payment
         * - Retry logic for transient failures
         *
         * The return type `T` is implementation-specific and may represent:
         * - Transaction signature (string)
         * - Receipt object with confirmation details
         * - Custom response type with additional metadata
         *
         * @example
         * ```typescript
         * const signedTx = await signer.signTransaction(transaction);
         * const result = await forwarder.forwardTransaction(signedTx);
         * console.log(`Transaction forwarded: ${result}`);
         * ```
         */
        public abstract forwardTransaction(transaction: VersionedTransaction): Promise<T>;

        /**
         * Forwards multiple signed transactions to the network in a batch operation.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @returns A promise resolving to an array of forwarding results in the same order as input
         *
         * @throws {@link TransactionForwarderError} When forwarding fails for any transaction in the batch
         *
         * @remarks
         * This method submits multiple signed transactions to the Solana network in a single batch.
         * All transactions must be fully signed before calling this method. This method should be
         * preferred over calling `forwardTransaction` multiple times as it allows implementations to:
         * - Optimize batch submission
         * - Handle transaction ordering and dependencies
         * - Implement efficient retry strategies
         * - Reduce network overhead
         *
         * The return type is an array of `T`, where each element corresponds to the result of
         * forwarding the transaction at the same index in the input array.
         *
         * Implementations may choose to:
         * - Submit transactions sequentially or in parallel
         * - Handle partial failures (some transactions succeed, others fail)
         * - Implement transaction dependency resolution
         *
         * @example
         * ```typescript
         * const signedTxs = await signer.signTransactions(transactions);
         * const results = await forwarder.forwardTransactions(signedTxs);
         * // results[0] corresponds to transactions[0], results[1] to transactions[1], etc.
         * results.forEach((result, index) => {
         *   console.log(`Transaction ${index} forwarded: ${result}`);
         * });
         * ```
         */
        public abstract forwardTransactions(
                transactions: Array<VersionedTransaction>
        ): Promise<Array<T>>;

        /**
         * Forwards multiple signed transactions to the network with a fixed delay between each transaction.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @param delayMs - Fixed delay in milliseconds to wait between forwarding each transaction
         * @returns A promise resolving to an array of forwarding results in the same order as input
         *
         * @throws {@link TransactionForwarderError} When forwarding fails for any transaction in the batch
         *
         * @remarks
         * This overload submits transactions sequentially with a fixed delay between each submission.
         * The delay helps prevent rate limiting and allows for better transaction ordering control.
         *
         * **Execution Flow:**
         * 1. Forward `transactions[0]`
         * 2. Wait `delayMs` milliseconds
         * 3. Forward `transactions[1]`
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
         * const results = await forwarder.forwardTransactions(signedTxs, 500);
         * ```
         */
        public abstract forwardTransactions(
                transactions: Array<VersionedTransaction>,
                delayMs: number
        ): Promise<Array<T>>;

        /**
         * Forwards multiple signed transactions to the network with variable delays between transactions.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @param delaysMs - Array of delays in milliseconds between each transaction (must have length `transactions.length - 1`)
         * @returns A promise resolving to an array of forwarding results in the same order as input
         *
         * @throws {@link TransactionForwarderError} When forwarding fails for any transaction in the batch or when the delays array length does not match `transactions.length - 1`
         *
         * @remarks
         * This overload submits transactions sequentially with variable delays between each submission.
         * Each delay in the array corresponds to the wait time after forwarding the transaction at
         * the same index.
         *
         * **Execution Flow:**
         * 1. Forward `transactions[0]`
         * 2. Wait `delaysMs[0]` milliseconds
         * 3. Forward `transactions[1]`
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
         * const results = await forwarder.forwardTransactions(signedTxs, delays);
         * ```
         */
        public abstract forwardTransactions(
                transactions: Array<VersionedTransaction>,
                delaysMs: Array<number>
        ): Promise<Array<T>>;

        /**
         * Forwards multiple signed transactions to the network starting from a specific offset with a fixed delay between each transaction.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @param offset - The index in the array to start forwarding from (0-based). Transactions before this index are skipped.
         * @param delayMs - Fixed delay in milliseconds to wait between forwarding each transaction
         * @returns A promise resolving to an array of forwarding results in the same order as the remaining transactions
         *
         * @throws {@link TransactionForwarderError} When forwarding fails for any transaction in the batch or when offset is out of bounds
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
         * const results = await forwarder.forwardTransactions(signedTxs, 2, 500);
         * // Or resume from index 3 without delay
         * const results = await forwarder.forwardTransactions(signedTxs, 3, 0);
         * ```
         */
        public abstract forwardTransactions(
                transactions: Array<VersionedTransaction>,
                offset: number,
                delayMs: number
        ): Promise<Array<T>>;

        /**
         * Forwards multiple signed transactions to the network starting from a specific offset with variable delays between transactions.
         *
         * @param transactions - Array of signed `VersionedTransaction` objects to forward
         * @param offset - The index in the array to start forwarding from (0-based). Transactions before this index are skipped.
         * @param delaysMs - Array of delays in milliseconds between each transaction (must have length equal to remaining transactions minus 1)
         * @returns A promise resolving to an array of forwarding results in the same order as the remaining transactions
         *
         * @throws {@link TransactionForwarderError} When forwarding fails for any transaction in the batch, when offset is out of bounds, or when the delays array length does not match `(transactions.length - offset) - 1`
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
         * const results = await forwarder.forwardTransactions(signedTxs, 1, delays);
         * ```
         */
        public abstract forwardTransactions(
                transactions: Array<VersionedTransaction>,
                offset: number,
                delaysMs: Array<number>
        ): Promise<Array<T>>;
}
