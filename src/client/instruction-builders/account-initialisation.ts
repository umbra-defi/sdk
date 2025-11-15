import { program } from '@/idl';
import {
        convertPoseidonHashToTransactionInput,
        convertSha3HashToTransactionInput,
        MintAddress,
        PoseidonHash,
        Sha3Hash,
        SolanaAddress,
} from '@/types';
import { getNullifierHashPda } from '@/utils/pda-generators';
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
 * Builds a transaction instruction for initializing an Arcium encrypted user account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `destinationAddress`: The destination address where the encrypted user account will be created
 *   - `signer`: The signer account authorized to initialize the account
 * @param txArgs - The transaction arguments:
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction initializes an Arcium encrypted user account in the Multi-Execution Environment (MXE).
 * The encrypted user account stores user-specific encrypted data including:
 * - Master viewing key hash (Poseidon hash)
 * - Master viewing key ciphertext (encrypted with Rescue cipher)
 * - X25519 public key for shared encryption
 * - Account status flags
 *
 * **Account Purpose:**
 * The Arcium encrypted user account enables privacy-preserving user data storage within the MXE.
 * All sensitive data is encrypted using Rescue cipher and X25519 key exchange, ensuring that
 * only authorized parties can decrypt the information.
 *
 * **Initialization:**
 * This must be called before a user can interact with the Umbra Privacy protocol. The account
 * is created at the specified destination address and is associated with the signer.
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseArciumEncryptedUserAccountInstruction(
 *   {
 *     destinationAddress: userPublicKey,
 *     signer: authorizedSigner,
 *   },
 *   {
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildInitialiseArciumEncryptedUserAccountInstruction(
        txAccounts: {
                destinationAddress: SolanaAddress;
                signer: SolanaAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .initialiseArciumEncryptedUserAccount(
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                destinationAddress: txAccounts.destinationAddress,
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
                        `Failed to build initialise Arcium encrypted user account instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for initializing an Arcium encrypted token account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `destinationAddress`: The destination address where the encrypted token account will be created
 *   - `signer`: The signer account authorized to initialize the account
 *   - `mint`: The mint address of the token for which the account is being created
 * @param txArgs - The transaction arguments:
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction initializes an Arcium encrypted token account in the Multi-Execution Environment (MXE).
 * The encrypted token account stores token-specific encrypted data for a particular token mint, including:
 * - Encrypted token balance information
 * - Token account metadata
 * - Account status flags
 *
 * **Account Purpose:**
 * The Arcium encrypted token account enables privacy-preserving token balance storage within the MXE.
 * Each token mint requires its own encrypted token account. All sensitive data is encrypted using
 * Rescue cipher and X25519 key exchange, ensuring that only authorized parties can decrypt the information.
 *
 * **Token-Specific:**
 * Unlike the user account, the token account is specific to a token mint. Each token type (SOL, USDC, etc.)
 * requires its own encrypted token account initialization.
 *
 * **Initialization:**
 * This must be called before a user can interact with tokens of a specific mint in the Umbra Privacy protocol.
 * The account is created at the specified destination address and is associated with both the signer and mint.
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseArciumEncryptedTokenAccountInstruction(
 *   {
 *     destinationAddress: userPublicKey,
 *     signer: authorizedSigner,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildInitialiseArciumEncryptedTokenAccountInstruction(
        txAccounts: {
                destinationAddress: SolanaAddress;
                signer: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .initialiseArciumEncryptedTokenAccount(
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
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
                        `Failed to build initialise Arcium encrypted token account instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for initializing a nullifier hash account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `signer`: The signer account authorized to initialize the nullifier hash
 * @param txArgs - The transaction arguments:
 *   - `nullifierHash`: The Poseidon hash of the nullifier to be registered
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction initializes a nullifier hash account that stores a nullifier hash in the protocol.
 * Nullifiers are critical components of privacy-preserving systems that prevent double-spending
 * while maintaining anonymity.
 *
 * **Nullifier Purpose:**
 * A nullifier is a unique identifier derived from a deposit commitment that:
 * - Prevents the same deposit from being withdrawn multiple times (double-spending prevention)
 * - Does not reveal which deposit it corresponds to (privacy preservation)
 * - Is cryptographically linked to the deposit through zero-knowledge proofs
 *
 * **Nullifier Hash:**
 * The nullifier hash is a Poseidon hash of the nullifier secret. It's stored on-chain to track
 * which nullifiers have been used, ensuring each deposit can only be withdrawn once.
 *
 * **Account Derivation:**
 * The nullifier hash account is derived as a Program Derived Address (PDA) using the nullifier
 * hash as a seed. This ensures each unique nullifier hash has its own account.
 *
 * **Double-Spending Prevention:**
 * When a withdrawal is attempted, the protocol checks if the nullifier hash has been registered.
 * If it has, the withdrawal is rejected, preventing double-spending attacks.
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseNullifierHashInstruction(
 *   {
 *     signer: authorizedSigner,
 *   },
 *   {
 *     nullifierHash: computedNullifierHash,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildInitialiseNullifierHashInstruction(
        txAccounts: {
                signer: SolanaAddress;
        },
        txArgs: {
                nullifierHash: PoseidonHash;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const nullifierHashPda = getNullifierHashPda(txArgs.nullifierHash);

                const ixBuilder = program.methods
                        .initialiseNullifierHash(
                                convertPoseidonHashToTransactionInput(txArgs.nullifierHash),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                nullifierHash: nullifierHashPda,
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
                        `Failed to build initialise nullifier hash instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
