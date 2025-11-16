import { program } from '@/idl';
import {
        AccountOffset,
        Amount,
        BasisPoints,
        Boolean,
        convertAccountOffsetToTransactionInput,
        convertAmountToTransactionInput,
        convertBasisPointsToTransactionInput,
        convertBooleanToTransactionInput,
        convertInstructionSeedToTransactionInput,
        convertNumberOfTransactionsToTransactionInput,
        convertRiskThresholdToTransactionInput,
        convertSha3HashToTransactionInput,
        convertSolanaAddressToTransactionInput,
        InstructionSeed,
        MintAddress,
        NumberOfTransactions,
        RiskThreshold,
        Sha3Hash,
        SolanaAddress,
} from '@/types';
import { getFeesConfigurationPda, getWalletSpecifierPda } from '@/utils/pda-generators';
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
 * Builds a transaction instruction for initializing a fees configuration account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `mint`: The mint address of the token for which fees are configured
 *   - `signer`: The signer account authorized to initialize fees configuration
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation
 *   - `accountOffset`: The account offset used for account derivation
 *   - `relayerFees`: The base relayer fees amount
 *   - `commissionFeesLowerBound`: The lower bound for commission fees
 *   - `commissionFeesUpperBound`: The upper bound for commission fees
 *   - `commissionFees`: The commission fees in basis points (1 basis point = 0.01%)
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction initializes a fees configuration account that defines the fee structure
 * for a specific token mint. The fees configuration determines:
 * - Relayer fees: Base fees paid to relayers for processing transactions
 * - Commission fees: Percentage-based fees with configurable bounds
 *
 * **Fee Structure:**
 * - Relayer fees are fixed amounts per transaction
 * - Commission fees are percentage-based (in basis points) with min/max bounds
 * - The configuration is specific to each token mint and instruction seed combination
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseFeesConfigurationInstruction(
 *   {
 *     mint: tokenMintAddress,
 *     signer: authorizedSigner,
 *   },
 *   {
 *     instructionSeed: BigInt(37),
 *     accountOffset: BigInt(0),
 *     relayerFees: BigInt(1000000), // 0.001 tokens
 *     commissionFeesLowerBound: BigInt(500000), // 0.0005 tokens
 *     commissionFeesUpperBound: BigInt(5000000), // 0.005 tokens
 *     commissionFees: BigInt(100), // 1% (100 basis points)
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildInitialiseFeesConfigurationInstruction(
        txAccounts: {
                mint: MintAddress;
                signer: SolanaAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                accountOffset: AccountOffset;
                relayerFees: Amount;
                commissionFeesLowerBound: Amount;
                commissionFeesUpperBound: Amount;
                commissionFees: BasisPoints;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const feesConfigurationAccount = getFeesConfigurationPda(
                        txArgs.instructionSeed,
                        txAccounts.mint,
                        txArgs.accountOffset
                );

                const ixBuilder = program.methods
                        .initialiseFeesConfiguration(
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertAccountOffsetToTransactionInput(txArgs.accountOffset),
                                convertAmountToTransactionInput(txArgs.relayerFees),
                                convertAmountToTransactionInput(txArgs.commissionFeesLowerBound),
                                convertAmountToTransactionInput(txArgs.commissionFeesUpperBound),
                                convertBasisPointsToTransactionInput(txArgs.commissionFees),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                feesConfiguration: feesConfigurationAccount,
                                mint: txAccounts.mint,
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
                        `Failed to build initialise fees configuration instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for modifying an existing fees configuration account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `mint`: The mint address of the token for which fees are configured
 *   - `signer`: The signer account authorized to modify fees configuration
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation
 *   - `accountOffset`: The account offset used for account derivation
 *   - `relayerFees`: The updated base relayer fees amount
 *   - `commissionFeesLowerBound`: The updated lower bound for commission fees
 *   - `commissionFeesUpperBound`: The updated upper bound for commission fees
 *   - `commissionFees`: The updated commission fees in basis points (1 basis point = 0.01%)
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction modifies an existing fees configuration account. The fees configuration
 * must have been previously initialized using `buildInitialiseFeesConfigurationInstruction`.
 *
 * **Use Cases:**
 * - Updating fee rates based on market conditions
 * - Adjusting commission fee bounds
 * - Changing relayer fee structures
 *
 * @example
 * ```typescript
 * const instruction = await buildModifyFeesConfigurationInstruction(
 *   {
 *     mint: tokenMintAddress,
 *     signer: authorizedSigner,
 *   },
 *   {
 *     instructionSeed: BigInt(37),
 *     accountOffset: BigInt(0),
 *     relayerFees: BigInt(2000000), // Updated to 0.002 tokens
 *     commissionFeesLowerBound: BigInt(1000000), // Updated to 0.001 tokens
 *     commissionFeesUpperBound: BigInt(10000000), // Updated to 0.01 tokens
 *     commissionFees: BigInt(150), // Updated to 1.5% (150 basis points)
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildModifyFeesConfigurationInstruction(
        txAccounts: {
                mint: MintAddress;
                signer: SolanaAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                accountOffset: AccountOffset;
                relayerFees: Amount;
                commissionFeesLowerBound: Amount;
                commissionFeesUpperBound: Amount;
                commissionFees: BasisPoints;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const feesConfigurationAccount = getFeesConfigurationPda(
                        txArgs.instructionSeed,
                        txAccounts.mint,
                        txArgs.accountOffset
                );

                const ixBuilder = program.methods
                        .modifyFeesConfiguration(
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertAccountOffsetToTransactionInput(txArgs.accountOffset),
                                convertAmountToTransactionInput(txArgs.relayerFees),
                                convertAmountToTransactionInput(txArgs.commissionFeesLowerBound),
                                convertAmountToTransactionInput(txArgs.commissionFeesUpperBound),
                                convertBasisPointsToTransactionInput(txArgs.commissionFees),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                feesConfiguration: feesConfigurationAccount,
                                mint: txAccounts.mint,
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
                        `Failed to build modify fees configuration instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for deleting a fees configuration account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `mint`: The mint address of the token for which fees are configured
 *   - `signer`: The signer account authorized to delete fees configuration
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation
 *   - `accountOffset`: The account offset used for account derivation
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction deletes an existing fees configuration account. The fees configuration
 * must have been previously initialized. After deletion, the account space is reclaimed
 * and fees configuration for this token/instruction seed combination will no longer exist.
 *
 * **Use Cases:**
 * - Removing deprecated fee configurations
 * - Cleaning up unused configurations
 * - Resetting fee structures
 *
 * @example
 * ```typescript
 * const instruction = await buildDeleteFeesConfigurationInstruction(
 *   {
 *     mint: tokenMintAddress,
 *     signer: authorizedSigner,
 *   },
 *   {
 *     instructionSeed: BigInt(37),
 *     accountOffset: BigInt(0),
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildDeleteFeesConfigurationInstruction(
        txAccounts: {
                mint: MintAddress;
                signer: SolanaAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                accountOffset: AccountOffset;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const feesConfigurationAccount = getFeesConfigurationPda(
                        txArgs.instructionSeed,
                        txAccounts.mint,
                        txArgs.accountOffset
                );

                const ixBuilder = program.methods
                        .deleteFeesConfiguration(
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertAccountOffsetToTransactionInput(txArgs.accountOffset),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                feesConfiguration: feesConfigurationAccount,
                                mint: txAccounts.mint,
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
                        `Failed to build delete fees configuration instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for freezing a mixer pool.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `mint`: The mint address of the token for the mixer pool
 * @param txArgs - The transaction arguments:
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction freezes a mixer pool, preventing new deposits and withdrawals. A frozen
 * mixer pool cannot accept new transactions until it is unfrozen. This is typically used
 * for emergency situations or maintenance.
 *
 * **Effects:**
 * - Prevents new deposits into the mixer pool
 * - Prevents withdrawals from the mixer pool
 * - Existing commitments remain valid but cannot be processed
 *
 * @example
 * ```typescript
 * const instruction = await buildFreezeMixerPoolInstruction(
 *   {
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildFreezeMixerPoolInstruction(
        txAccounts: {
                mint: MintAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .freezeMixerPool(convertSha3HashToTransactionInput(txArgs.optionalData))
                        .accountsPartial({
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
                        `Failed to build freeze mixer pool instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for initializing a mixer pool.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `mint`: The mint address of the token for the mixer pool
 *   - `signer`: The signer account authorized to initialize the mixer pool
 * @param txArgs - The transaction arguments:
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction initializes a new mixer pool for a specific token mint. A mixer pool
 * is a privacy-preserving pool that allows users to deposit and withdraw tokens while
 * maintaining anonymity through zero-knowledge proofs.
 *
 * **Mixer Pool Features:**
 * - Privacy-preserving deposits and withdrawals
 * - Zero-knowledge proof verification
 * - Merkle tree commitment system
 * - Support for multiple token types (one pool per mint)
 *
 * **Initialization:**
 * Each token mint requires its own mixer pool. The pool must be initialized before
 * any deposits can be made.
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseMixerPoolInstruction(
 *   {
 *     mint: tokenMintAddress,
 *     signer: authorizedSigner,
 *   },
 *   {
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildInitialiseMixerPoolInstruction(
        txAccounts: {
                signer: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .initialiseMixerPool(convertSha3HashToTransactionInput(txArgs.optionalData))
                        .accountsPartial({
                                mint: txAccounts.mint,
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
                        `Failed to build initialise mixer pool instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for initializing program information.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `signer`: The signer account authorized to initialize program information
 * @param txArgs - The transaction arguments:
 *   - `minimumNumberOfTransactions`: The minimum number of transactions required for certain operations
 *   - `riskThreshold`: The risk threshold value used for compliance and security checks
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction initializes the global program information account that stores protocol-wide
 * configuration parameters. This is a one-time initialization that sets up the base parameters
 * for the Umbra Privacy protocol.
 *
 * **Program Information Parameters:**
 * - Minimum number of transactions: Used for compliance and security requirements
 * - Risk threshold: Used for risk assessment and compliance checks
 *
 * **Initialization:**
 * This must be called before the protocol can be used. The program information can be
 * modified later using `buildModifyProgramInformationInstruction`.
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseProgramInformationInstruction(
 *   {
 *     signer: authorizedSigner,
 *   },
 *   {
 *     minimumNumberOfTransactions: 3,
 *     riskThreshold: riskThresholdBytes,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildInitialiseProgramInformationInstruction(
        txAccounts: {
                signer: SolanaAddress;
        },
        txArgs: {
                minimumNumberOfTransactions: NumberOfTransactions;
                riskThreshold: RiskThreshold;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .initialiseProgramInformation(
                                convertNumberOfTransactionsToTransactionInput(
                                        txArgs.minimumNumberOfTransactions
                                ),
                                convertRiskThresholdToTransactionInput(txArgs.riskThreshold),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
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
                        `Failed to build initialise program information instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for modifying program information.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `signer`: The signer account authorized to modify program information
 * @param txArgs - The transaction arguments:
 *   - `enableProgram`: Whether the program is enabled (true) or disabled (false)
 *   - `minimumSolBalanceRequired`: The minimum SOL balance required for certain operations
 *   - `minimumNumberOfTransactionsBeforeWithdrawal`: The minimum number of transactions required before withdrawal
 *   - `riskThreshold`: The updated risk threshold value
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction modifies the global program information account. The program information
 * must have been previously initialized using `buildInitialiseProgramInformationInstruction`.
 *
 * **Program Control:**
 * - `enableProgram`: Can disable the entire protocol for maintenance or emergencies
 * - `minimumSolBalanceRequired`: Ensures users have sufficient SOL for fees
 * - `minimumNumberOfTransactionsBeforeWithdrawal`: Enforces compliance requirements
 * - `riskThreshold`: Updates risk assessment parameters
 *
 * **Use Cases:**
 * - Enabling/disabling the protocol for maintenance
 * - Updating compliance requirements
 * - Adjusting risk parameters
 * - Changing minimum balance requirements
 *
 * @example
 * ```typescript
 * const instruction = await buildModifyProgramInformationInstruction(
 *   {
 *     signer: authorizedSigner,
 *   },
 *   {
 *     enableProgram: true,
 *     minimumSolBalanceRequired: BigInt(100000000), // 0.1 SOL
 *     minimumNumberOfTransactionsBeforeWithdrawal: 5,
 *     riskThreshold: updatedRiskThresholdBytes,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildModifyProgramInformationInstruction(
        txAccounts: {
                signer: SolanaAddress;
        },
        txArgs: {
                enableProgram: Boolean;
                minimumSolBalanceRequired: Amount;
                minimumNumberOfTransactionsBeforeWithdrawal: NumberOfTransactions;
                riskThreshold: RiskThreshold;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .modifyProgramInformation(
                                convertBooleanToTransactionInput(txArgs.enableProgram),
                                convertAmountToTransactionInput(txArgs.minimumSolBalanceRequired),
                                convertNumberOfTransactionsToTransactionInput(
                                        txArgs.minimumNumberOfTransactionsBeforeWithdrawal
                                ),
                                convertRiskThresholdToTransactionInput(txArgs.riskThreshold),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
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
                        `Failed to build modify program information instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for initializing the master wallet specifier.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `signer`: The signer account authorized to initialize the master wallet specifier
 * @param txArgs - The transaction arguments:
 *   - `allowedAddress`: The Solana address that will be allowed by the master wallet specifier
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction initializes the master wallet specifier, which is a global access control
 * mechanism that defines which addresses are allowed to interact with the protocol. The master
 * wallet specifier is the highest level of access control and applies globally across all
 * operations.
 *
 * **Access Control:**
 * The master wallet specifier acts as a whitelist for protocol access. Only addresses
 * specified in the master wallet specifier (or in instruction-specific wallet specifiers)
 * are allowed to perform certain operations.
 *
 * **Initialization:**
 * This is a one-time initialization that sets up the master access control. The master
 * wallet specifier can be modified later if needed.
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseMasterWalletSpecifierInstruction(
 *   {
 *     signer: authorizedSigner,
 *   },
 *   {
 *     allowedAddress: whitelistedAddress,
 *   }
 * );
 * ```
 */
export async function buildInitialiseMasterWalletSpecifierInstruction(
        txAccounts: {
                signer: SolanaAddress;
        },
        txArgs: {
                allowedAddress: SolanaAddress;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .initialiseMasterWalletSpecifier(
                                convertSolanaAddressToTransactionInput(txArgs.allowedAddress)
                        )
                        .accountsPartial({
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
                        `Failed to build initialise master wallet specifier instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for initializing a wallet specifier for a specific instruction.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `signer`: The signer account authorized to initialize the wallet specifier
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation and to identify the instruction
 *   - `allowedAddress`: The Solana address that will be allowed for this specific instruction
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction initializes a wallet specifier for a specific instruction type. Wallet
 * specifiers provide instruction-level access control, allowing different addresses to be
 * whitelisted for different operations.
 *
 * **Access Control Hierarchy:**
 * 1. Master wallet specifier (global access control)
 * 2. Instruction-specific wallet specifiers (per-instruction access control)
 *
 * **Use Cases:**
 * - Restricting specific operations to authorized addresses
 * - Implementing role-based access control
 * - Enabling compliance and regulatory requirements
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseWalletSpecifierInstruction(
 *   {
 *     signer: authorizedSigner,
 *   },
 *   {
 *     instructionSeed: BigInt(37),
 *     allowedAddress: whitelistedAddress,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildInitialiseWalletSpecifierInstruction(
        txAccounts: {
                signer: SolanaAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                allowedAddress: SolanaAddress;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const walletSpecifierAccount = getWalletSpecifierPda(txArgs.instructionSeed);

                const ixBuilder = program.methods
                        .initialiseWalletSpecifier(
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertSolanaAddressToTransactionInput(txArgs.allowedAddress),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                signer: txAccounts.signer,
                                walletSpecifier: walletSpecifierAccount,
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
                        `Failed to build initialise wallet specifier instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for modifying an existing wallet specifier.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `signer`: The signer account authorized to modify the wallet specifier
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation and to identify the instruction
 *   - `allowedAddress`: The updated Solana address that will be allowed for this specific instruction
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction modifies an existing wallet specifier for a specific instruction type.
 * The wallet specifier must have been previously initialized using
 * `buildInitialiseWalletSpecifierInstruction`.
 *
 * **Use Cases:**
 * - Updating whitelisted addresses for an instruction
 * - Changing access control permissions
 * - Rotating authorized addresses
 *
 * @example
 * ```typescript
 * const instruction = await buildModifyWalletSpecifierInstruction(
 *   {
 *     signer: authorizedSigner,
 *   },
 *   {
 *     instructionSeed: BigInt(37),
 *     allowedAddress: newWhitelistedAddress,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildModifyWalletSpecifierInstruction(
        txAccounts: {
                signer: SolanaAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                allowedAddress: SolanaAddress;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const walletSpecifierAccount = getWalletSpecifierPda(txArgs.instructionSeed);

                const ixBuilder = program.methods
                        .modifyWalletSpecifier(
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertSolanaAddressToTransactionInput(txArgs.allowedAddress),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                signer: txAccounts.signer,
                                walletSpecifier: walletSpecifierAccount,
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
                        `Failed to build modify wallet specifier instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for initializing a zero-knowledge Merkle tree.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `mint`: The mint address of the token for which the Merkle tree is initialized
 *   - `signer`: The signer account authorized to initialize the Merkle tree
 * @param txArgs - The transaction arguments:
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction initializes a zero-knowledge Merkle tree for a specific token mint.
 * The Merkle tree is used to store and verify commitments for privacy-preserving deposits
 * and withdrawals in the mixer pool.
 *
 * **Merkle Tree Purpose:**
 * - Stores deposit commitments in a privacy-preserving manner
 * - Enables zero-knowledge proof verification for withdrawals
 * - Maintains the integrity of the mixer pool state
 * - Supports efficient inclusion proofs
 *
 * **Tree Structure:**
 * Each token mint has its own Merkle tree. The tree stores hashed commitments that
 * represent deposits without revealing the actual amounts or identities.
 *
 * **Initialization:**
 * The Merkle tree must be initialized before any deposits can be made to the mixer pool
 * for this token. This is typically done once per token mint.
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseZkMerkleTreeInstruction(
 *   {
 *     mint: tokenMintAddress,
 *     signer: authorizedSigner,
 *   },
 *   {
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildInitialiseZkMerkleTreeInstruction(
        txAccounts: {
                mint: MintAddress;
                signer: SolanaAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .initialiseZkMerkleTree(
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                mint: txAccounts.mint,
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
                        `Failed to build initialise ZK Merkle tree instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
