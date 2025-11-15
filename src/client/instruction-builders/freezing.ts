import { program } from '@/idl';
import { MintAddress, SolanaAddress } from '@/types';
import { TransactionInstruction } from '@solana/web3.js';

/**
 * Error thrown when instruction building fails.
 *
 * @remarks
 * This error is thrown when building transaction instructions fails due to invalid parameters,
 * account derivation errors, or instruction construction failures.
 *
 * @public
 */
export class InstructionBuildingError extends Error {
        /**
         * Creates a new instance of InstructionBuildingError.
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
 * Builds a transaction instruction for freezing an Arcium encrypted user account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `destinationAddress`: The destination address of the Arcium encrypted user account to freeze
 *   - `signer`: The signer account authorized to freeze the account
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction freezes an Arcium encrypted user account in the Multi-Execution Environment (MXE).
 * Freezing an account prevents all operations on that account until it is unfrozen.
 *
 * **Effects of Freezing:**
 * - Prevents all deposits and withdrawals from the account
 * - Prevents account modifications and updates
 * - Prevents conversion operations (MXE to shared, etc.)
 * - Account data remains encrypted and secure
 * - Account status flags are updated to reflect frozen state
 *
 * **Use Cases:**
 * - Security: Freezing accounts suspected of malicious activity
 * - Compliance: Freezing accounts for regulatory compliance or investigation
 * - Emergency: Freezing accounts in response to security incidents
 * - Access Control: Temporarily disabling account access
 *
 * **Authorization:**
 * Only authorized signers (typically protocol administrators or compliance officers) can freeze accounts.
 * The signer must have the appropriate permissions to perform this operation.
 *
 * **Reversibility:**
 * A frozen account can potentially be unfrozen by authorized parties, depending on protocol configuration.
 *
 * @example
 * ```typescript
 * const instruction = await buildFreezeArciumUserAccountInstruction({
 *   destinationAddress: userPublicKey,
 *   signer: authorizedSigner,
 * });
 * ```
 */
export async function buildFreezeArciumUserAccountInstruction(txAccounts: {
        destinationAddress: SolanaAddress;
        signer: SolanaAddress;
}): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods.freezeArciumUserAccount().accountsPartial({
                        destinationAddress: txAccounts.destinationAddress,
                        signer: txAccounts.signer,
                });

                const instruction = await ixBuilder.instruction();

                if (!instruction) {
                        throw new InstructionBuildingError(
                                'Instruction builder returned null or undefined'
                        );
                }

                return instruction;
        } catch (error) {
                if (error instanceof InstructionBuildingError) {
                        throw error;
                }
                throw new InstructionBuildingError(
                        `Failed to build freeze Arcium user account instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for freezing an Arcium encrypted token account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `destinationAddress`: The destination address of the Arcium encrypted token account to freeze
 *   - `signer`: The signer account authorized to freeze the account
 *   - `mint`: The mint address of the token for which the account is being frozen
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction freezes an Arcium encrypted token account in the Multi-Execution Environment (MXE).
 * Freezing a token account prevents all token-related operations on that account until it is unfrozen.
 *
 * **Effects of Freezing:**
 * - Prevents all token deposits and withdrawals from the account
 * - Prevents token balance modifications
 * - Prevents token account conversions (MXE to shared, etc.)
 * - Account data remains encrypted and secure
 * - Account status flags are updated to reflect frozen state
 *
 * **Token-Specific:**
 * Each token mint has its own encrypted token account. Freezing a token account only affects
 * operations for that specific token type. Other token accounts for the same user remain unaffected.
 *
 * **Use Cases:**
 * - Security: Freezing token accounts suspected of malicious activity
 * - Compliance: Freezing token accounts for regulatory compliance or investigation
 * - Emergency: Freezing token accounts in response to security incidents
 * - Access Control: Temporarily disabling token account access
 *
 * **Authorization:**
 * Only authorized signers (typically protocol administrators or compliance officers) can freeze accounts.
 * The signer must have the appropriate permissions to perform this operation.
 *
 * **Reversibility:**
 * A frozen token account can potentially be unfrozen by authorized parties, depending on protocol configuration.
 *
 * @example
 * ```typescript
 * const instruction = await buildFreezeArciumTokenAccountInstruction({
 *   destinationAddress: userPublicKey,
 *   signer: authorizedSigner,
 *   mint: tokenMintAddress,
 * });
 * ```
 */
export async function buildFreezeArciumTokenAccountInstruction(txAccounts: {
        destinationAddress: SolanaAddress;
        signer: SolanaAddress;
        mint: MintAddress;
}): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods.freezeArciumTokenAccount().accountsPartial({
                        destinationAddress: txAccounts.destinationAddress,
                        signer: txAccounts.signer,
                        mint: txAccounts.mint,
                });

                const instruction = await ixBuilder.instruction();

                if (!instruction) {
                        throw new InstructionBuildingError(
                                'Instruction builder returned null or undefined'
                        );
                }

                return instruction;
        } catch (error) {
                if (error instanceof InstructionBuildingError) {
                        throw error;
                }
                throw new InstructionBuildingError(
                        `Failed to build freeze Arcium token account instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
