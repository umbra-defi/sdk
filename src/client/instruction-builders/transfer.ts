import { WSOL_MINT_ADDRESS } from '@/constants/anchor';
import { program } from '@/idl';
import {
        AccountOffset,
        ArciumX25519Nonce,
        convertAccountOffsetToTransactionInput,
        convertArciumX25519NonceToTransactionInput,
        convertComputationOffsetToTransactionInput,
        convertRescueCiphertextToTransactionInput,
        convertSha3HashToTransactionInput,
        MintAddress,
        RescueCiphertext,
        Sha3Hash,
        SolanaAddress,
} from '@/types';
import { generateRandomComputationOffset, getArciumAccounts } from '@/utils/arcium';
import {
        generateRandomArciumCommissionFeesAccountOffset,
        generateRandomFeesConfigurationAccountOffset,
        generateRandomRelayerFeesPoolOffset,
} from '@/utils/miscellaneous';
import {
        getFeesConfigurationPda,
        getArciumCommissionFeesPoolPda,
        getRelayerFeesPoolPda,
} from '@/utils/pda-generators';
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
 * Builds a transaction instruction for transferring SOL to a new MXE (Multi-Execution Environment) account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSenderSigner`: The Arcium signer account of the sender
 *   - `receiver`: The receiver address where a new encrypted token account will be created
 * @param txArgs - The transaction arguments:
 *   - `transferAmountCiphertext`: The encrypted transfer amount (Rescue ciphertext)
 *   - `transferAmountNonce`: The X25519 nonce used for encryption
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction transfers SOL (native Solana) to a new MXE account. This is used when the receiver
 * does not yet have an encrypted token account for SOL. The transfer is processed within the Arcium
 * Multi-Execution Environment using encrypted amounts to ensure privacy.
 *
 * **New vs Existing Transfers:**
 * - **New Transfer**: Creates a new encrypted token account if one doesn't exist (this function)
 * - **Existing Transfer**: Adds to an existing encrypted token account (`buildExistingTokenTransferSolMxeInstruction`)
 *
 * **Privacy Features:**
 * - Transfer amount is encrypted using Rescue cipher
 * - Sender and receiver identities are protected
 * - Transfer details are processed within the MXE for privacy
 * - X25519 encryption ensures only authorized parties can decrypt
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'new_token_transfer_sol_mxe'
 *
 * **SOL-Specific:**
 * This function is specifically for SOL transfers. It uses WSOL (Wrapped SOL) mint address
 * internally for account derivation. For SPL token transfers, use `buildNewTokenTransferSplMxeInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless transfers.
 *
 * @example
 * ```typescript
 * const instruction = await buildNewTokenTransferSolMxeInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSenderSigner: senderArciumSignerPublicKey,
 *     receiver: receiverPublicKey,
 *   },
 *   {
 *     transferAmountCiphertext: encryptedAmount,
 *     transferAmountNonce: encryptionNonce,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildNewTokenTransferSolMxeInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSenderSigner: SolanaAddress;
                receiver: SolanaAddress;
        },
        txArgs: {
                transferAmountCiphertext: RescueCiphertext;
                transferAmountNonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(11) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const arciumCommissionFeesAccountOffset =
                        generateRandomArciumCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                WSOL_MINT_ADDRESS as MintAddress
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        relayerFeesPoolOffset
                );
                const arciumCommissionFeesAccount = getArciumCommissionFeesPoolPda(
                        WSOL_MINT_ADDRESS as MintAddress,
                        INSTRUCTION_SEED,
                        arciumCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        feesConfigurationAccountOffset
                );

                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'new_token_transfer_sol_mxe');

                const ixBuilder = program.methods
                        .newTokenTransferSolMxe(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        arciumCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.transferAmountCiphertext
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.transferAmountNonce
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                receiverAddress: txAccounts.receiver,
                                arciumSenderSigner: txAccounts.arciumSenderSigner,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: arciumCommissionFeesAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                computationAccount: computationAccount,
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
                        `Failed to build new token transfer SOL MXE instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for transferring SOL to an existing MXE (Multi-Execution Environment) account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSenderSigner`: The Arcium signer account of the sender
 *   - `receiver`: The receiver address of the existing encrypted token account
 * @param txArgs - The transaction arguments (same as `buildNewTokenTransferSolMxeInstruction`):
 *   - `transferAmountCiphertext`: The encrypted transfer amount (Rescue ciphertext)
 *   - `transferAmountNonce`: The X25519 nonce used for encryption
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction transfers SOL (native Solana) to an existing MXE account. This is used when the receiver
 * already has an encrypted token account for SOL. The transfer is processed within the Arcium
 * Multi-Execution Environment using encrypted amounts to ensure privacy.
 *
 * **New vs Existing Transfers:**
 * - **New Transfer**: Creates a new encrypted token account if one doesn't exist (`buildNewTokenTransferSolMxeInstruction`)
 * - **Existing Transfer**: Adds to an existing encrypted token account (this function)
 *
 * **Privacy Features:**
 * - Transfer amount is encrypted using Rescue cipher
 * - Sender and receiver identities are protected
 * - Transfer details are processed within the MXE for privacy
 * - X25519 encryption ensures only authorized parties can decrypt
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'existing_token_transfer_sol_mxe'
 *
 * **SOL-Specific:**
 * This function is specifically for SOL transfers. It uses WSOL (Wrapped SOL) mint address
 * internally for account derivation. For SPL token transfers, use `buildExistingTokenTransferSplMxeInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless transfers.
 *
 * @example
 * ```typescript
 * const instruction = await buildExistingTokenTransferSolMxeInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSenderSigner: senderArciumSignerPublicKey,
 *     receiver: receiverPublicKey,
 *   },
 *   {
 *     transferAmountCiphertext: encryptedAmount,
 *     transferAmountNonce: encryptionNonce,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildExistingTokenTransferSolMxeInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSenderSigner: SolanaAddress;
                receiver: SolanaAddress;
        },
        txArgs: {
                transferAmountCiphertext: RescueCiphertext;
                transferAmountNonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(12) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const arciumCommissionFeesAccountOffset =
                        generateRandomArciumCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                WSOL_MINT_ADDRESS as MintAddress
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        relayerFeesPoolOffset
                );
                const arciumCommissionFeesAccount = getArciumCommissionFeesPoolPda(
                        WSOL_MINT_ADDRESS as MintAddress,
                        INSTRUCTION_SEED,
                        arciumCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        feesConfigurationAccountOffset
                );

                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'existing_token_transfer_sol_mxe');

                const ixBuilder = program.methods
                        .existingTokenTransferSolMxe(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        arciumCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.transferAmountCiphertext
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.transferAmountNonce
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                receiverAddress: txAccounts.receiver,
                                arciumSenderSigner: txAccounts.arciumSenderSigner,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: arciumCommissionFeesAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                computationAccount: computationAccount,
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
                        `Failed to build existing token transfer SOL MXE instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for transferring SOL to a new shared account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSenderSigner`: The Arcium signer account of the sender
 *   - `receiver`: The receiver address where a new shared token account will be created
 * @param txArgs - The transaction arguments (same structure as MXE transfers):
 *   - `transferAmountCiphertext`: The encrypted transfer amount (Rescue ciphertext)
 *   - `transferAmountNonce`: The X25519 nonce used for encryption
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction transfers SOL (native Solana) to a new shared account. Shared accounts enable
 * multi-party access to encrypted data using X25519 key exchange, unlike MXE accounts which are
 * private to a single user.
 *
 * **Shared vs MXE Accounts:**
 * - **MXE Accounts**: Private accounts accessible only by the owner (`buildNewTokenTransferSolMxeInstruction`)
 * - **Shared Accounts**: Multi-party accounts accessible by authorized parties (this function)
 *
 * **Privacy Features:**
 * - Transfer amount is encrypted using Rescue cipher
 * - Sender and receiver identities are protected
 * - Transfer details are processed within the MXE for privacy
 * - X25519 encryption enables shared access while maintaining privacy
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'new_token_transfer_sol_shared'
 *
 * **SOL-Specific:**
 * This function is specifically for SOL transfers. It uses WSOL (Wrapped SOL) mint address
 * internally for account derivation. For SPL token transfers, use `buildNewTokenTransferSplSharedInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless transfers.
 *
 * @example
 * ```typescript
 * const instruction = await buildNewTokenTransferSolSharedInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSenderSigner: senderArciumSignerPublicKey,
 *     receiver: sharedAccountPublicKey,
 *   },
 *   {
 *     transferAmountCiphertext: encryptedAmount,
 *     transferAmountNonce: encryptionNonce,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildNewTokenTransferSolSharedInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSenderSigner: SolanaAddress;
                receiver: SolanaAddress;
        },
        txArgs: {
                transferAmountCiphertext: RescueCiphertext;
                transferAmountNonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(13) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const arciumCommissionFeesAccountOffset =
                        generateRandomArciumCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                WSOL_MINT_ADDRESS as MintAddress
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        relayerFeesPoolOffset
                );
                const arciumCommissionFeesAccount = getArciumCommissionFeesPoolPda(
                        WSOL_MINT_ADDRESS as MintAddress,
                        INSTRUCTION_SEED,
                        arciumCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        feesConfigurationAccountOffset
                );

                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'new_token_transfer_sol_shared');

                const ixBuilder = program.methods
                        .newTokenTransferSolShared(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        arciumCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.transferAmountCiphertext
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.transferAmountNonce
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                receiverAddress: txAccounts.receiver,
                                arciumSenderSigner: txAccounts.arciumSenderSigner,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: arciumCommissionFeesAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                computationAccount: computationAccount,
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
                        `Failed to build new token transfer SOL shared instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for transferring SOL to an existing shared account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSenderSigner`: The Arcium signer account of the sender
 *   - `receiver`: The receiver address of the existing shared token account
 * @param txArgs - The transaction arguments (same structure as other transfer functions):
 *   - `transferAmountCiphertext`: The encrypted transfer amount (Rescue ciphertext)
 *   - `transferAmountNonce`: The X25519 nonce used for encryption
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction transfers SOL (native Solana) to an existing shared account. Shared accounts enable
 * multi-party access to encrypted data using X25519 key exchange, unlike MXE accounts which are
 * private to a single user.
 *
 * **New vs Existing Transfers:**
 * - **New Transfer**: Creates a new shared token account if one doesn't exist (`buildNewTokenTransferSolSharedInstruction`)
 * - **Existing Transfer**: Adds to an existing shared token account (this function)
 *
 * **Privacy Features:**
 * - Transfer amount is encrypted using Rescue cipher
 * - Sender and receiver identities are protected
 * - Transfer details are processed within the MXE for privacy
 * - X25519 encryption enables shared access while maintaining privacy
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'existing_token_transfer_sol_shared'
 *
 * **SOL-Specific:**
 * This function is specifically for SOL transfers. It uses WSOL (Wrapped SOL) mint address
 * internally for account derivation. For SPL token transfers, use `buildExistingTokenTransferSplSharedInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless transfers.
 *
 * @example
 * ```typescript
 * const instruction = await buildExistingTokenTransferSolSharedInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSenderSigner: senderArciumSignerPublicKey,
 *     receiver: sharedAccountPublicKey,
 *   },
 *   {
 *     transferAmountCiphertext: encryptedAmount,
 *     transferAmountNonce: encryptionNonce,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildExistingTokenTransferSolSharedInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSenderSigner: SolanaAddress;
                receiver: SolanaAddress;
        },
        txArgs: {
                transferAmountCiphertext: RescueCiphertext;
                transferAmountNonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(14) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const arciumCommissionFeesAccountOffset =
                        generateRandomArciumCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                WSOL_MINT_ADDRESS as MintAddress
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        relayerFeesPoolOffset
                );
                const arciumCommissionFeesAccount = getArciumCommissionFeesPoolPda(
                        WSOL_MINT_ADDRESS as MintAddress,
                        INSTRUCTION_SEED,
                        arciumCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        feesConfigurationAccountOffset
                );
                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'existing_token_transfer_sol_shared');

                const ixBuilder = program.methods
                        .existingTokenTransferSolShared(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        arciumCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.transferAmountCiphertext
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.transferAmountNonce
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                receiverAddress: txAccounts.receiver,
                                arciumSenderSigner: txAccounts.arciumSenderSigner,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: arciumCommissionFeesAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                computationAccount: computationAccount,
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
                        `Failed to build existing token transfer SOL shared instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for transferring SPL tokens to a new MXE (Multi-Execution Environment) account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSenderSigner`: The Arcium signer account of the sender
 *   - `receiver`: The receiver address where a new encrypted token account will be created
 *   - `mint`: The mint address of the SPL token being transferred
 * @param txArgs - The transaction arguments:
 *   - `transferAmountCiphertext`: The encrypted transfer amount (Rescue ciphertext)
 *   - `transferAmountNonce`: The X25519 nonce used for encryption
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction transfers SPL tokens to a new MXE account. This is used when the receiver
 * does not yet have an encrypted token account for the specified mint. The transfer is processed
 * within the Arcium Multi-Execution Environment using encrypted amounts to ensure privacy.
 *
 * **New vs Existing Transfers:**
 * - **New Transfer**: Creates a new encrypted token account if one doesn't exist (this function)
 * - **Existing Transfer**: Adds to an existing encrypted token account (`buildExistingTokenTransferSplMxeInstruction`)
 *
 * **Privacy Features:**
 * - Transfer amount is encrypted using Rescue cipher
 * - Sender and receiver identities are protected
 * - Transfer details are processed within the MXE for privacy
 * - X25519 encryption ensures only authorized parties can decrypt
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'new_token_transfer_spl_mxe'
 *
 * **SPL Token Support:**
 * This function supports all SPL tokens (USDC, USDT, etc.). Each token mint has its own
 * encrypted account structure. For SOL transfers, use `buildNewTokenTransferSolMxeInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless transfers.
 *
 * @example
 * ```typescript
 * const instruction = await buildNewTokenTransferSplMxeInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSenderSigner: senderArciumSignerPublicKey,
 *     receiver: receiverPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     transferAmountCiphertext: encryptedAmount,
 *     transferAmountNonce: encryptionNonce,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildNewTokenTransferSplMxeInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSenderSigner: SolanaAddress;
                receiver: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                transferAmountCiphertext: RescueCiphertext;
                transferAmountNonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(15) as AccountOffset;
                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const arciumCommissionFeesAccountOffset =
                        generateRandomArciumCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                txAccounts.mint
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        relayerFeesPoolOffset
                );
                const arciumCommissionFeesAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        INSTRUCTION_SEED,
                        arciumCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        feesConfigurationAccountOffset
                );
                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'new_token_transfer_spl_mxe');

                const ixBuilder = program.methods
                        .newTokenTransferSplMxe(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        arciumCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.transferAmountCiphertext
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.transferAmountNonce
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                receiverAddress: txAccounts.receiver,
                                arciumSenderSigner: txAccounts.arciumSenderSigner,
                                mint: txAccounts.mint,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: arciumCommissionFeesAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                computationAccount: computationAccount,
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
                        `Failed to build new token transfer SPL MXE instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for transferring SPL tokens to an existing MXE (Multi-Execution Environment) account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSenderSigner`: The Arcium signer account of the sender
 *   - `receiver`: The receiver address of the existing encrypted token account
 *   - `mint`: The mint address of the SPL token being transferred
 * @param txArgs - The transaction arguments (same as `buildNewTokenTransferSplMxeInstruction`):
 *   - `transferAmountCiphertext`: The encrypted transfer amount (Rescue ciphertext)
 *   - `transferAmountNonce`: The X25519 nonce used for encryption
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction transfers SPL tokens to an existing MXE account. This is used when the receiver
 * already has an encrypted token account for the specified mint. The transfer is processed within
 * the Arcium Multi-Execution Environment using encrypted amounts to ensure privacy.
 *
 * **New vs Existing Transfers:**
 * - **New Transfer**: Creates a new encrypted token account if one doesn't exist (`buildNewTokenTransferSplMxeInstruction`)
 * - **Existing Transfer**: Adds to an existing encrypted token account (this function)
 *
 * **Privacy Features:**
 * - Transfer amount is encrypted using Rescue cipher
 * - Sender and receiver identities are protected
 * - Transfer details are processed within the MXE for privacy
 * - X25519 encryption ensures only authorized parties can decrypt
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'existing_token_transfer_spl_mxe'
 *
 * **SPL Token Support:**
 * This function supports all SPL tokens (USDC, USDT, etc.). Each token mint has its own
 * encrypted account structure. For SOL transfers, use `buildExistingTokenTransferSolMxeInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless transfers.
 *
 * @example
 * ```typescript
 * const instruction = await buildExistingTokenTransferSplMxeInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSenderSigner: senderArciumSignerPublicKey,
 *     receiver: receiverPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     transferAmountCiphertext: encryptedAmount,
 *     transferAmountNonce: encryptionNonce,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildExistingTokenTransferSplMxeInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSenderSigner: SolanaAddress;
                receiver: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                transferAmountCiphertext: RescueCiphertext;
                transferAmountNonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(16) as AccountOffset;
                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const arciumCommissionFeesAccountOffset =
                        generateRandomArciumCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                txAccounts.mint
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        relayerFeesPoolOffset
                );
                const arciumCommissionFeesAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        INSTRUCTION_SEED,
                        arciumCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        feesConfigurationAccountOffset
                );
                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'existing_token_transfer_spl_mxe');

                const ixBuilder = program.methods
                        .existingTokenTransferSplMxe(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        arciumCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.transferAmountCiphertext
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.transferAmountNonce
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                receiverAddress: txAccounts.receiver,
                                arciumSenderSigner: txAccounts.arciumSenderSigner,
                                mint: txAccounts.mint,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: arciumCommissionFeesAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                computationAccount: computationAccount,
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
                        `Failed to build existing token transfer SPL MXE instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for transferring SPL tokens to a new shared account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSenderSigner`: The Arcium signer account of the sender
 *   - `receiver`: The receiver address where a new shared token account will be created
 *   - `mint`: The mint address of the SPL token being transferred
 * @param txArgs - The transaction arguments (same structure as MXE transfers):
 *   - `transferAmountCiphertext`: The encrypted transfer amount (Rescue ciphertext)
 *   - `transferAmountNonce`: The X25519 nonce used for encryption
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction transfers SPL tokens to a new shared account. Shared accounts enable
 * multi-party access to encrypted data using X25519 key exchange, unlike MXE accounts which are
 * private to a single user.
 *
 * **Shared vs MXE Accounts:**
 * - **MXE Accounts**: Private accounts accessible only by the owner (`buildNewTokenTransferSplMxeInstruction`)
 * - **Shared Accounts**: Multi-party accounts accessible by authorized parties (this function)
 *
 * **Privacy Features:**
 * - Transfer amount is encrypted using Rescue cipher
 * - Sender and receiver identities are protected
 * - Transfer details are processed within the MXE for privacy
 * - X25519 encryption enables shared access while maintaining privacy
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'new_token_transfer_spl_shared'
 *
 * **SPL Token Support:**
 * This function supports all SPL tokens (USDC, USDT, etc.). Each token mint has its own
 * encrypted account structure. For SOL transfers, use `buildNewTokenTransferSolSharedInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless transfers.
 *
 * @example
 * ```typescript
 * const instruction = await buildNewTokenTransferSplSharedInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSenderSigner: senderArciumSignerPublicKey,
 *     receiver: sharedAccountPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     transferAmountCiphertext: encryptedAmount,
 *     transferAmountNonce: encryptionNonce,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildNewTokenTransferSplSharedInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSenderSigner: SolanaAddress;
                receiver: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                transferAmountCiphertext: RescueCiphertext;
                transferAmountNonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(17) as AccountOffset;
                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const arciumCommissionFeesAccountOffset =
                        generateRandomArciumCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                txAccounts.mint
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        relayerFeesPoolOffset
                );
                const arciumCommissionFeesAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        INSTRUCTION_SEED,
                        arciumCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        feesConfigurationAccountOffset
                );
                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'new_token_transfer_spl_shared');

                const ixBuilder = program.methods
                        .newTokenTransferSplShared(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        arciumCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.transferAmountCiphertext
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.transferAmountNonce
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                receiverAddress: txAccounts.receiver,
                                arciumSenderSigner: txAccounts.arciumSenderSigner,
                                mint: txAccounts.mint,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: arciumCommissionFeesAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                computationAccount: computationAccount,
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
                        `Failed to build new token transfer SPL shared instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for transferring SPL tokens to an existing shared account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSenderSigner`: The Arcium signer account of the sender
 *   - `receiver`: The receiver address of the existing shared token account
 *   - `mint`: The mint address of the SPL token being transferred
 * @param txArgs - The transaction arguments (same structure as other transfer functions):
 *   - `transferAmountCiphertext`: The encrypted transfer amount (Rescue ciphertext)
 *   - `transferAmountNonce`: The X25519 nonce used for encryption
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction transfers SPL tokens to an existing shared account. Shared accounts enable
 * multi-party access to encrypted data using X25519 key exchange, unlike MXE accounts which are
 * private to a single user.
 *
 * **New vs Existing Transfers:**
 * - **New Transfer**: Creates a new shared token account if one doesn't exist (`buildNewTokenTransferSplSharedInstruction`)
 * - **Existing Transfer**: Adds to an existing shared token account (this function)
 *
 * **Privacy Features:**
 * - Transfer amount is encrypted using Rescue cipher
 * - Sender and receiver identities are protected
 * - Transfer details are processed within the MXE for privacy
 * - X25519 encryption enables shared access while maintaining privacy
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'existing_token_transfer_spl_shared'
 *
 * **SPL Token Support:**
 * This function supports all SPL tokens (USDC, USDT, etc.). Each token mint has its own
 * encrypted account structure. For SOL transfers, use `buildExistingTokenTransferSolSharedInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless transfers.
 *
 * @example
 * ```typescript
 * const instruction = await buildExistingTokenTransferSplSharedInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSenderSigner: senderArciumSignerPublicKey,
 *     receiver: sharedAccountPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     transferAmountCiphertext: encryptedAmount,
 *     transferAmountNonce: encryptionNonce,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildExistingTokenTransferSplSharedInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSenderSigner: SolanaAddress;
                receiver: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                transferAmountCiphertext: RescueCiphertext;
                transferAmountNonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(18) as AccountOffset;
                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const arciumCommissionFeesAccountOffset =
                        generateRandomArciumCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                txAccounts.mint
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        relayerFeesPoolOffset
                );
                const arciumCommissionFeesAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        INSTRUCTION_SEED,
                        arciumCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        feesConfigurationAccountOffset
                );
                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'existing_token_transfer_spl_shared');

                const ixBuilder = program.methods
                        .existingTokenTransferSplShared(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        arciumCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.transferAmountCiphertext
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.transferAmountNonce
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                receiverAddress: txAccounts.receiver,
                                arciumSenderSigner: txAccounts.arciumSenderSigner,
                                mint: txAccounts.mint,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: arciumCommissionFeesAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                computationAccount: computationAccount,
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
                        `Failed to build existing token transfer SPL shared instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
