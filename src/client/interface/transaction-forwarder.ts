import { VersionedTransaction } from '@solana/web3.js';

/**
 * Abstract base class for all transaction forwarder-related errors.
 *
 * @remarks
 * This class provides a foundation for all transaction forwarder errors, ensuring consistent
 * error handling and type safety across forwarder implementations. All transaction forwarder errors
 * should extend this class.
 *
 * @public
 */
export abstract class TransactionForwarderError extends Error {
        /**
         * Creates a new instance of TransactionForwarderError.
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
}
