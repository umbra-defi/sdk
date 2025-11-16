import { program } from '@/idl';
import {
        AccountOffset,
        convertInstructionSeedToTransactionInput,
        convertAccountOffsetToTransactionInput,
        InstructionSeed,
        MintAddress,
        SolanaAddress,
        convertComputationOffsetToTransactionInput,
} from '@/types';
import { generateRandomComputationOffset, getArciumAccounts } from '@/utils/arcium';
import { TransactionInstruction } from '@solana/web3.js';
import {
        getArciumCommissionFeesPoolPda,
        getPublicCommissionFeesPoolPda,
} from '@/utils/pda-generators';

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
 * Builds a transaction instruction for initializing an Arcium commission fees pool account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `payer`: The account that will pay for the transaction fees
 *   - `mint`: The mint address of the token for which the commission fees pool is being created
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation
 *   - `accountOffset`: The account offset used for account derivation
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction initializes an Arcium commission fees pool account that stores commission fees
 * collected by the protocol. The commission fees pool is used within the Arcium Multi-Execution
 * Environment (MXE) to accumulate fees before they are collected.
 *
 * **Commission Fees Pool Purpose:**
 * The Arcium commission fees pool:
 * - Stores commission fees collected from protocol operations
 * - Enables batch fee collection and withdrawal
 * - Supports multiple pools per token mint (one per instruction seed and account offset combination)
 * - Maintains fee accounting for each token mint separately
 *
 * **Account Derivation:**
 * The commission fees pool account is derived as a Program Derived Address (PDA) using:
 * - Token mint address
 * - Instruction seed
 * - Account offset
 *
 * This allows the protocol to have multiple commission fees pools for different purposes or
 * instruction types.
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'initialise_commission_fees_pool'
 *
 * **Initialization:**
 * This must be called before commission fees can be collected. Each combination of instruction seed
 * and account offset requires a separate fees pool initialization.
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseCommissionFeesPoolInstruction(
 *   {
 *     payer: payerPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     instructionSeed: BigInt(37),
 *     accountOffset: BigInt(0),
 *   }
 * );
 * ```
 */
export async function buildInitialiseCommissionFeesPoolInstruction(
        txAccounts: {
                payer: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                accountOffset: AccountOffset;
        }
): Promise<TransactionInstruction> {
        try {
                const computationOffset = generateRandomComputationOffset();
                const commissionFeesPoolAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        txArgs.instructionSeed,
                        txArgs.accountOffset
                );

                const {
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'initialise_commission_fees_pool');

                const ixBuilder = program.methods
                        .initialiseCommissionFeesPool(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertAccountOffsetToTransactionInput(txArgs.accountOffset)
                        )
                        .accountsPartial({
                                payer: txAccounts.payer,
                                arciumCommissionFeesPool: commissionFeesPoolAccount,
                                mint: txAccounts.mint,
                                compDefAccount: compDefAccount,
                                clusterAccount: clusterAccount,
                                mxeAccount: mxeAccount,
                                mempoolAccount: mempoolAccount,
                                executingPool: executingPool,
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
                        `Failed to build initialise commission fees pool instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for collecting commission fees from an Arcium commission fees pool.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `payer`: The account that will pay for the transaction fees
 *   - `destinationAddress`: The destination address where the collected fees will be sent
 *   - `mint`: The mint address of the token for which fees are being collected
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation
 *   - `accountOffset`: The account offset used for account derivation
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction collects accumulated commission fees from an Arcium commission fees pool and
 * transfers them to the specified destination address. The collection is performed within the
 * Arcium Multi-Execution Environment (MXE).
 *
 * **Commission Fees:**
 * Commission fees are fees collected by the protocol from various operations, including:
 * - Transaction processing fees
 * - Protocol service fees
 * - Revenue sharing fees
 * - Any other fees designated as commission fees
 *
 * **Collection Process:**
 * 1. Generates a random computation offset for the MXE computation
 * 2. Derives the commission fees pool account using mint, instruction seed, and account offset
 * 3. Derives all required Arcium accounts for the MXE computation
 * 4. Transfers all accumulated fees from the pool to the destination address
 * 5. Updates the pool balance to reflect the withdrawal
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'collect_commission_fees_from_commission_fees_pool'
 *
 * **Destination Address:**
 * The destination address receives the collected commission fees. This is typically a protocol
 * treasury address or a designated fee collection account.
 *
 * **Pool Identification:**
 * The fees pool is identified using the same parameters used during initialization:
 * - Token mint address
 * - Instruction seed
 * - Account offset
 *
 * **Use Cases:**
 * - Regular fee withdrawal by protocol administrators
 * - Consolidating fees from multiple operations
 * - Transferring fees to treasury or operational accounts
 * - Revenue distribution
 *
 * @example
 * ```typescript
 * const instruction = await buildCollectCommissionFeesFromCommissionFeesPoolInstruction(
 *   {
 *     payer: payerPublicKey,
 *     destinationAddress: protocolTreasuryAddress,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     instructionSeed: BigInt(37),
 *     accountOffset: BigInt(0),
 *   }
 * );
 * ```
 */
export async function buildCollectCommissionFeesFromCommissionFeesPoolInstruction(
        txAccounts: {
                payer: SolanaAddress;
                destinationAddress: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                accountOffset: AccountOffset;
        }
): Promise<TransactionInstruction> {
        try {
                const computationOffset = generateRandomComputationOffset();
                const commissionFeesPoolAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        txArgs.instructionSeed,
                        txArgs.accountOffset
                );

                const {
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(
                        computationOffset,
                        'collect_commission_fees_from_commission_fees_pool'
                );

                const ixBuilder = program.methods
                        .collectCommissionFeesFromCommissionFeesPool(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertAccountOffsetToTransactionInput(txArgs.accountOffset)
                        )
                        .accountsPartial({
                                payer: txAccounts.payer,
                                destinationAddress: txAccounts.destinationAddress,
                                commissionFeesPool: commissionFeesPoolAccount,
                                mint: txAccounts.mint,
                                compDefAccount: compDefAccount,
                                clusterAccount: clusterAccount,
                                mxeAccount: mxeAccount,
                                mempoolAccount: mempoolAccount,
                                executingPool: executingPool,
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
                        `Failed to build collect commission fees from commission fees pool instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for initialising a public commission fees pool account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `signer`: The account that will sign and pay for the transaction.
 *   - `mint`: The mint address of the token for which the public commission fees pool is created.
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation.
 *   - `accountOffset`: The account offset used for account derivation.
 * @returns A promise resolving to the constructed {@link TransactionInstruction}.
 *
 * @throws {@link InstructionBuildingError}
 * When PDA derivation fails, conversion errors occur, or instruction building fails.
 *
 * @remarks
 * The public commission fees pool holds commission fees that are publicly visible (as opposed to
 * private/Arcium‑internal pools), and is used for accounting and collection of protocol‑level fees.
 *
 * The account is derived as a PDA from:
 * - The token mint address
 * - The instruction seed
 * - The account offset
 *
 * @example
 * ```ts
 * const ix = await buildInitialisePublicCommissionFeesPoolInstruction(
 *   {
 *     signer: signerPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     instructionSeed: BigInt(42) as InstructionSeed,
 *     accountOffset: BigInt(0) as AccountOffset,
 *   },
 * );
 * ```
 */
export async function buildInitialisePublicCommissionFeesPoolInstruction(
        txAccounts: {
                signer: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                accountOffset: AccountOffset;
        }
): Promise<TransactionInstruction> {
        try {
                const publicCommissionFeesPoolAccount = getPublicCommissionFeesPoolPda(
                        txAccounts.mint,
                        txArgs.instructionSeed,
                        txArgs.accountOffset
                );

                const ixBuilder = program.methods
                        .initialisePublicCommissionFees(
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertAccountOffsetToTransactionInput(txArgs.accountOffset)
                        )
                        .accountsPartial({
                                signer: txAccounts.signer,
                                publicCommissionFeesPool: publicCommissionFeesPoolAccount,
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
                        `Failed to build initialise public commission fees pool instruction: ${
                                error instanceof Error ? error.message : String(error)
                        }`,
                        error instanceof Error ? error : undefined
                );
        }
}
