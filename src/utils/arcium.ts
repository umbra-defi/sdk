import {
        getArciumAccountBaseSeed,
        getArciumProgAddress,
        getCompDefAccAddress,
        getCompDefAccOffset,
        getComputationAccAddress,
        getMXEAccAddress,
} from '@arcium-hq/client';
import { PublicKey, Transaction } from '@solana/web3.js';
import { program } from '@/idl';
import {
        ComputationOffset,
        ProgramDerivedAddress,
        SolanaAddress,
        U32LeBytes,
        U64LeBytes,
} from '@/types';
import { randomBytes } from '@noble/hashes/utils.js';
import { convertU32LeBytesToU32, convertU64LeBytesToU64 } from './convertors';
import { BN } from 'bn.js';
import {
        ARCIUM_CLUSTER_ACCOUNT,
        ARCIUM_MXE_ACCOUNT,
        ARCIUM_MEMPOOL_ACCOUNT,
        ARCIUM_EXECUTING_POOL_ACCOUNT,
} from '@/constants/arcium';

/**
 * Error thrown when computation definition initialization transaction building fails.
 *
 * @remarks
 * This error is thrown when building a transaction to initialize a computation definition
 * account fails due to invalid computation definition name, missing program method,
 * PDA generation failures, or transaction building errors.
 *
 * @public
 */
export class CompDefInitialisationError extends Error {
        /**
         * Creates a new instance of CompDefInitialisationError.
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
 * Creates a transaction builder function for initializing a computation definition account.
 *
 * @param compDefName - The name of the computation definition (in snake_case, e.g., 'share_patient_data')
 * @returns A function that takes an owner address and returns a promise resolving to a Transaction for initializing the computation definition
 *
 * @throws {@link CompDefInitialisationError} When the computation definition name is invalid, the program method doesn't exist, or transaction building fails
 *
 * @remarks
 * This function creates a factory function that builds transactions for initializing
 * computation definition accounts in the Arcium Multi-Execution Environment (MXE).
 * Computation definitions specify the zero-knowledge circuits and execution parameters
 * for private computations.
 *
 * **Process:**
 * 1. Converts the computation definition name from snake_case to camelCase
 * 2. Derives the Program Derived Address (PDA) for the computation definition account
 * 3. Looks up the corresponding initialization method in the program (e.g., `initSharePatientDataCompDef`)
 * 4. Builds a transaction with the required accounts (compDefAccount, payer, mxeAccount)
 *
 * **Method Name Convention:**
 * The function expects method names in the format: `init{CompDefName}CompDef`
 * where `{CompDefName}` is the camelCase version of the input `compDefName`.
 * For example:
 * - `'share_patient_data'` → `'initSharePatientDataCompDef'`
 * - `'update_master_viewing_key'` → `'initUpdateMasterViewingKeyCompDef'`
 *
 * **Accounts Required:**
 * - `compDefAccount`: The PDA for the computation definition account
 * - `payer`: The owner/account that will pay for the initialization
 * - `mxeAccount`: The Multi-Execution Environment account address
 *
 * @example
 * ```typescript
 * // Create a transaction builder for a specific computation definition
 * const builder = getCompDefInitialisationTransactionBuilder('share_patient_data');
 *
 * // Build the transaction with an owner address
 * const owner = new PublicKey('...') as SolanaAddress;
 * const transaction = await builder(owner);
 *
 * // Sign and send the transaction
 * const signedTx = await signer.signTransaction(transaction);
 * await connection.sendTransaction(signedTx);
 * ```
 *
 * @example
 * ```typescript
 * // Handle errors
 * try {
 *   const builder = getCompDefInitialisationTransactionBuilder('invalid_name');
 *   const transaction = await builder(owner);
 * } catch (error) {
 *   if (error instanceof CompDefInitialisationError) {
 *     console.error('Failed to build transaction:', error.message);
 *   }
 * }
 * ```
 */
export function getCompDefInitialisationTransactionBuilder(
        compDefName: string
): (owner: SolanaAddress) => Promise<Transaction> {
        if (!compDefName || compDefName.trim().length === 0) {
                throw new CompDefInitialisationError('Computation definition name cannot be empty');
        }

        function convertSnakeCaseToCamelCase(str: string): string {
                return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        }

        const methodName = convertSnakeCaseToCamelCase(`init_${compDefName}_comp_def`);

        return async (owner: SolanaAddress) => {
                try {
                        const baseSeedCompDefAcc = getArciumAccountBaseSeed(
                                'ComputationDefinitionAccount'
                        );
                        const offset = getCompDefAccOffset(compDefName);

                        const compDefPDA = PublicKey.findProgramAddressSync(
                                [baseSeedCompDefAcc, program.programId.toBuffer(), offset],
                                getArciumProgAddress()
                        )[0];

                        const methods = program.methods as Record<string, any>;
                        const method = methods[methodName];

                        if (!method) {
                                throw new CompDefInitialisationError(
                                        `Program method '${methodName}' not found. Make sure the computation definition name '${compDefName}' is correct and the corresponding initialization method exists in the program.`
                                );
                        }

                        const txBuilder = await method.accounts({
                                compDefAccount: compDefPDA,
                                payer: owner,
                                mxeAccount: getMXEAccAddress(program.programId),
                        });

                        const transaction = await txBuilder.transaction();

                        if (!transaction) {
                                throw new CompDefInitialisationError(
                                        'Transaction builder returned null or undefined'
                                );
                        }

                        return transaction;
                } catch (error) {
                        if (error instanceof CompDefInitialisationError) {
                                throw error;
                        }
                        throw new CompDefInitialisationError(
                                `Failed to build computation definition initialization transaction: ${error instanceof Error ? error.message : String(error)}`,
                                error instanceof Error ? error : undefined
                        );
                }
        };
}

/**
 * Error thrown when Arcium account operations fail.
 *
 * @remarks
 * This error is thrown when operations related to Arcium accounts fail, such as
 * generating computation offsets, deriving account addresses, or retrieving
 * Arcium account information.
 *
 * @public
 */
export class ArciumAccountError extends Error {
        /**
         * Creates a new instance of ArciumAccountError.
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
 * Generates a cryptographically secure random computation offset.
 *
 * @returns A random 64-bit unsigned integer (U64) computation offset
 *
 * @throws {@link ArciumAccountError} When random byte generation fails or conversion fails
 *
 * @remarks
 * A computation offset is a unique 64-bit identifier used to derive the Program Derived
 * Address (PDA) for a computation account in the Arcium Multi-Execution Environment (MXE).
 * Each computation instance requires a unique offset to ensure its account address is unique.
 *
 * **Security:**
 * This function uses cryptographically secure random number generation (`randomBytes` from
 * `@noble/hashes/utils`) to ensure the offset is unpredictable and cannot be guessed or
 * manipulated by attackers.
 *
 * **Usage:**
 * The generated offset is used as input to `getArciumAccounts()` to derive all the necessary
 * account addresses for a computation instance.
 *
 * @example
 * ```typescript
 * // Generate a random computation offset
 * const offset = generateRandomComputationOffset();
 * console.log(`Generated offset: ${offset}`);
 *
 * // Use it to get Arcium accounts
 * const accounts = getArciumAccounts(offset, 'share_patient_data');
 * ```
 */
export function generateRandomComputationOffset(): ComputationOffset {
        try {
                const randomComputationOffsetBytes = randomBytes(8);
                return convertU64LeBytesToU64(randomComputationOffsetBytes as U64LeBytes);
        } catch (error) {
                throw new ArciumAccountError(
                        `Failed to generate random computation offset: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Retrieves all Arcium account addresses required for a computation instance.
 *
 * @param computationOffset - The 64-bit computation offset used to derive the computation account PDA
 * @param computationName - The name of the computation definition (in snake_case, e.g., 'share_patient_data')
 * @returns An object containing all required Arcium account addresses:
 *   - `computationAccount`: The PDA for the specific computation instance
 *   - `compDefAccount`: The PDA for the computation definition account
 *   - `clusterAccount`: The Arcium cluster account address
 *   - `mxeAccount`: The Multi-Execution Environment account address
 *   - `mempoolAccount`: The mempool account address for queuing computations
 *   - `executingPoolAccount`: The executing pool account address for active computations
 *
 * @throws {@link ArciumAccountError} When computation name is invalid, account derivation fails, or conversion errors occur
 *
 * @remarks
 * This function derives all the account addresses needed to interact with a computation
 * instance in the Arcium Multi-Execution Environment. These accounts are required when
 * building transactions that interact with Arcium computations.
 *
 * **Account Derivation:**
 * - **Computation Account**: Derived from the program ID and computation offset using `getComputationAccAddress`
 * - **CompDef Account**: Derived from the program ID and computation definition offset using `getCompDefAccAddress`
 * - **Cluster Account**: Predefined constant account for the Arcium cluster
 * - **MXE Account**: Predefined constant account for the Multi-Execution Environment
 * - **Mempool Account**: Predefined constant account for the computation mempool
 * - **Executing Pool Account**: Predefined constant account for the executing computation pool
 *
 * **Computation Offset:**
 * The computation offset uniquely identifies a computation instance. Use `generateRandomComputationOffset()`
 * to generate a secure random offset for new computations.
 *
 * **Computation Name:**
 * The computation name must match an existing computation definition. It's used to derive the
 * computation definition account address and must be in snake_case format (e.g., 'share_patient_data').
 *
 * @example
 * ```typescript
 * // Generate a random offset and get all accounts
 * const offset = generateRandomComputationOffset();
 * const accounts = getArciumAccounts(offset, 'share_patient_data');
 *
 * // Use the accounts in a transaction
 * const transaction = await program.methods
 *   .executeComputation()
 *   .accounts({
 *     computationAccount: accounts.computationAccount,
 *     compDefAccount: accounts.compDefAccount,
 *     clusterAccount: accounts.clusterAccount,
 *     mxeAccount: accounts.mxeAccount,
 *     mempoolAccount: accounts.mempoolAccount,
 *     executingPoolAccount: accounts.executingPoolAccount,
 *   })
 *   .transaction();
 * ```
 *
 * @example
 * ```typescript
 * // Handle errors
 * try {
 *   const accounts = getArciumAccounts(offset, 'invalid_computation');
 * } catch (error) {
 *   if (error instanceof ArciumAccountError) {
 *     console.error('Failed to get Arcium accounts:', error.message);
 *   }
 * }
 * ```
 */
export function getArciumAccounts(
        computationOffset: ComputationOffset,
        computationName: string
): {
        computationAccount: ProgramDerivedAddress;
        compDefAccount: ProgramDerivedAddress;
        clusterAccount: ProgramDerivedAddress;
        mxeAccount: ProgramDerivedAddress;
        mempoolAccount: ProgramDerivedAddress;
        executingPool: ProgramDerivedAddress;
} {
        if (!computationName || computationName.trim().length === 0) {
                throw new ArciumAccountError('Computation name cannot be empty');
        }

        try {
                const computationAccount = getComputationAccAddress(
                        program.programId,
                        new BN(computationOffset)
                );

                if (!computationAccount) {
                        throw new ArciumAccountError(
                                'Failed to derive computation account address'
                        );
                }

                const compDefOffset = getCompDefAccOffset(computationName);
                const compDefOffsetU32 = convertU32LeBytesToU32(compDefOffset as U32LeBytes);
                const compDefAccount = getCompDefAccAddress(
                        program.programId,
                        Number(compDefOffsetU32)
                );

                if (!compDefAccount) {
                        throw new ArciumAccountError(
                                `Failed to derive computation definition account address for '${computationName}'`
                        );
                }

                const clusterAccount = ARCIUM_CLUSTER_ACCOUNT;
                const mxeAccount = ARCIUM_MXE_ACCOUNT;
                const mempoolAccount = ARCIUM_MEMPOOL_ACCOUNT;
                const executingPool = ARCIUM_EXECUTING_POOL_ACCOUNT;

                // Validate that all constant accounts are defined
                if (!clusterAccount || !mxeAccount || !mempoolAccount || !executingPool) {
                        throw new ArciumAccountError(
                                'One or more Arcium constant accounts are undefined'
                        );
                }

                return {
                        computationAccount: computationAccount as ProgramDerivedAddress,
                        compDefAccount: compDefAccount as ProgramDerivedAddress,
                        clusterAccount: clusterAccount as ProgramDerivedAddress,
                        mxeAccount: mxeAccount as ProgramDerivedAddress,
                        mempoolAccount: mempoolAccount as ProgramDerivedAddress,
                        executingPool: executingPool as ProgramDerivedAddress,
                };
        } catch (error) {
                if (error instanceof ArciumAccountError) {
                        throw error;
                }
                throw new ArciumAccountError(
                        `Failed to get Arcium accounts: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
