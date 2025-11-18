import { WSOL_MINT_ADDRESS } from '@/constants/anchor';
import { program } from '@/idl';
import {
        ArciumX25519Nonce,
        Sha3Hash,
        RescueCiphertext,
        SolanaAddress,
        PoseidonHash,
        Time,
        AccountOffset,
        MintAddress,
        convertAccountOffsetToTransactionInput,
        convertRescueCiphertextToTransactionInput,
        convertSha3HashToTransactionInput,
        convertTimeToTransactionInput,
        convertPoseidonHashToTransactionInput,
        convertArciumX25519NonceToTransactionInput,
        Groth16ProofCBeBytes,
        Groth16ProofBBeBytes,
        Groth16ProofABeBytes,
        convertComputationOffsetToTransactionInput,
        convertGroth16ProofABeBytesToTransactionInput,
        convertGroth16ProofBBeBytesToTransactionInput,
        convertGroth16ProofCBeBytesToTransactionInput,
        ArciumX25519PublicKey,
        Amount,
        convertAmountToTransactionInput,
        convertArciumX25519PublicKeyToTransactionInput,
} from '@/types';
import { generateRandomComputationOffset, getArciumAccounts } from '@/utils/arcium';
import {
        generateRandomArciumCommissionFeesAccountOffset,
        generateRandomFeesConfigurationAccountOffset,
        generateRandomPublicCommissionFeesAccountOffset,
        generateRandomRelayerFeesPoolOffset,
} from '@/utils/miscellaneous';
import {
        getArciumCommissionFeesPoolPda,
        getFeesConfigurationPda,
        getPublicCommissionFeesPoolPda,
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
 * Builds a transaction instruction for withdrawing SOL from an encrypted account into the mixer pool.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSigner`: The Arcium signer account used for MXE operations
 * @param txArgs - The transaction arguments:
 *   - `withdrawalAmountCiphertext`: The encrypted withdrawal amount (Rescue ciphertext)
 *   - `withdrawalAmountBlindingFactor`: The blinding factor used in the encryption
 *   - `withdrawalAmountNonce`: The X25519 nonce used for encryption
 *   - `withdrawalAmountCommitment`: The SHA3 commitment hash of the withdrawal amount
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 *   - `time`: The timestamp components for transaction linking
 *   - `linkerHash`: The Poseidon hash of the linker address for compliance
 *   - `depositCommitment`: The Poseidon hash of the original deposit commitment
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction withdraws SOL (native Solana) from an encrypted account and deposits it into
 * the mixer pool. The withdrawal is processed within the Arcium Multi-Execution Environment using
 * zero-knowledge proofs to ensure privacy while verifying the withdrawal is valid.
 *
 * **Withdrawal Process:**
 * Withdrawals from encrypted accounts into the mixer pool:
 * - Verify the withdrawal amount using zero-knowledge proofs
 * - Check the deposit commitment exists in the Merkle tree
 * - Verify the nullifier hasn't been used (prevents double-spending)
 * - Transfer the withdrawn amount to the mixer pool
 * - Register the nullifier to prevent future withdrawals of the same deposit
 *
 * **Privacy Features:**
 * - Withdrawal amount is encrypted using Rescue cipher
 * - Zero-knowledge proofs verify withdrawal validity without revealing details
 * - Deposit commitment verification maintains privacy
 * - Linker hash enables compliance while preserving anonymity
 * - Nullifier prevents double-spending without revealing deposit identity
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'withdrawIntoMixerPoolSol'
 *
 * **SOL-Specific:**
 * This function is specifically for SOL withdrawals. It uses WSOL (Wrapped SOL) mint address
 * internally for account derivation. For SPL token withdrawals, use `buildWithdrawIntoMixerPoolSplInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless withdrawals.
 *
 * **Time Components:**
 * The time parameter is used for transaction linking and uniqueness, enabling compliance
 * features while maintaining privacy.
 *
 * @example
 * ```typescript
 * const instruction = await buildWithdrawIntoMixerPoolSolInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSigner: arciumSignerPublicKey,
 *   },
 *   {
 *     withdrawalAmountCiphertext: encryptedAmount,
 *     withdrawalAmountBlindingFactor: blindingFactor,
 *     withdrawalAmountNonce: encryptionNonce,
 *     withdrawalAmountCommitment: commitmentHash,
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *     time: { year: 2024, month: 1, day: 1, hour: 12, minute: 0, second: 0 },
 *     linkerHash: linkerAddressHash,
 *     depositCommitment: originalDepositCommitment,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildWithdrawIntoMixerPoolSolInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSigner: SolanaAddress;
        },
        txArgs: {
                withdrawalAmountCiphertext: RescueCiphertext;
                withdrawalAmountBlindingFactor: RescueCiphertext;
                withdrawalAmountNonce: ArciumX25519Nonce;
                withdrawalAmountCommitment: Sha3Hash;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
                time: Time;
                linkerHash: PoseidonHash;
                depositCommitment: PoseidonHash;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(21) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const commissionFeesAccountOffset = generateRandomArciumCommissionFeesAccountOffset(
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
                const commissionFeesPoolAccount = getArciumCommissionFeesPoolPda(
                        WSOL_MINT_ADDRESS as MintAddress,
                        INSTRUCTION_SEED,
                        commissionFeesAccountOffset
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
                } = getArciumAccounts(computationOffset, 'withdrawIntoMixerPoolSol');
                const ixBuilder = program.methods
                        .withdrawIntoMixerPoolSol(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(commissionFeesAccountOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.withdrawalAmountCiphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.withdrawalAmountBlindingFactor
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.withdrawalAmountNonce
                                ),
                                convertSha3HashToTransactionInput(
                                        txArgs.withdrawalAmountCommitment
                                ),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC),
                                convertTimeToTransactionInput(txArgs.time),
                                convertPoseidonHashToTransactionInput(txArgs.linkerHash),
                                convertPoseidonHashToTransactionInput(txArgs.depositCommitment),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: commissionFeesPoolAccount,
                                feesConfiguration: feesConfigurationAccount,
                                computationAccount: computationAccount,
                                compDefAccount: compDefAccount,
                                clusterAccount: clusterAccount,
                                mxeAccount: mxeAccount,
                                mempoolAccount: mempoolAccount,
                                executingPool: executingPool,
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
                        `Failed to build withdraw into mixer pool SOL instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for withdrawing SPL tokens from an encrypted account into the mixer pool.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `arciumSigner`: The Arcium signer account used for MXE operations
 *   - `mint`: The mint address of the SPL token being withdrawn
 * @param txArgs - The transaction arguments (same structure as SOL withdrawal):
 *   - `withdrawalAmountCiphertext`: The encrypted withdrawal amount (Rescue ciphertext)
 *   - `withdrawalAmountBlindingFactor`: The blinding factor used in the encryption
 *   - `withdrawalAmountNonce`: The X25519 nonce used for encryption
 *   - `withdrawalAmountCommitment`: The SHA3 commitment hash of the withdrawal amount
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 *   - `time`: The timestamp components for transaction linking
 *   - `linkerHash`: The Poseidon hash of the linker address for compliance
 *   - `depositCommitment`: The Poseidon hash of the original deposit commitment
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction withdraws SPL tokens from an encrypted account and deposits them into
 * the mixer pool. The withdrawal is processed within the Arcium Multi-Execution Environment using
 * zero-knowledge proofs to ensure privacy while verifying the withdrawal is valid.
 *
 * **Withdrawal Process:**
 * Withdrawals from encrypted accounts into the mixer pool:
 * - Verify the withdrawal amount using zero-knowledge proofs
 * - Check the deposit commitment exists in the Merkle tree
 * - Verify the nullifier hasn't been used (prevents double-spending)
 * - Transfer the withdrawn amount to the mixer pool
 * - Register the nullifier to prevent future withdrawals of the same deposit
 *
 * **Privacy Features:**
 * - Withdrawal amount is encrypted using Rescue cipher
 * - Zero-knowledge proofs verify withdrawal validity without revealing details
 * - Deposit commitment verification maintains privacy
 * - Linker hash enables compliance while preserving anonymity
 * - Nullifier prevents double-spending without revealing deposit identity
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'withdrawIntoMixerPoolSpl'
 *
 * **SPL Token Support:**
 * This function supports all SPL tokens (USDC, USDT, etc.). Each token mint has its own
 * mixer pool. For SOL withdrawals, use `buildWithdrawIntoMixerPoolSolInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless withdrawals.
 *
 * **Time Components:**
 * The time parameter is used for transaction linking and uniqueness, enabling compliance
 * features while maintaining privacy.
 *
 * @example
 * ```typescript
 * const instruction = await buildWithdrawIntoMixerPoolSplInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     arciumSigner: arciumSignerPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     withdrawalAmountCiphertext: encryptedAmount,
 *     withdrawalAmountBlindingFactor: blindingFactor,
 *     withdrawalAmountNonce: encryptionNonce,
 *     withdrawalAmountCommitment: commitmentHash,
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *     time: { year: 2024, month: 1, day: 1, hour: 12, minute: 0, second: 0 },
 *     linkerHash: linkerAddressHash,
 *     depositCommitment: originalDepositCommitment,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildWithdrawIntoMixerPoolSplInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                arciumSigner: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                withdrawalAmountCiphertext: RescueCiphertext;
                withdrawalAmountBlindingFactor: RescueCiphertext;
                withdrawalAmountNonce: ArciumX25519Nonce;
                withdrawalAmountCommitment: Sha3Hash;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
                time: Time;
                linkerHash: PoseidonHash;
                depositCommitment: PoseidonHash;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(22) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const relayerFeesPoolOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint as MintAddress
                );
                const commissionFeesAccountOffset = generateRandomArciumCommissionFeesAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint as MintAddress
                );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint as MintAddress
                );
                const relayerFeesPoolAccount = getRelayerFeesPoolPda(
                        txAccounts.relayer,
                        INSTRUCTION_SEED,
                        txAccounts.mint as MintAddress,
                        relayerFeesPoolOffset
                );
                const commissionFeesPoolAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint as MintAddress,
                        INSTRUCTION_SEED,
                        commissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint as MintAddress,
                        feesConfigurationAccountOffset
                );
                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'withdrawIntoMixerPoolSpl');
                const ixBuilder = program.methods
                        .withdrawIntoMixerPoolSpl(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(relayerFeesPoolOffset),
                                convertAccountOffsetToTransactionInput(commissionFeesAccountOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.withdrawalAmountCiphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.withdrawalAmountBlindingFactor
                                ),
                                convertArciumX25519NonceToTransactionInput(
                                        txArgs.withdrawalAmountNonce
                                ),
                                convertSha3HashToTransactionInput(
                                        txArgs.withdrawalAmountCommitment
                                ),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC),
                                convertTimeToTransactionInput(txArgs.time),
                                convertPoseidonHashToTransactionInput(txArgs.linkerHash),
                                convertPoseidonHashToTransactionInput(txArgs.depositCommitment),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                relayerFeesPool: relayerFeesPoolAccount,
                                commissionFeesPool: commissionFeesPoolAccount,
                                feesConfiguration: feesConfigurationAccount,
                                computationAccount: computationAccount,
                                compDefAccount: compDefAccount,
                                clusterAccount: clusterAccount,
                                mxeAccount: mxeAccount,
                                mempoolAccount: mempoolAccount,
                                executingPool: executingPool,
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
                        `Failed to build withdraw into mixer pool SPL instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for withdrawing tokens from the mixer pool into an MXE (Multi-Execution Environment) account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `destinationAddress`: The destination address where the withdrawn tokens will be sent (MXE account)
 *   - `mint`: The mint address of the token being withdrawn
 * @param txArgs - The transaction arguments:
 *   - `expectednullifierHash`: The Poseidon hash of the nullifier to prevent double-spending
 *   - `expectedMerkleRoot`: The expected Merkle root of the commitment tree
 *   - `expectedLinkerAddressHash`: The expected Poseidon hash of the linker address
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 *   - `ephemeralArcisPublicKey`: The ephemeral X25519 public key for encryption
 *   - `nonce`: The X25519 nonce used for encryption
 *   - `note_creator_address_part1_ciphertext`: The first part of the encrypted note creator address
 *   - `note_creator_address_part2_ciphertext`: The second part of the encrypted note creator address
 *   - `blinding_factor_ciphertext`: The encrypted blinding factor
 *   - `note_creator_address_commitment`: The SHA3 commitment hash of the note creator address
 *   - `amount_to_withdraw`: The amount of tokens to withdraw
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction withdraws tokens from the mixer pool and sends them to an MXE account. The withdrawal
 * is processed within the Arcium Multi-Execution Environment using zero-knowledge proofs to ensure privacy
 * while verifying the withdrawal is valid and the nullifier hasn't been used.
 *
 * **Mixer Pool Withdrawals:**
 * Withdrawals from the mixer pool:
 * - Verify the withdrawal amount using zero-knowledge proofs
 * - Check the deposit commitment exists in the Merkle tree
 * - Verify the nullifier hasn't been used (prevents double-spending)
 * - Transfer the withdrawn amount to the destination MXE account
 * - Register the nullifier to prevent future withdrawals of the same deposit
 *
 * **Privacy Features:**
 * - Withdrawal amount and note creator address are encrypted using Rescue cipher
 * - Zero-knowledge proofs verify withdrawal validity without revealing details
 * - Merkle tree root verification maintains privacy
 * - Linker hash enables compliance while preserving anonymity
 * - Nullifier prevents double-spending without revealing deposit identity
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'withdrawFromMixerMxe'
 *
 * **MXE Account:**
 * The destination address must be an MXE account. MXE accounts are private accounts accessible
 * only by the owner. For shared account withdrawals, use `buildWithdrawFromMixerSharedInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless withdrawals.
 *
 * @example
 * ```typescript
 * const instruction = await buildWithdrawFromMixerMxeInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     destinationAddress: mxeAccountPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     expectednullifierHash: nullifierHash,
 *     expectedMerkleRoot: merkleRoot,
 *     expectedLinkerAddressHash: linkerHash,
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *     ephemeralArcisPublicKey: ephemeralPublicKey,
 *     nonce: encryptionNonce,
 *     note_creator_address_part1_ciphertext: encryptedAddressPart1,
 *     note_creator_address_part2_ciphertext: encryptedAddressPart2,
 *     blinding_factor_ciphertext: encryptedBlindingFactor,
 *     note_creator_address_commitment: commitmentHash,
 *     amount_to_withdraw: BigInt(1000000),
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildWithdrawFromMixerMxeInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                destinationAddress: SolanaAddress;
                mint: MintAddress;
                ephemeralPublicKey: SolanaAddress;
        },
        txArgs: {
                expectednullifierHash: PoseidonHash;
                expectedMerkleRoot: PoseidonHash;
                expectedLinkerAddressHash: PoseidonHash;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
                ephemeralArcisPublicKey: ArciumX25519PublicKey;
                nonce: ArciumX25519Nonce;
                noteRecipientAddressPart1Ciphertext: RescueCiphertext;
                noteRecipientAddressPart2Ciphertext: RescueCiphertext;
                noteRecipientBlindingFactorCiphertext: RescueCiphertext;
                noteRecipientAddressCommitment: Sha3Hash;
                amountToWithdraw: Amount;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(23) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const publicCommissionFeesAccountOffset =
                        generateRandomPublicCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                txAccounts.mint as MintAddress
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint as MintAddress
                );
                const publicCommissionFeesAccount = getPublicCommissionFeesPoolPda(
                        txAccounts.mint as MintAddress,
                        INSTRUCTION_SEED,
                        publicCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint as MintAddress,
                        feesConfigurationAccountOffset
                );
                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'withdrawFromMixerMxe');
                const ixBuilder = program.methods
                        .withdrawFromMixerMxe(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(
                                        publicCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertPoseidonHashToTransactionInput(txArgs.expectednullifierHash),
                                convertPoseidonHashToTransactionInput(txArgs.expectedMerkleRoot),
                                convertPoseidonHashToTransactionInput(
                                        txArgs.expectedLinkerAddressHash
                                ),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC),
                                convertArciumX25519PublicKeyToTransactionInput(
                                        txArgs.ephemeralArcisPublicKey
                                ),
                                convertArciumX25519NonceToTransactionInput(txArgs.nonce),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.noteRecipientAddressPart1Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.noteRecipientAddressPart2Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.noteRecipientBlindingFactorCiphertext
                                ),
                                convertSha3HashToTransactionInput(
                                        txArgs.noteRecipientAddressCommitment
                                ),
                                convertAmountToTransactionInput(txArgs.amountToWithdraw),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                publicCommissionFeesPool: publicCommissionFeesAccount,
                                feesConfiguration: feesConfigurationAccount,
                                computationAccount: computationAccount,
                                compDefAccount: compDefAccount,
                                clusterAccount: clusterAccount,
                                mxeAccount: mxeAccount,
                                mempoolAccount: mempoolAccount,
                                executingPool: executingPool,
                                destinationAddress: txAccounts.destinationAddress,
                                ephemeralSigner: txAccounts.ephemeralPublicKey,
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
                        `Failed to build withdraw from mixer MXE instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for withdrawing tokens from the mixer pool into a shared account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `destinationAddress`: The destination address where the withdrawn tokens will be sent (shared account)
 *   - `mint`: The mint address of the token being withdrawn
 * @param txArgs - The transaction arguments (same structure as MXE withdrawal):
 *   - `expectednullifierHash`: The Poseidon hash of the nullifier to prevent double-spending
 *   - `expectedMerkleRoot`: The expected Merkle root of the commitment tree
 *   - `expectedLinkerAddressHash`: The expected Poseidon hash of the linker address
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 *   - `ephemeralArcisPublicKey`: The ephemeral X25519 public key for encryption
 *   - `nonce`: The X25519 nonce used for encryption
 *   - `note_creator_address_part1_ciphertext`: The first part of the encrypted note creator address
 *   - `note_creator_address_part2_ciphertext`: The second part of the encrypted note creator address
 *   - `blinding_factor_ciphertext`: The encrypted blinding factor
 *   - `note_creator_address_commitment`: The SHA3 commitment hash of the note creator address
 *   - `amount_to_withdraw`: The amount of tokens to withdraw
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction withdraws tokens from the mixer pool and sends them to a shared account. Shared accounts
 * enable multi-party access to encrypted data using X25519 key exchange, unlike MXE accounts which are
 * private to a single user. The withdrawal is processed within the Arcium Multi-Execution Environment using
 * zero-knowledge proofs to ensure privacy.
 *
 * **Mixer Pool Withdrawals:**
 * Withdrawals from the mixer pool:
 * - Verify the withdrawal amount using zero-knowledge proofs
 * - Check the deposit commitment exists in the Merkle tree
 * - Verify the nullifier hasn't been used (prevents double-spending)
 * - Transfer the withdrawn amount to the destination shared account
 * - Register the nullifier to prevent future withdrawals of the same deposit
 *
 * **Privacy Features:**
 * - Withdrawal amount and note creator address are encrypted using Rescue cipher
 * - Zero-knowledge proofs verify withdrawal validity without revealing details
 * - Merkle tree root verification maintains privacy
 * - Linker hash enables compliance while preserving anonymity
 * - Nullifier prevents double-spending without revealing deposit identity
 * - X25519 encryption enables shared access while maintaining privacy
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'withdrawFromMixerShared'
 *
 * **Shared vs MXE Accounts:**
 * - **MXE Accounts**: Private accounts accessible only by the owner (`buildWithdrawFromMixerMxeInstruction`)
 * - **Shared Accounts**: Multi-party accounts accessible by authorized parties (this function)
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless withdrawals.
 *
 * @example
 * ```typescript
 * const instruction = await buildWithdrawFromMixerSharedInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     destinationAddress: sharedAccountPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     expectednullifierHash: nullifierHash,
 *     expectedMerkleRoot: merkleRoot,
 *     expectedLinkerAddressHash: linkerHash,
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *     ephemeralArcisPublicKey: ephemeralPublicKey,
 *     nonce: encryptionNonce,
 *     note_creator_address_part1_ciphertext: encryptedAddressPart1,
 *     note_creator_address_part2_ciphertext: encryptedAddressPart2,
 *     blinding_factor_ciphertext: encryptedBlindingFactor,
 *     note_creator_address_commitment: commitmentHash,
 *     amount_to_withdraw: BigInt(1000000),
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildWithdrawFromMixerSharedInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                destinationAddress: SolanaAddress;
                mint: MintAddress;
                ephemeralPublicKey: SolanaAddress;
        },
        txArgs: {
                expectednullifierHash: PoseidonHash;
                expectedMerkleRoot: PoseidonHash;
                expectedLinkerAddressHash: PoseidonHash;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
                ephemeralArcisPublicKey: ArciumX25519PublicKey;
                nonce: ArciumX25519Nonce;
                note_creator_address_part1_ciphertext: RescueCiphertext;
                note_creator_address_part2_ciphertext: RescueCiphertext;
                blinding_factor_ciphertext: RescueCiphertext;
                note_creator_address_commitment: Sha3Hash;
                amount_to_withdraw: Amount;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(24) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const publicCommissionFeesAccountOffset =
                        generateRandomPublicCommissionFeesAccountOffset(
                                INSTRUCTION_SEED,
                                txAccounts.mint as MintAddress
                        );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint as MintAddress
                );
                const publicCommissionFeesAccount = getPublicCommissionFeesPoolPda(
                        txAccounts.mint as MintAddress,
                        INSTRUCTION_SEED,
                        publicCommissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint as MintAddress,
                        feesConfigurationAccountOffset
                );
                const {
                        computationAccount,
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'withdrawFromMixerShared');
                const ixBuilder = program.methods
                        .withdrawFromMixerShared(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(
                                        publicCommissionFeesAccountOffset
                                ),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertPoseidonHashToTransactionInput(txArgs.expectednullifierHash),
                                convertPoseidonHashToTransactionInput(txArgs.expectedMerkleRoot),
                                convertPoseidonHashToTransactionInput(
                                        txArgs.expectedLinkerAddressHash
                                ),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC),
                                convertArciumX25519PublicKeyToTransactionInput(
                                        txArgs.ephemeralArcisPublicKey
                                ),
                                convertArciumX25519NonceToTransactionInput(txArgs.nonce),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.note_creator_address_part1_ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.note_creator_address_part2_ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.blinding_factor_ciphertext
                                ),
                                convertSha3HashToTransactionInput(
                                        txArgs.note_creator_address_commitment
                                ),
                                convertAmountToTransactionInput(txArgs.amount_to_withdraw),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                publicCommissionFeesPool: publicCommissionFeesAccount,
                                feesConfiguration: feesConfigurationAccount,
                                computationAccount: computationAccount,
                                compDefAccount: compDefAccount,
                                clusterAccount: clusterAccount,
                                mxeAccount: mxeAccount,
                                mempoolAccount: mempoolAccount,
                                executingPool: executingPool,
                                destinationAddress: txAccounts.destinationAddress,
                                ephemeralSigner: txAccounts.ephemeralPublicKey,
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
                        `Failed to build withdraw from mixer shared instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
