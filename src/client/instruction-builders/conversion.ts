import { WSOL_MINT_ADDRESS } from '@/constants/anchor';
import { program } from '@/idl';
import {
        AccountOffset,
        ArciumX25519Nonce,
        ArciumX25519PublicKey,
        convertAccountOffsetToTransactionInput,
        convertArciumX25519NonceToTransactionInput,
        convertArciumX25519PublicKeyToTransactionInput,
        convertComputationOffsetToTransactionInput,
        convertGroth16ProofABeBytesToTransactionInput,
        convertGroth16ProofBBeBytesToTransactionInput,
        convertGroth16ProofCBeBytesToTransactionInput,
        convertPoseidonHashToTransactionInput,
        convertRescueCiphertextToTransactionInput,
        convertSha3HashToTransactionInput,
        Groth16ProofABeBytes,
        Groth16ProofBBeBytes,
        Groth16ProofCBeBytes,
        MintAddress,
        PoseidonHash,
        RescueCiphertext,
        Sha3Hash,
        SolanaAddress,
} from '@/types';
import { generateRandomComputationOffset, getArciumAccounts } from '@/utils/arcium';
import {
        generateRandomFeesConfigurationAccountOffset,
        generateRandomRelayerFeesPoolOffset,
} from '@/utils/miscellaneous';
import { getFeesConfigurationPda, getRelayerFeesPoolPda } from '@/utils/pda-generators';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

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
 * Builds a transaction instruction for updating a master viewing key in the Umbra Privacy protocol.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `payer`: The account that will pay for the transaction fees
 *   - `arciumSigner`: The Arcium signer account used for MXE operations
 * @param txArgs - The transaction arguments:
 *   - `masterViewingKey`: The Poseidon hash of the new master viewing key
 *   - `masterViewingKeyCiphertext`: The Rescue ciphertext of the master viewing key
 *   - `masterViewingKeyBlindingFactor`: The blinding factor used in the encryption
 *   - `masterViewingKeyNonce`: The X25519 nonce used for encryption
 *   - `masterViewingKeyShaCommitment`: The SHA3 commitment hash of the master viewing key
 *   - `masterViewingKeyHash`: The Poseidon hash of the master viewing key
 *   - `proofA`, `proofB`, `proofC`: The Groth16 zero-knowledge proof components
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction updates a user's master viewing key in the Umbra Privacy protocol. The master
 * viewing key is a critical component that enables compliance and viewing capabilities while
 * maintaining privacy. The update is performed within the Arcium Multi-Execution Environment (MXE)
 * using zero-knowledge proofs to ensure privacy.
 *
 * **Process:**
 * 1. Generates a random computation offset for the MXE computation
 * 2. Derives all required Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * 3. Converts all cryptographic data to transaction input format
 * 4. Builds the instruction with all accounts and arguments
 *
 * **Security:**
 * The master viewing key update requires a zero-knowledge proof to ensure the user knows the
 * original key and the new key is valid. All sensitive data is encrypted using Rescue cipher
 * and X25519 key exchange.
 *
 * @example
 * ```typescript
 * const instruction = await buildUpdateMasterViewingKeyInstruction(
 *   {
 *     payer: payerPublicKey,
 *     arciumSigner: arciumSignerPublicKey,
 *   },
 *   {
 *     masterViewingKey: newMasterViewingKeyHash,
 *     masterViewingKeyCiphertext: encryptedKey,
 *     masterViewingKeyBlindingFactor: blindingFactor,
 *     masterViewingKeyNonce: nonce,
 *     masterViewingKeyShaCommitment: shaCommitment,
 *     masterViewingKeyHash: keyHash,
 *     proofA: proofA,
 *     proofB: proofB,
 *     proofC: proofC,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildUpdateMasterViewingKeyInstruction(
        txAccounts: {
                payer: SolanaAddress;
                arciumSigner: SolanaAddress;
        },
        txArgs: {
                masterViewingKeyCiphertext: RescueCiphertext;
                masterViewingKeyBlindingFactor: RescueCiphertext;
                masterViewingKeyNonce: ArciumX25519Nonce;
                masterViewingKeyShaCommitment: Sha3Hash;
                masterViewingKeyHash: PoseidonHash;
                proofA: Groth16ProofABeBytes;
                proofB: Groth16ProofBBeBytes;
                proofC: Groth16ProofCBeBytes;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const computationOffset = generateRandomComputationOffset();

                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'update_master_viewing_key');

                const ixBuilder = program.methods
                        .updateMasterViewingKey(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.masterViewingKeyCiphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.masterViewingKeyBlindingFactor
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.masterViewingKeyNonce
                                ),
                                convertSha3HashToTransactionInput(
                                        txArgs.masterViewingKeyShaCommitment
                                ),
                                convertPoseidonHashToTransactionInput(txArgs.masterViewingKeyHash),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.proofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.proofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.proofC),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                payer: txAccounts.payer,
                                arciumSigner: txAccounts.arciumSigner,
                                computationAccount,
                                compDefAccount,
                                clusterAccount,
                                mxeAccount,
                                mempoolAccount,
                                executingPool,
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
                        `Failed to build update master viewing key instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for converting a user account from MXE (Multi-Execution Environment) to shared format.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `arciumSigner`: The Arcium signer account used for MXE operations
 * @param txArgs - The transaction arguments:
 *   - `x25519PublicKey`: The X25519 public key for the shared account encryption
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When conversion errors occur or instruction building fails
 *
 * @remarks
 * This instruction converts a user account from the Arcium Multi-Execution Environment (MXE) format
 * to a shared format that can be accessed by multiple parties using X25519 key exchange. This conversion
 * enables collaborative access to encrypted user data while maintaining privacy.
 *
 * **Process:**
 * 1. Converts the X25519 public key and optional data to transaction input format
 * 2. Builds the instruction with the Arcium signer account and arguments
 *
 * **Use Cases:**
 * - Enabling shared access to user accounts for compliance or collaboration
 * - Migrating from private MXE accounts to shared accounts
 * - Setting up multi-party access to encrypted data
 *
 * @example
 * ```typescript
 * const instruction = await buildConvertUserAccountFromMxeToSharedInstruction(
 *   {
 *     arciumSigner: arciumSignerPublicKey,
 *   },
 *   {
 *     x25519PublicKey: sharedPublicKey,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildConvertUserAccountFromMxeToSharedInstruction(
        txAccounts: {
                arciumSigner: SolanaAddress;
        },
        txArgs: {
                x25519PublicKey: ArciumX25519PublicKey;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const ixBuilder = program.methods
                        .convertUserAccountFromMxeToShared(
                                convertArciumX25519PublicKeyToTransactionInput(
                                        txArgs.x25519PublicKey
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                arciumSigner: txAccounts.arciumSigner,
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
                        `Failed to build convert user account from MXE to shared instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for converting a token account from MXE (Multi-Execution Environment) to shared format.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `payer`: The account that will pay for the transaction fees
 *   - `mint`: The mint address of the token account to convert
 * @param txArgs - The transaction arguments:
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction converts a token account from the Arcium Multi-Execution Environment (MXE) format
 * to a shared format. This conversion enables the token account to be accessed by multiple parties
 * while maintaining privacy through encryption.
 *
 * **Process:**
 * 1. Generates a random computation offset for the MXE computation
 * 2. Derives all required Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * 3. Converts the computation offset and optional data to transaction input format
 * 4. Builds the instruction with all accounts and arguments
 *
 * **Use Cases:**
 * - Converting private token accounts to shared accounts for compliance
 * - Enabling multi-party access to encrypted token balances
 * - Migrating token accounts from MXE to shared format
 *
 * @example
 * ```typescript
 * const instruction = await buildConvertTokenAccountFromMxeToSharedInstruction(
 *   {
 *     payer: payerPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildConvertTokenAccountFromMxeToSharedInstruction(
        txAccounts: {
                payer: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const computationOffset = generateRandomComputationOffset();

                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(
                        computationOffset,
                        'convert_token_account_from_mxe_to_shared'
                );

                const ixBuilder = program.methods
                        .convertTokenAccountFromMxeToShared(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                payer: txAccounts.payer,
                                mint: txAccounts.mint,
                                computationAccount,
                                compDefAccount,
                                clusterAccount,
                                mxeAccount,
                                mempoolAccount,
                                executingPool,
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
                        `Failed to build convert token account from MXE to shared instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for converting a SOL token account from MXE to shared format through a relayer.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSigner`: The Arcium signer account used for MXE operations
 * @param txArgs - The transaction arguments:
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction converts a SOL (Wrapped SOL) token account from the Arcium Multi-Execution Environment (MXE)
 * format to a shared format, with the transaction being processed by a relayer. The relayer pays the transaction
 * fees on behalf of the user, enabling gasless transactions.
 *
 * **Process:**
 * 1. Uses a fixed instruction seed (37) and WSOL mint address for account derivation
 * 2. Generates random offsets for relayer fees pool and fees configuration account
 * 3. Derives the relayer fees pool and fees configuration PDAs
 * 4. Generates a random computation offset for the MXE computation
 * 5. Derives all required Arcium accounts
 * 6. Builds the instruction with all accounts and arguments
 *
 * **Relayer Benefits:**
 * - Users don't need SOL to pay for transaction fees
 * - Relayers can batch transactions for efficiency
 * - Enables gasless user experience
 *
 * @example
 * ```typescript
 * const instruction = await buildConvertTokenAccountFromMxeToSharedSolThroughRelayerInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSigner: arciumSignerPublicKey,
 *   },
 *   {
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildConvertTokenAccountFromMxeToSharedSolThroughRelayerInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSigner: SolanaAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(37) as AccountOffset;
                const MINT_ADDRESS = new PublicKey(
                        'So11111111111111111111111111111111111111112'
                ) as MintAddress;

                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        MINT_ADDRESS
                );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        MINT_ADDRESS
                );

                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        MINT_ADDRESS,
                        relayerFeesPoolOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        MINT_ADDRESS,
                        feesConfigurationAccountOffset
                );

                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(
                        computationOffset,
                        'convert_token_account_from_mxe_to_shared_sol_through_relayer'
                );

                const ixBuilder = program.methods
                        .convertTokenAccountFromMxeToSharedSolThroughRelayer(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                arciumSigner: txAccounts.arciumSigner,
                                relayerFeesPool: relayerFeesPoolAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                wsolMint: WSOL_MINT_ADDRESS,
                                computationAccount,
                                compDefAccount,
                                clusterAccount,
                                mxeAccount,
                                mempoolAccount,
                                executingPool,
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
                        `Failed to build convert token account from MXE to shared SOL through relayer instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for converting an SPL token account from MXE to shared format through a relayer.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSigner`: The Arcium signer account used for MXE operations
 *   - `mint`: The mint address of the SPL token account to convert
 * @param txArgs - The transaction arguments:
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When the mint address is WSOL, account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction converts an SPL token account from the Arcium Multi-Execution Environment (MXE)
 * format to a shared format, with the transaction being processed by a relayer. The relayer pays the
 * transaction fees on behalf of the user, enabling gasless transactions.
 *
 * **Process:**
 * 1. Validates that the mint address is not WSOL (use `buildConvertTokenAccountFromMxeToSharedSolThroughRelayerInstruction` for SOL)
 * 2. Uses a fixed instruction seed (38) and the provided mint address for account derivation
 * 3. Generates random offsets for relayer fees pool and fees configuration account
 * 4. Derives the relayer fees pool and fees configuration PDAs
 * 5. Generates a random computation offset for the MXE computation
 * 6. Derives all required Arcium accounts
 * 7. Builds the instruction with all accounts and arguments
 *
 * **Mint Address Validation:**
 * The mint address cannot be WSOL (Wrapped SOL). For SOL conversions, use
 * `buildConvertTokenAccountFromMxeToSharedSolThroughRelayerInstruction` instead.
 *
 * **Relayer Benefits:**
 * - Users don't need SOL to pay for transaction fees
 * - Relayers can batch transactions for efficiency
 * - Enables gasless user experience
 *
 * @example
 * ```typescript
 * const instruction = await buildConvertTokenAccountFromMxeToSharedSplThroughRelayer(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSigner: arciumSignerPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Handle errors
 * try {
 *   const instruction = await buildConvertTokenAccountFromMxeToSharedSplThroughRelayer(
 *     { relayer, arciumSigner, mint: wsolMint }, // This will throw an error
 *     { optionalData }
 *   );
 * } catch (error) {
 *   if (error instanceof InstructionBuildingError) {
 *     console.error('Failed to build instruction:', error.message);
 *   }
 * }
 * ```
 */
export async function buildConvertTokenAccountFromMxeToSharedSplThroughRelayer(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSigner: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                // Validate that mint address is not WSOL
                if (txAccounts.mint.equals(WSOL_MINT_ADDRESS)) {
                        throw new InstructionBuildingError(
                                'Mint address cannot be WSOL. Use buildConvertTokenAccountFromMxeToSharedSolThroughRelayerInstruction for SOL conversions.'
                        );
                }

                const INSTRUCTION_SEED = BigInt(38) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
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
                } = getArciumAccounts(
                        computationOffset,
                        'convert_token_account_from_mxe_to_shared_spl_through_relayer'
                );

                const ixBuilder = program.methods
                        .convertTokenAccountFromMxeToSharedSplThroughRelayer(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                arciumSigner: txAccounts.arciumSigner,
                                relayerFeesPool: relayerFeesPoolAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
                                wsolMint: WSOL_MINT_ADDRESS,
                                mint: txAccounts.mint,
                                computationAccount,
                                compDefAccount,
                                clusterAccount,
                                mxeAccount,
                                mempoolAccount,
                                executingPool,
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
                        `Failed to build convert token account from MXE to shared SPL through relayer instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
