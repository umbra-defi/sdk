import { Day, Hour, Minute, Month, PoseidonHash, Second, U128, Year } from '@/types';
import { PoseidonHasher } from '@/utils';
import { getPurposeCode } from '@/client/helpers/get-purpose-code';

/**
 * Generates a linker hash for transaction privacy and compliance.
 *
 * @param masterViewingKey
 * @param purpose - The transaction purpose (determines the purpose code)
 * @param year - Transaction year
 * @param month - Transaction month
 * @param day - Transaction day
 * @param hour - Transaction hour
 * @param minute - Transaction minute
 * @param second - Transaction second
 * @returns A 32-byte Poseidon hash that links transactions with the same parameters
 *
 * @throws {@link InvalidPurposeCodeError} When the purpose string is not supported
 * @throws {@link PoseidonHasherError} When Poseidon hashing fails
 *
 * @remarks
 * The linker hash is computed using Poseidon over:
 * - Master viewing key (for user identification)
 * - Purpose code (for transaction type)
 * - Timestamp components (year, month, day, hour, minute, second)
 *
 * This hash enables:
 * - **Privacy**: Different transactions produce different hashes
 * - **Compliance**: Authorized parties can link transactions with the same parameters
 * - **Uniqueness**: Each unique combination of parameters produces a unique hash
 *
 * The hash is deterministic - the same inputs will always produce the same hash,
 * allowing for transaction linking while maintaining privacy for unrelated transactions.
 *
 * @example
 * ```typescript
 * const linkerHash = wallet.generateLinkerHash(
 *   'create_spl_deposit_with_hidden_amount',
 *   2024n, 1n, 15n, 10n, 30n, 0n
 * );
 * // Returns a 32-byte PoseidonHash
 * ```
 */
export function generateIndividualTransactionViewingKey(
        masterViewingKey: U128,
        purpose:
                | 'claim_spl_deposit_with_hidden_amount'
                | 'claim_spl_deposit_with_public_amount'
                | 'create_spl_deposit_with_hidden_amount'
                | 'create_spl_deposit_with_public_amount',
        year: Year,
        month: Month,
        day: Day,
        hour: Hour,
        minute: Minute,
        second: Second
): PoseidonHash {
        const purposeCode = getPurposeCode(purpose);
        return PoseidonHasher.hash([
                masterViewingKey,
                purposeCode,
                year,
                month,
                day,
                hour,
                minute,
                second,
        ]);
}
