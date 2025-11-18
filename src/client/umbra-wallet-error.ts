/**
 * Abstract base class for all Umbra wallet-related errors.
 *
 * @remarks
 * This class provides a foundation for all Umbra wallet errors, ensuring consistent
 * error handling and type safety across wallet operations. All Umbra wallet errors
 * should extend this class.
 *
 * @public
 */
export abstract class UmbraWalletError extends Error {
        /**
         * Creates a new instance of UmbraWalletError.
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
