import { program } from '@/idl';
import {
        AccountOffset,
        convertSha3HashToTransactionInput,
        MintAddress,
        Sha3Hash,
        SolanaAddress,
        InstructionSeed,
        convertInstructionSeedToTransactionInput,
        convertAccountOffsetToTransactionInput,
} from '@/types';
import { getRelayerFeesPoolPda } from '@/utils/pda-generators';
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
 * Builds a transaction instruction for initializing a relayer account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer's public key address
 *   - `mint`: The mint address of the token for which the relayer will operate
 * @param txArgs - The transaction arguments:
 *   - `endpoint`: The SHA3 hash of the relayer's endpoint URL
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction initializes a relayer account that enables a relayer to process transactions
 * on behalf of users for a specific token mint. Relayers provide gasless transaction services by
 * paying transaction fees for users.
 *
 * **Relayer Purpose:**
 * Relayers are third-party services that:
 * - Pay transaction fees on behalf of users (gasless transactions)
 * - Process and forward transactions to the Solana network
 * - Collect fees from users for their services
 * - Enable users to interact with the protocol without holding SOL
 *
 * **Relayer Account:**
 * Each relayer must initialize an account for each token mint they want to support. The relayer
 * account stores:
 * - Relayer's public key
 * - Token mint address
 * - Endpoint URL hash (for relayer service identification)
 *
 * **Endpoint:**
 * The endpoint is a SHA3 hash of the relayer's service URL. This allows the protocol to identify
 * and route transactions to the correct relayer service.
 *
 * **Initialization:**
 * This must be called before a relayer can process transactions. Each token mint requires a
 * separate relayer account initialization.
 *
 * @example
 * ```typescript
 * const endpointHash = sha3Hash(endpointUrl);
 * const instruction = await buildInitialiseRelayerAccountInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     endpoint: endpointHash,
 *   }
 * );
 * ```
 */
export async function buildInitialiseRelayerAccountInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                endpoint: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .initialiseRelayerAccount(
                                convertSha3HashToTransactionInput(txArgs.endpoint)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
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
                        `Failed to build initialise relayer account instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for freezing a relayer account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer's public key address to freeze
 *   - `mint`: The mint address of the token for which the relayer account is being frozen
 *   - `signer`: The signer account authorized to freeze the relayer account
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction freezes a relayer account, preventing the relayer from processing transactions
 * for the specified token mint. Freezing a relayer account is a security and compliance measure.
 *
 * **Effects of Freezing:**
 * - Prevents the relayer from processing new transactions
 * - Prevents the relayer from collecting fees
 * - Prevents users from using this relayer for gasless transactions
 * - Relayer account data remains intact but inactive
 *
 * **Use Cases:**
 * - Security: Freezing relayers suspected of malicious activity or security breaches
 * - Compliance: Freezing relayers that violate protocol rules or regulations
 * - Emergency: Freezing relayers in response to security incidents
 * - Maintenance: Temporarily disabling relayers for maintenance or upgrades
 *
 * **Authorization:**
 * Only authorized signers (typically protocol administrators or compliance officers) can freeze
 * relayer accounts. The signer must have the appropriate permissions to perform this operation.
 *
 * **Reversibility:**
 * A frozen relayer account can potentially be unfrozen by authorized parties, depending on
 * protocol configuration and the reason for freezing.
 *
 * @example
 * ```typescript
 * const instruction = await buildFreezeRelayerAccountInstruction({
 *   relayer: relayerPublicKey,
 *   mint: tokenMintAddress,
 *   signer: authorizedSigner,
 * });
 * ```
 */
export async function buildFreezeRelayerAccountInstruction(txAccounts: {
        relayer: SolanaAddress;
        mint: MintAddress;
        signer: SolanaAddress;
}): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods.freezeRelayerAccount().accountsPartial({
                        relayer: txAccounts.relayer,
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
                        `Failed to build freeze relayer account instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for initializing a relayer fees pool account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer's public key address
 *   - `mint`: The mint address of the token for which the fees pool is being created
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation
 *   - `accountOffset`: The account offset used for account derivation
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction initializes a relayer fees pool account that stores fees collected by the
 * relayer for processing transactions. The fees pool allows relayers to accumulate fees before
 * withdrawing them.
 *
 * **Fees Pool Purpose:**
 * The relayer fees pool:
 * - Stores fees collected from users for relayer services
 * - Enables batch fee collection and withdrawal
 * - Supports multiple pools per relayer (one per instruction seed and account offset combination)
 * - Maintains fee accounting for each token mint separately
 *
 * **Account Derivation:**
 * The fees pool account is derived as a Program Derived Address (PDA) using:
 * - Relayer's public key
 * - Instruction seed
 * - Token mint address
 * - Account offset
 *
 * This allows relayers to have multiple fees pools for different purposes or token types.
 *
 * **Initialization:**
 * This must be called before a relayer can collect fees. Each combination of instruction seed
 * and account offset requires a separate fees pool initialization.
 *
 * @example
 * ```typescript
 * const instruction = await buildInitialiseRelayerFeesPoolInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     instructionSeed: BigInt(37),
 *     accountOffset: BigInt(0),
 *   }
 * );
 * ```
 */
export async function buildInitialiseRelayerFeesPoolInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                accountOffset: AccountOffset;
        }
): Promise<TransactionInstruction> {
        try {
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        txArgs.instructionSeed,
                        txAccounts.mint,
                        txArgs.accountOffset
                );

                const ixBuilder = program.methods
                        .initialiseRelayerFeesPool(
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertAccountOffsetToTransactionInput(txArgs.accountOffset)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                relayerFeesPool: relayerFeesPoolAccount,
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
                        `Failed to build initialise relayer fees pool instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for collecting relayer fees from a relayer fees pool.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `destinationAddress`: The destination address where the collected fees will be sent
 *   - `mint`: The mint address of the token for which fees are being collected
 *   - `relayer`: The relayer's public key address
 * @param txArgs - The transaction arguments:
 *   - `instructionSeed`: The instruction seed used for account derivation
 *   - `accountOffset`: The account offset used for account derivation
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction collects accumulated fees from a relayer fees pool and transfers them to
 * the specified destination address. Relayers use this to withdraw fees they have earned from
 * processing transactions.
 *
 * **Fee Collection:**
 * The fees pool accumulates fees from:
 * - Transaction processing fees paid by users
 * - Service fees for gasless transaction processing
 * - Any other fees collected by the relayer
 *
 * **Collection Process:**
 * 1. Identifies the fees pool using relayer, instruction seed, mint, and account offset
 * 2. Transfers all accumulated fees from the pool to the destination address
 * 3. Updates the pool balance to reflect the withdrawal
 *
 * **Destination Address:**
 * The destination address receives the collected fees. This is typically the relayer's
 * wallet address or a designated treasury account.
 *
 * **Pool Identification:**
 * The fees pool is identified using the same parameters used during initialization:
 * - Relayer's public key
 * - Instruction seed
 * - Token mint address
 * - Account offset
 *
 * **Use Cases:**
 * - Regular fee withdrawal by relayers
 * - Consolidating fees from multiple transactions
 * - Transferring fees to treasury or operational accounts
 *
 * @example
 * ```typescript
 * const instruction = await buildCollectRelayerFeesFromRelayerFeesPoolInstruction(
 *   {
 *     destinationAddress: relayerTreasuryAddress,
 *     mint: tokenMintAddress,
 *     relayer: relayerPublicKey,
 *   },
 *   {
 *     instructionSeed: BigInt(37),
 *     accountOffset: BigInt(0),
 *   }
 * );
 * ```
 */
export async function buildCollectRelayerFeesFromRelayerFeesPoolInstruction(
        txAccounts: {
                destinationAddress: SolanaAddress;
                mint: MintAddress;
                relayer: SolanaAddress;
        },
        txArgs: {
                instructionSeed: InstructionSeed;
                accountOffset: AccountOffset;
        }
): Promise<TransactionInstruction> {
        try {
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        txArgs.instructionSeed,
                        txAccounts.mint,
                        txArgs.accountOffset
                );

                const ixBuilder = program.methods
                        .collectRelayerFeesFromRelayerFeesPool(
                                convertInstructionSeedToTransactionInput(txArgs.instructionSeed),
                                convertAccountOffsetToTransactionInput(txArgs.accountOffset)
                        )
                        .accountsPartial({
                                destinationAddress: txAccounts.destinationAddress,
                                mint: txAccounts.mint,
                                relayer: txAccounts.relayer,
                                relayerFeesPool: relayerFeesPoolAccount,
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
                        `Failed to build collect relayer fees from relayer fees pool instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
