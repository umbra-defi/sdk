import { Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

/**
 * Error thrown when transaction conversion fails.
 *
 * @remarks
 * This error is thrown when converting a legacy Transaction to a VersionedTransaction
 * fails due to missing required fields, invalid transaction data, or compilation errors.
 *
 * @public
 */
export class TransactionConversionError extends Error {
        /**
         * Creates a new instance of TransactionConversionError.
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
 * Converts a legacy Solana Transaction to a VersionedTransaction (v0).
 *
 * @param transaction - The legacy Transaction to convert
 * @returns A new VersionedTransaction (v0) with the same instructions and accounts
 *
 * @throws {@link TransactionConversionError} When conversion fails due to missing fee payer, missing recent blockhash, or compilation errors
 *
 * @remarks
 * This function converts a legacy Solana Transaction (which uses `recentBlockhash`) to a
 * modern VersionedTransaction (v0) format. The conversion preserves:
 * - All instructions from the original transaction
 * - The fee payer (payer key)
 * - The recent blockhash (used for transaction expiration)
 *
 * **Requirements:**
 * - The transaction must have a `feePayer` set
 * - The transaction must have a `recentBlockhash` set
 * - The transaction must have at least one instruction (though empty transactions are technically valid)
 *
 * **Conversion Process:**
 * 1. Extracts instructions, fee payer, and recent blockhash from the legacy transaction
 * 2. Creates a new `TransactionMessage` with these components
 * 3. Compiles the message to v0 format
 * 4. Wraps it in a `VersionedTransaction`
 *
 * **Note:** This conversion does not preserve transaction signatures. If the original transaction
 * was signed, you will need to re-sign the returned VersionedTransaction.
 *
 * @example
 * ```typescript
 * // Convert a legacy transaction
 * const legacyTx = new Transaction();
 * legacyTx.add(instruction);
 * legacyTx.feePayer = payerPublicKey;
 * legacyTx.recentBlockhash = blockhash;
 *
 * const versionedTx = convertLegacyTransactionToVersionedTransaction(legacyTx);
 * // versionedTx is now a VersionedTransaction (v0) ready for signing and sending
 * ```
 *
 * @example
 * ```typescript
 * // Handle conversion errors
 * try {
 *   const versionedTx = convertLegacyTransactionToVersionedTransaction(legacyTx);
 * } catch (error) {
 *   if (error instanceof TransactionConversionError) {
 *     console.error('Conversion failed:', error.message);
 *   }
 * }
 * ```
 */
export function convertLegacyTransactionToVersionedTransaction(
        transaction: Transaction
): VersionedTransaction {
        if (!transaction.feePayer) {
                throw new TransactionConversionError(
                        'Transaction must have a fee payer set to convert to VersionedTransaction'
                );
        }

        if (!transaction.recentBlockhash) {
                throw new TransactionConversionError(
                        'Transaction must have a recent blockhash set to convert to VersionedTransaction'
                );
        }

        try {
                const message = new TransactionMessage({
                        instructions: transaction.instructions,
                        payerKey: transaction.feePayer,
                        recentBlockhash: transaction.recentBlockhash,
                });

                const compiledMessage = message.compileToV0Message();

                return new VersionedTransaction(compiledMessage);
        } catch (error) {
                throw new TransactionConversionError(
                        `Failed to convert transaction to VersionedTransaction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
