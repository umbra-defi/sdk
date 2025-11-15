import { poseidon as createPoseidon, splitConstants } from '@noble/curves/abstract/poseidon.js';
import { bn254_Fr as Fr } from '@noble/curves/bn254.js';
import { PoseidonHash } from '@/types/cryptography';
import { ROUNDS_FULL, ROUNDS_PARTIAL, SBOX_POWER, POSEIDON_CONSTANTS } from '@/constants/poseidon';
import { convertBigIntToLeBytes } from './convertors';

/**
 * Abstract base class for all Poseidon hasher-related errors.
 *
 * @remarks
 * This class provides a foundation for all Poseidon hasher errors, ensuring consistent
 * error handling and type safety across hasher operations. All Poseidon hasher errors
 * should extend this class.
 *
 * @public
 */
export abstract class PoseidonHasherError extends Error {
        /**
         * Creates a new instance of PoseidonHasherError.
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
 * Error thrown when Poseidon hash input validation fails.
 *
 * @remarks
 * This error is thrown when the input array is empty or exceeds the maximum supported
 * input size (17 elements).
 *
 * @public
 */
export class PoseidonInputError extends PoseidonHasherError {
        /**
         * Creates a new instance of PoseidonInputError.
         *
         * @param message - Error message describing the input validation failure
         * @param cause - Optional underlying error that caused the validation failure
         */
        public constructor(message: string, cause?: Error) {
                super(`Poseidon input error: ${message}`, cause);
        }
}

/**
 * Error thrown when Poseidon parameters cannot be retrieved for a given input size.
 *
 * @remarks
 * This error is thrown when the requested input size is not supported by the available
 * Circom constants.
 *
 * @public
 */
export class PoseidonParameterError extends PoseidonHasherError {
        /**
         * Creates a new instance of PoseidonParameterError.
         *
         * @param message - Error message describing the parameter retrieval failure
         * @param cause - Optional underlying error that caused the parameter error
         */
        public constructor(message: string, cause?: Error) {
                super(`Poseidon parameter error: ${message}`, cause);
        }
}

/**
 * Error thrown when Poseidon constants cannot be parsed.
 *
 * @remarks
 * This error is thrown when the Poseidon constants JSON contains unsupported formats
 * or invalid data structures.
 *
 * @public
 */
export class PoseidonConstantError extends PoseidonHasherError {
        /**
         * Creates a new instance of PoseidonConstantError.
         *
         * @param message - Error message describing the constant parsing failure
         * @param cause - Optional underlying error that caused the parsing error
         */
        public constructor(message: string, cause?: Error) {
                super(`Poseidon constant error: ${message}`, cause);
        }
}

/**
 * Parses Poseidon constants from JSON format, converting string numbers to BigInt.
 *
 * @param value - The value to parse (can be string, array, object, or primitive)
 * @returns The parsed value with numeric strings converted to BigInt
 * @throws {@link PoseidonConstantError} When the constant format is unsupported
 *
 * @internal
 */
function parseConstants(value: unknown): unknown {
        if (typeof value === 'string') {
                if (value.startsWith('0x') || /^[0-9]+$/.test(value)) {
                        return BigInt(value);
                }
                throw new PoseidonConstantError(`Unsupported constant format: ${value}`);
        }
        if (Array.isArray(value)) {
                return value.map(parseConstants);
        }
        if (value && typeof value === 'object') {
                return Object.fromEntries(
                        Object.entries(value).map(([k, v]) => [k, parseConstants(v)])
                );
        }
        return value;
}

/**
 * Gets Circom-compatible Poseidon parameters for a given input size.
 *
 * @param t - The number of field elements (input size + 1 for initial state)
 * @returns Poseidon parameters including rounds, MDS matrix, and round constants
 * @throws {@link PoseidonParameterError} When the input size is not supported by available constants
 *
 * @remarks
 * The parameter `t` represents the total number of field elements in the Poseidon state,
 * which includes one element for the initial state plus the input elements. For example,
 * if you have 2 inputs, `t = 3` (1 initial state + 2 inputs).
 *
 * @internal
 */
function getCircomParameters(t: number): {
        roundsPartial: number;
        mds: bigint[][];
        roundConstants: bigint[][];
} {
        const index = t - 2;
        if (index < 0 || index >= ROUNDS_PARTIAL.length) {
                throw new PoseidonParameterError(
                        `Unsupported t=${t}. Circom constants only cover t from 2 to ${ROUNDS_PARTIAL.length + 1}.`
                );
        }

        const roundsPartial = ROUNDS_PARTIAL[index]!;
        const parsedConstants = parseConstants(POSEIDON_CONSTANTS) as {
                M: bigint[][][];
                C: bigint[][];
        };
        const mds = parsedConstants.M[index]!;
        const roundConstantsFlattened = parsedConstants.C[index]!;
        const roundConstants = splitConstants(roundConstantsFlattened, t);

        return { roundsPartial, mds, roundConstants };
}

/**
 * Poseidon hash function compatible with Circom's Poseidon implementation.
 *
 * @remarks
 * This class provides Poseidon hashing functionality using the same parameters as Circom's
 * Poseidon implementation, ensuring compatibility with zero-knowledge proof circuits.
 * The implementation uses the BN254 field (bn254_Fr) and supports input sizes from 1 to 17 elements.
 *
 * The Poseidon hash is a zero-knowledge friendly hash function designed for use in
 * cryptographic protocols and zero-knowledge proof systems. It uses the same parameters
 * as Circom's Poseidon implementation, including:
 * - 8 full rounds
 * - Variable partial rounds (56-70 depending on input size)
 * - S-box power of 5
 * - Circom-compatible MDS matrices and round constants
 *
 * Instances are cached per input size for performance optimization.
 *
 * @public
 *
 * @example
 * ```typescript
 * // Hash a single value
 * const hash1 = PoseidonHasher.hash([100n]);
 *
 * // Hash multiple values
 * const hash2 = PoseidonHasher.hash([1n, 2n, 3n, 4n, 5n]);
 *
 * // The hash is compatible with Circom circuits
 * // poseidon([0, 1, 2, 3]) in Circom matches PoseidonHasher.hash([1n, 2n, 3n])
 * ```
 */
export class PoseidonHasher {
        private static readonly poseidonInstances = new Map<
                number,
                ReturnType<typeof createPoseidon>
        >();

        /**
         * Gets or creates a Poseidon instance for the specified input size.
         *
         * @param inputSize - Number of input elements (1-17)
         * @returns A Poseidon hash function instance configured for the given input size
         * @throws {@link PoseidonParameterError} When the input size is not supported
         *
         * @remarks
         * This method implements instance caching to avoid recreating Poseidon instances
         * for the same input size. The first call for a given input size will create and
         * cache the instance, subsequent calls will return the cached instance.
         *
         * The internal state size `t` is calculated as `inputSize + 1` to account for
         * the initial state element (0n) that is prepended to inputs.
         *
         * @internal
         */
        private static getPoseidonInstance(inputSize: number): ReturnType<typeof createPoseidon> {
                if (this.poseidonInstances.has(inputSize)) {
                        return this.poseidonInstances.get(inputSize)!;
                }

                const t = inputSize + 1; // +1 for initial state
                const { roundsPartial, mds, roundConstants } = getCircomParameters(t);

                const poseidon = createPoseidon({
                        Fp: Fr,
                        t,
                        roundsFull: ROUNDS_FULL,
                        roundsPartial,
                        sboxPower: SBOX_POWER,
                        mds,
                        roundConstants,
                });

                this.poseidonInstances.set(inputSize, poseidon);
                return poseidon;
        }

        /**
         * Hashes an array of bigint values using Poseidon.
         *
         * @param inputs - Array of bigint values to hash (1-17 elements)
         * @returns A 32-byte Poseidon hash in little-endian format
         *
         * @throws {@link PoseidonInputError} When the input array is empty or has more than 17 elements
         * @throws {@link PoseidonParameterError} When the input size is not supported by available constants
         * @throws {@link PoseidonConstantError} When Poseidon constants cannot be parsed
         *
         * @remarks
         * This method computes a Poseidon hash over the input values. The hash is compatible
         * with Circom's Poseidon implementation, ensuring it can be used in zero-knowledge proofs.
         *
         * **Hash Computation:**
         * The implementation uses an initial state of `0n` and prepends it to the inputs before hashing,
         * matching Circom's behavior. The computation is: `poseidon([0n, ...inputs])`.
         *
         * **Input Requirements:**
         * - Must contain at least 1 element
         * - Must contain at most 17 elements
         * - All elements must be valid field elements in the BN254 field
         *
         * **Output Format:**
         * The hash is returned as a 32-byte `PoseidonHash` in little-endian format, suitable
         * for use in zero-knowledge proof circuits and cryptographic protocols.
         *
         * @example
         * ```typescript
         * // Hash a single value
         * const hash1 = PoseidonHasher.hash([100n]);
         *
         * // Hash multiple values (up to 17)
         * const hash2 = PoseidonHasher.hash([1n, 2n, 3n, 4n, 5n]);
         *
         * // The result is a 32-byte PoseidonHash
         * console.log(hash2.length); // 32
         * ```
         */
        public static hash(inputs: Array<bigint>): PoseidonHash {
                if (inputs.length === 0) {
                        throw new PoseidonInputError(
                                'Poseidon hash requires at least 1 input element'
                        );
                }
                if (inputs.length > 17) {
                        throw new PoseidonInputError(
                                `Poseidon hash supports at most 17 input elements, got ${inputs.length}`
                        );
                }

                const poseidon = this.getPoseidonInstance(inputs.length);
                const initState = 0n;
                const state = poseidon([initState, ...inputs]);
                const hashValue = state[0]!;

                return convertBigIntToLeBytes(hashValue, 32) as PoseidonHash;
        }
}
