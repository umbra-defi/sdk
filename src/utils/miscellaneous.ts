import {
        AccountOffset,
        InstructionSeed,
        MintAddress,
        PoseidonHash,
        SolanaAddress,
        U128,
        U128LeBytes,
        U256,
        U256LeBytes,
        U64,
} from '@/types';
import { Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { randomBytes } from '@noble/hashes/utils.js';
import {
        convertU128LeBytesToU128,
        convertU16LeBytesToU16,
        convertU256LeBytesToU256,
} from './convertors';
import { U16LeBytes } from '@/types';
import { MERKLE_TREE_DEPTH } from '@/constants';

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

/**
 * Error thrown when account offset generation fails.
 *
 * @remarks
 * This error is thrown when generating random account offsets fails due to
 * random number generation errors, conversion failures, or invalid parameters.
 *
 * @public
 */
export class AccountOffsetGenerationError extends Error {
        /**
         * Creates a new instance of AccountOffsetGenerationError.
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
 * Generates a cryptographically secure random offset for selecting a relayer fees pool account.
 *
 * @param _instructionSeed - The instruction seed (currently unused, reserved for future deterministic generation)
 * @param _mintAddress - The mint address of the token (currently unused, reserved for future deterministic generation)
 * @returns A random 16-bit unsigned integer (U16) account offset within the valid range
 *
 * @throws {@link AccountOffsetGenerationError} When random generation fails or conversion errors occur
 *
 * @remarks
 * This function generates a random offset used to select a specific relayer fees pool account
 * from multiple available pools. The offset is used to derive the Program Derived Address (PDA)
 * for the selected pool account.
 *
 * **Security:**
 * This function uses cryptographically secure random number generation to ensure the offset
 * is unpredictable and cannot be manipulated by attackers.
 *
 * **Current Implementation:**
 * Currently, there is only one relayer fees pool account (`NUMBER_OF_ACCOUNTS = 1`), so this
 * function will always return `0`. The parameters `_instructionSeed` and `_mintAddress` are
 * currently unused but reserved for future deterministic generation based on instruction
 * context and token type.
 *
 * **Account Offset:**
 * The returned offset is a 16-bit unsigned integer (U16) that must be less than the number
 * of available accounts. It's used as part of the seed derivation for the pool account PDA.
 *
 * @example
 * ```typescript
 * // Generate a random offset for relayer fees pool selection
 * const offset = generateRandomRelayerFeesPoolOffset(instructionSeed, mintAddress);
 * // Use the offset to derive the pool account address
 * const poolAccount = deriveRelayerFeesPoolAccount(offset);
 * ```
 */
export function generateRandomRelayerFeesPoolOffset(
        _instructionSeed: InstructionSeed,
        _mintAddress: MintAddress
): AccountOffset {
        const NUMBER_OF_ACCOUNTS = 1;

        if (NUMBER_OF_ACCOUNTS <= 0) {
                throw new AccountOffsetGenerationError('Number of accounts must be greater than 0');
        }

        try {
                // Generate 2 random bytes (16 bits) for U16
                const randomBytesArray = randomBytes(2);
                const randomU16 = convertU16LeBytesToU16(randomBytesArray as U16LeBytes);
                const randomNumber = Number(randomU16) % NUMBER_OF_ACCOUNTS;

                return BigInt(randomNumber) as AccountOffset;
        } catch (error) {
                throw new AccountOffsetGenerationError(
                        `Failed to generate random relayer fees pool offset: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Generates a cryptographically secure random offset for selecting a fees configuration account.
 *
 * @param _instructionSeed - The instruction seed (currently unused, reserved for future deterministic generation)
 * @param _mintAddress - The mint address of the token (currently unused, reserved for future deterministic generation)
 * @returns A random 16-bit unsigned integer (U16) account offset within the valid range
 *
 * @throws {@link AccountOffsetGenerationError} When random generation fails or conversion errors occur
 *
 * @remarks
 * This function generates a random offset used to select a specific fees configuration account
 * from multiple available configurations. The offset is used to derive the Program Derived Address (PDA)
 * for the selected configuration account.
 *
 * **Security:**
 * This function uses cryptographically secure random number generation to ensure the offset
 * is unpredictable and cannot be manipulated by attackers.
 *
 * **Current Implementation:**
 * Currently, there is only one fees configuration account (`NUMBER_OF_ACCOUNTS = 1`), so this
 * function will always return `0`. The parameters `_instructionSeed` and `_mintAddress` are
 * currently unused but reserved for future deterministic generation based on instruction
 * context and token type.
 *
 * **Account Offset:**
 * The returned offset is a 16-bit unsigned integer (U16) that must be less than the number
 * of available accounts. It's used as part of the seed derivation for the configuration account PDA.
 *
 * @example
 * ```typescript
 * // Generate a random offset for fees configuration account selection
 * const offset = generateRandomFeesConfigurationAccountOffset(instructionSeed, mintAddress);
 * // Use the offset to derive the configuration account address
 * const configAccount = deriveFeesConfigurationAccount(offset);
 * ```
 */
export function generateRandomFeesConfigurationAccountOffset(
        _instructionSeed: InstructionSeed,
        _mintAddress: MintAddress
): AccountOffset {
        const NUMBER_OF_ACCOUNTS = 1;

        if (NUMBER_OF_ACCOUNTS <= 0) {
                throw new AccountOffsetGenerationError('Number of accounts must be greater than 0');
        }

        try {
                // Generate 2 random bytes (16 bits) for U16
                const randomBytesArray = randomBytes(2);
                const randomU16 = convertU16LeBytesToU16(randomBytesArray as U16LeBytes);
                const randomNumber = Number(randomU16) % NUMBER_OF_ACCOUNTS;

                return BigInt(randomNumber) as AccountOffset;
        } catch (error) {
                throw new AccountOffsetGenerationError(
                        `Failed to generate random fees configuration account offset: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Generates a cryptographically secure random offset for selecting an Arcium commission fees account.
 *
 * @param _instructionSeed - The instruction seed (currently unused, reserved for future deterministic generation)
 * @param _mintAddress - The mint address of the token (currently unused, reserved for future deterministic generation)
 * @returns A random 16-bit unsigned integer (U16) account offset within the valid range
 *
 * @throws {@link AccountOffsetGenerationError} When random generation fails or conversion errors occur
 *
 * @remarks
 * This function generates a random offset used to select a specific Arcium commission fees account
 * from multiple available accounts. The offset is used to derive the Program Derived Address (PDA)
 * for the selected commission fees account.
 *
 * **Security:**
 * This function uses cryptographically secure random number generation to ensure the offset
 * is unpredictable and cannot be manipulated by attackers.
 *
 * **Current Implementation:**
 * Currently, there is only one Arcium commission fees account (`NUMBER_OF_ACCOUNTS = 1`), so this
 * function will always return `0`. The parameters `_instructionSeed` and `_mintAddress` are
 * currently unused but reserved for future deterministic generation based on instruction
 * context and token type.
 *
 * **Account Offset:**
 * The returned offset is a 16-bit unsigned integer (U16) that must be less than the number
 * of available accounts. It's used as part of the seed derivation for the commission fees account PDA.
 *
 * @example
 * ```typescript
 * // Generate a random offset for Arcium commission fees account selection
 * const offset = generateRandomArciumCommissionFeesAccountOffset(instructionSeed, mintAddress);
 * // Use the offset to derive the commission fees account address
 * const commissionAccount = deriveArciumCommissionFeesAccount(offset);
 * ```
 */
export function generateRandomArciumCommissionFeesAccountOffset(
        _instructionSeed: InstructionSeed,
        _mintAddress: MintAddress
): AccountOffset {
        const NUMBER_OF_ACCOUNTS = 1;

        if (NUMBER_OF_ACCOUNTS <= 0) {
                throw new AccountOffsetGenerationError('Number of accounts must be greater than 0');
        }

        try {
                // Generate 2 random bytes (16 bits) for U16
                const randomBytesArray = randomBytes(2);
                const randomU16 = convertU16LeBytesToU16(randomBytesArray as U16LeBytes);
                const randomNumber = Number(randomU16) % NUMBER_OF_ACCOUNTS;

                return BigInt(randomNumber) as AccountOffset;
        } catch (error) {
                throw new AccountOffsetGenerationError(
                        `Failed to generate random Arcium commission fees account offset: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Generates a cryptographically secure random offset for selecting a public commission fees account.
 *
 * @param _instructionSeed - The instruction seed (currently unused, reserved for future deterministic generation)
 * @param _mintAddress - The mint address of the token (currently unused, reserved for future deterministic generation)
 * @returns A random 16-bit unsigned integer (U16) account offset within the valid range
 *
 * @throws {@link AccountOffsetGenerationError} When random generation fails or conversion errors occur
 *
 * @remarks
 * This function generates a random offset used to select a specific public commission fees account
 * from multiple available accounts. The offset is used to derive the Program Derived Address (PDA)
 * for the selected public commission fees account.
 *
 * **Security:**
 * This function uses cryptographically secure random number generation to ensure the offset
 * is unpredictable and cannot be manipulated by attackers.
 *
 * **Current Implementation:**
 * Currently, there is only one public commission fees account (`NUMBER_OF_ACCOUNTS = 1`), so this
 * function will always return `0`. The parameters `_instructionSeed` and `_mintAddress` are
 * currently unused but reserved for future deterministic generation based on instruction
 * context and token type.
 *
 * **Account Offset:**
 * The returned offset is a 16-bit unsigned integer (U16) that must be less than the number
 * of available accounts. It's used as part of the seed derivation for the public commission fees account PDA.
 *
 * @example
 * ```typescript
 * // Generate a random offset for public commission fees account selection
 * const offset = generateRandomPublicCommissionFeesAccountOffset(instructionSeed, mintAddress);
 * // Use the offset to derive the public commission fees account address
 * const publicCommissionAccount = derivePublicCommissionFeesAccount(offset);
 * ```
 */
export function generateRandomPublicCommissionFeesAccountOffset(
        _instructionSeed: InstructionSeed,
        _mintAddress: MintAddress
): AccountOffset {
        const NUMBER_OF_ACCOUNTS = 1;

        if (NUMBER_OF_ACCOUNTS <= 0) {
                throw new AccountOffsetGenerationError('Number of accounts must be greater than 0');
        }

        try {
                // Generate 2 random bytes (16 bits) for U16
                const randomBytesArray = randomBytes(2);
                const randomU16 = convertU16LeBytesToU16(randomBytesArray as U16LeBytes);
                const randomNumber = Number(randomU16) % NUMBER_OF_ACCOUNTS;

                return BigInt(randomNumber) as AccountOffset;
        } catch (error) {
                throw new AccountOffsetGenerationError(
                        `Failed to generate random public commission fees account offset: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Checks whether a specific bit is set in a numeric value.
 *
 * @param value - The numeric value whose bits will be inspected.
 * @param bit - The zero-based index of the bit to check (0 for least-significant bit).
 * @returns `true` if the bit at the given index is set to 1, otherwise `false`.
 */
export function isBitSet(value: number, bit: number): boolean {
        return (value & (1 << bit)) !== 0;
}

/**
 * Generates a uniformly random 256-bit value.
 *
 * @returns A random {@link U256} value sampled from 32 bytes of cryptographic randomness.
 *
 * @remarks
 * This function uses `randomBytes(32)` to obtain 32 bytes of entropy and then interprets the
 * resulting `Uint8Array` as a little-endian 256-bit integer.
 *
 * @example
 * ```ts
 * const randomValue: U256 = generateRandomU256();
 * console.log(randomValue.toString());
 * ```
 */
export function generateRandomU256(): U256 {
        const randomBytesArray = randomBytes(32);
        return convertU256LeBytesToU256(randomBytesArray as U256LeBytes);
}

/**
 * Generates a cryptographically secure random 128-bit blinding factor.
 *
 * @returns A random {@link U128} value sampled from 16 bytes of cryptographic randomness.
 *
 * @remarks
 * This function uses `randomBytes(16)` to obtain 16 bytes of entropy and then interprets the
 * resulting `Uint8Array` as a little-endian 128-bit integer.
 *
 * **Blinding Factors:**
 * Blinding factors are random values used in cryptographic operations to prevent information
 * leakage and enhance privacy. They are commonly used in:
 * - Commitments and hash-based constructions
 * - Zero-knowledge proof systems
 * - Randomized encodings
 * - Privacy-preserving protocols
 *
 * The generated blinding factor can be used to blind sensitive values (such as viewing keys
 * or secrets) before they are used in cryptographic operations, ensuring that the same value
 * produces different outputs each time it's used.
 *
 * **Security:**
 * This function uses cryptographically secure random number generation to ensure the blinding
 * factor is unpredictable and cannot be guessed or manipulated by attackers.
 *
 * @example
 * ```ts
 * const blindingFactor: U128 = generateRandomBlindingFactor();
 * console.log(blindingFactor.toString());
 *
 * // Use the blinding factor in a commitment
 * const commitment = hash(secretValue, blindingFactor);
 * ```
 */
export function generateRandomBlindingFactor(): U128 {
        const randomBytesArray = randomBytes(16);
        return convertU128LeBytesToU128(randomBytesArray as U128LeBytes);
}

/**
 * Splits a Solana public key into two 128-bit limbs.
 *
 * @param publicKey - The {@link SolanaAddress} to split.
 * @returns A tuple `[lo, hi]` of {@link U128} values representing the first and second halves
 *          of the public key bytes, interpreted as little-endian 128-bit integers.
 *
 * @remarks
 * This is useful when a 256-bit public key needs to be represented as two field elements
 * (e.g. for zero-knowledge circuits or Poseidon hashing) without losing information.
 *
 * @example
 * ```ts
 * const [lo, hi] = breakPublicKeyIntoTwoParts(userPublicKey);
 * console.log(lo.toString(), hi.toString());
 * ```
 */
export function breakPublicKeyIntoTwoParts(publicKey: SolanaAddress): [U128, U128] {
        const publicKeyBytes = publicKey.toBytes();
        const publicKeyBytesLength = publicKeyBytes.length;
        const publicKeyBytesFirstHalf = publicKeyBytes.slice(0, publicKeyBytesLength / 2);
        const publicKeyBytesSecondHalf = publicKeyBytes.slice(publicKeyBytesLength / 2);
        return [
                convertU128LeBytesToU128(publicKeyBytesFirstHalf as U128LeBytes),
                convertU128LeBytesToU128(publicKeyBytesSecondHalf as U128LeBytes),
        ];
}

/**
 * Derives the left/right sibling indicators for a Merkle tree path from a commitment insertion index.
 *
 * @remarks
 * A Merkle proof requires knowing, for each tree level, whether the current node sits on the left or right
 * side so the correct sibling hash can be concatenated in the proper order. This helper inspects each bit
 * of the provided `insertionIndex` (from least-significant upwards) and returns an array where:
 *
 * - `0` means "sibling is on the left" (the current node is on the right)
 * - `1` means "sibling is on the right" (the current node is on the left)
 *
 * The array length matches {@link MERKLE_TREE_DEPTH}, producing one entry per tree level.
 *
 * @param insertionIndex - Zero-based index of the commitment within the Merkle tree.
 *
 * @returns An array of `0 | 1` values describing sibling positions for each tree level, from leaf to root.
 *
 * @throws {@link RangeError} When `insertionIndex` is negative or exceeds the maximum index representable
 * for the configured tree depth (i.e. `2^MERKLE_TREE_DEPTH - 1`).
 */
export function getSiblingMerkleIndicesFromInsertionIndex(insertionIndex: U64): Array<0 | 1> {
        if (insertionIndex < BigInt(0)) {
                throw new RangeError(
                        'Insertion index cannot be negative when computing Merkle siblings.'
                );
        }

        const maxInsertionIndex = BigInt(1) << BigInt(MERKLE_TREE_DEPTH);
        if (insertionIndex >= maxInsertionIndex) {
                throw new RangeError(
                        `Insertion index ${insertionIndex.toString()} exceeds tree capacity for depth ${MERKLE_TREE_DEPTH}.`
                );
        }

        const siblingIndices: Array<0 | 1> = [];
        for (let i = 0; i < MERKLE_TREE_DEPTH; ++i) {
                siblingIndices.push(
                        (insertionIndex & (BigInt(1) << BigInt(i))) === BigInt(0) ? 1 : 0
                );
        }

        return siblingIndices;
}

export function convertHexStringToPoseidonHash(hexString: string): PoseidonHash {
        const bytes = Buffer.from(hexString, 'hex');
        return Uint8Array.from(bytes.reverse()) as PoseidonHash;
}
