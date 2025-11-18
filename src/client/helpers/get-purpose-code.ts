import { U128 } from '@/types';
import { UmbraWalletError } from '../umbra-wallet-error';

/**
 * Gets the purpose code for a given transaction purpose string.
 *
 * @param purpose - The transaction purpose string
 * @returns The corresponding purpose code as a U128
 *
 * @throws {@link InvalidPurposeCodeError} When the purpose string is not supported
 *
 * @remarks
 * Purpose codes are used to identify different types of transactions in the Umbra protocol.
 * Supported purposes:
 * - `claim_spl_deposit_with_hidden_amount` → 0
 * - `claim_spl_deposit_with_public_amount` → 1
 * - `create_spl_deposit_with_hidden_amount` → 2
 * - `create_spl_deposit_with_public_amount` → 3
 *
 * Purpose codes are included in linker hash generation to ensure different transaction
 * types produce different hashes even with the same timestamp.
 *
 * @example
 * ```typescript
 * const purposeCode = getPurposeCode('create_spl_deposit_with_hidden_amount');
 * // Returns 2n
 * ```
 */
export function getPurposeCode(purpose: string): U128 {
        const PURPOSE_CODES_MAPPER: Map<string, U128> = new Map([
                ['create_spl_deposit_with_hidden_amount', 0n as U128],
                ['create_spl_deposit_with_public_amount', 1n as U128],
                ['claim_spl_deposit_with_hidden_amount', 2n as U128],
                ['claim_spl_deposit_with_public_amount', 3n as U128],
        ]);

        const purposeCode = PURPOSE_CODES_MAPPER.get(purpose);
        if (purposeCode === undefined) {
                throw new InvalidPurposeCodeError(purpose);
        }
        return purposeCode;
}

/**
 * Error thrown when an invalid purpose code is requested.
 *
 * @remarks
 * This error is thrown when `getPurposeCode` is called with an unsupported purpose string.
 *
 * @public
 */
export class InvalidPurposeCodeError extends UmbraWalletError {
        /**
         * Creates a new instance of InvalidPurposeCodeError.
         *
         * @param purpose - The invalid purpose string that was provided
         * @param cause - Optional underlying error that caused the error
         */
        public constructor(purpose: string, cause?: Error) {
                super(
                        `Invalid purpose code: "${purpose}". Supported purposes are: claim_spl_deposit_with_hidden_amount, claim_spl_deposit_with_public_amount, create_spl_deposit_with_hidden_amount, create_spl_deposit_with_public_amount`,
                        cause
                );
        }
}
