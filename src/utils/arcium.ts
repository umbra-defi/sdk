import {
        getArciumAccountBaseSeed,
        getArciumProgAddress,
        getCompDefAccOffset,
        getMXEAccAddress,
} from '@arcium-hq/client';
import { PublicKey, Transaction } from '@solana/web3.js';
import { program } from '@/idl';
import { SolanaAddress } from '@/types';

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
