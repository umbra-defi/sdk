import { Bytes, SolanaAddress, SolanaSignature } from '@/types';
import { VersionedTransaction } from '@solana/web3.js';

/**
 * Abstract base class for all signer-related errors.
 *
 * @remarks
 * This class provides a foundation for all signer errors, ensuring consistent
 * error handling and type safety across signer implementations. All signer errors
 * should extend this class.
 *
 * @public
 */
export abstract class SignerError extends Error {
        /**
         * Creates a new instance of SignerError.
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
 * Abstract base class defining the contract for Solana message and transaction signing.
 *
 * @remarks
 * Implementations of this class must provide cryptographic signing capabilities
 * for Solana blockchain operations. All methods are asynchronous to support
 * hardware wallets, remote signers, and other async signing mechanisms.
 *
 * @public
 *
 * @example
 * ```typescript
 * class WalletAdapterSigner extends ISigner {
 *   async signMessage(message: Bytes): Promise<SolanaSignature> {
 *     return await this.wallet.signMessage(message);
 *   }
 *
 *   async signTransaction(tx: VersionedTransaction): Promise<VersionedTransaction> {
 *     return await this.wallet.signTransaction(tx);
 *   }
 *
 *   async signTransactions(txs: VersionedTransaction[]): Promise<VersionedTransaction[]> {
 *     return await this.wallet.signAllTransactions(txs);
 *   }
 *
 *   async getPublicKey(): Promise<SolanaAddress> {
 *     return this.wallet.publicKey as SolanaAddress;
 *   }
 * }
 * ```
 */
export abstract class ISigner {
        /**
         * Signs an arbitrary message using the signer's private key.
         *
         * @param message - The message bytes to sign as a `Uint8Array`
         * @returns A promise resolving to a 64-byte Ed25519 signature
         *
         * @throws {@link SignerError} When signing fails due to unavailable signer, invalid message, or cryptographic error
         *
         * @remarks
         * The returned signature is a standard Solana Ed25519 signature (64 bytes).
         * This method is typically used for off-chain message signing and verification.
         * Implementations may throw specific subclasses of `SignerError` such as `MessageSigningError`.
         *
         * @example
         * ```typescript
         * const message = new TextEncoder().encode('Hello, Solana!');
         * const signature = await signer.signMessage(message);
         * // signature is a 64-byte Uint8Array
         * ```
         */
        public abstract signMessage(message: Bytes): Promise<SolanaSignature>;

        /**
         * Signs a single Solana versioned transaction.
         *
         * @param transaction - The `VersionedTransaction` to sign
         * @returns A promise resolving to the signed transaction with signatures attached
         *
         * @throws {@link SignerError} When signing fails due to invalid transaction, missing required signers, or network error
         *
         * @remarks
         * The transaction is modified in-place with the signature. The signer's public key
         * must be included in the transaction's required signers list.
         * Implementations may throw specific subclasses of `SignerError` such as `TransactionSigningError`.
         *
         * @example
         * ```typescript
         * const transaction = new VersionedTransaction(message);
         * transaction.message.recentBlockhash = blockhash;
         * const signedTx = await signer.signTransaction(transaction);
         * await connection.sendTransaction(signedTx);
         * ```
         */
        public abstract signTransaction(
                transaction: VersionedTransaction
        ): Promise<VersionedTransaction>;

        /**
         * Signs multiple Solana versioned transactions in a single batch operation.
         *
         * @param transactions - Array of `VersionedTransaction` objects to sign
         * @returns A promise resolving to an array of signed transactions in the same order as input
         *
         * @throws {@link SignerError} When signing fails for any transaction in the batch
         *
         * @remarks
         * This method should be preferred over calling `signTransaction` multiple times
         * as it allows implementations to optimize batch signing operations, especially
         * for hardware wallets that benefit from batch processing.
         * Implementations may throw specific subclasses of `SignerError` such as `BatchTransactionSigningError`.
         *
         * @example
         * ```typescript
         * const transactions = [tx1, tx2, tx3];
         * const signedTxs = await signer.signTransactions(transactions);
         * // All transactions are now signed and ready to send
         * ```
         */
        public abstract signTransactions(
                transactions: Array<VersionedTransaction>
        ): Promise<Array<VersionedTransaction>>;

        /**
         * Retrieves the public key (Solana address) associated with this signer.
         *
         * @returns A promise resolving to the signer's public key as a branded `SolanaAddress`
         *
         * @throws {@link SignerError} When the public key cannot be retrieved (e.g., signer not initialized)
         *
         * @remarks
         * The returned address is a branded type that ensures type safety when used
         * in Solana-specific contexts. The underlying type is `PublicKey` from `@solana/web3.js`.
         * Implementations may throw specific subclasses of `SignerError` such as `PublicKeyRetrievalError`.
         *
         * @example
         * ```typescript
         * const publicKey = await signer.getPublicKey();
         * console.log(`Signer address: ${publicKey.toBase58()}`);
         * ```
         */
        public abstract getPublicKey(): Promise<SolanaAddress>;
}
