import { WSOL_MINT_ADDRESS } from '@/constants/anchor';
import { program } from '@/idl';
import {
        ArciumX25519Nonce,
        ArciumX25519PublicKey,
        PoseidonHash,
        SolanaAddress,
        RescueCiphertext,
        Sha3Hash,
        Groth16ProofABeBytes,
        Groth16ProofBBeBytes,
        Groth16ProofCBeBytes,
        convertRescueCiphertextToTransactionInput,
        convertPoseidonHashToTransactionInput,
        convertGroth16ProofCBeBytesToTransactionInput,
        convertAccountOffsetToTransactionInput,
        convertSha3HashToTransactionInput,
        convertGroth16ProofABeBytesToTransactionInput,
        convertGroth16ProofBBeBytesToTransactionInput,
        convertArciumX25519NonceToTransactionInput,
        convertArciumX25519PublicKeyToTransactionInput,
        convertComputationOffsetToTransactionInput,
        MintAddress,
        AccountOffset,
        Amount,
        convertAmountToTransactionInput,
        convertTimeToTransactionInput,
        Time,
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
        getNullifierHashPda,
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
 * Builds a transaction instruction for creating a new token deposit into an MXE (Multi-Execution Environment) account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `destinationAddress`: The destination address where the encrypted token account will receive the deposit
 *   - `mint`: The mint address of the token being deposited
 * @param txArgs - The transaction arguments:
 *   - `expectedNullifierHash`: The Poseidon hash of the nullifier to prevent double-spending
 *   - `ephemeralArcisPublicKey`: The ephemeral X25519 public key for encryption
 *   - `nonce`: The X25519 nonce used for encryption
 *   - `depositAmountCiphertext`: The encrypted deposit amount (Rescue ciphertext)
 *   - `depositorAddressPart1Ciphertext`: The first part of the encrypted depositor address
 *   - `depositorAddressPart2Ciphertext`: The second part of the encrypted depositor address
 *   - `blindingFactor`: The blinding factor used in the encryption
 *   - `commitment`: The SHA3 commitment hash of the deposit
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 *   - `expectedMerkleRoot`: The expected Merkle root of the commitment tree
 *   - `expectedLinkerAddressHash`: The expected Poseidon hash of the linker address
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction creates a new token deposit into an MXE account. This is used when the destination
 * address does not yet have an encrypted token account for the specified mint. The deposit is processed
 * within the Arcium Multi-Execution Environment using zero-knowledge proofs to ensure privacy.
 *
 * **New vs Existing Deposits:**
 * - **New Deposit**: Creates a new encrypted token account if one doesn't exist (this function)
 * - **Existing Deposit**: Adds to an existing encrypted token account (`buildExistingTokenDepositMxeInstruction`)
 *
 * **Privacy Features:**
 * - All sensitive data (amount, depositor address) is encrypted using Rescue cipher
 * - Zero-knowledge proofs verify deposit validity without revealing details
 * - Nullifier hash prevents double-spending
 * - Merkle tree commitments maintain privacy
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'new_token_deposit_mxe'
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless deposits.
 *
 * @example
 * ```typescript
 * const instruction = await buildNewTokenDepositMxeInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     destinationAddress: userPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     expectedNullifierHash: nullifierHash,
 *     ephemeralArcisPublicKey: ephemeralPublicKey,
 *     nonce: encryptionNonce,
 *     depositAmountCiphertext: encryptedAmount,
 *     depositorAddressPart1Ciphertext: encryptedAddressPart1,
 *     depositorAddressPart2Ciphertext: encryptedAddressPart2,
 *     blindingFactor: blindingFactor,
 *     commitment: commitmentHash,
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *     expectedMerkleRoot: merkleRoot,
 *     expectedLinkerAddressHash: linkerHash,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildNewTokenDepositMxeInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                destinationAddress: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                expectedNullifierHash: PoseidonHash;
                ephemeralArcisPublicKey: ArciumX25519PublicKey;
                nonce: ArciumX25519Nonce;
                depositAmountCiphertext: RescueCiphertext;
                depositorAddressPart1Ciphertext: RescueCiphertext;
                depositorAddressPart2Ciphertext: RescueCiphertext;
                blindingFactor: RescueCiphertext;
                commitment: Sha3Hash;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
                expectedMerkleRoot: PoseidonHash;
                expectedLinkerAddressHash: PoseidonHash;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(7) as AccountOffset;

                const computationOffset = generateRandomComputationOffset();
                const commissionFeesAccountOffset = generateRandomArciumCommissionFeesAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );

                const commissionFeePoolAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        INSTRUCTION_SEED,
                        commissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        feesConfigurationAccountOffset
                );
                const nullifierHashAccount = getNullifierHashPda(txArgs.expectedNullifierHash);

                const {
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'new_token_deposit_mxe');

                const ixBuilder = program.methods
                        .newTokenDepositMxe(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(commissionFeesAccountOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertPoseidonHashToTransactionInput(txArgs.expectedNullifierHash),
                                convertArciumX25519PublicKeyToTransactionInput(
                                        txArgs.ephemeralArcisPublicKey
                                ),
                                convertArciumX25519NonceToTransactionInput(txArgs.nonce),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositAmountCiphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositorAddressPart1Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositorAddressPart2Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(txArgs.blindingFactor),
                                convertSha3HashToTransactionInput(txArgs.commitment),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC),
                                convertPoseidonHashToTransactionInput(txArgs.expectedMerkleRoot),
                                convertPoseidonHashToTransactionInput(
                                        txArgs.expectedLinkerAddressHash
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                accountAddress: txAccounts.destinationAddress,
                                mint: txAccounts.mint,
                                commissionFeePool: commissionFeePoolAccount,
                                feesConfiguration: feesConfigurationAccount,
                                nullifierHashAccount: nullifierHashAccount,
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
                        `Failed to build new token deposit MXE instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for depositing tokens into an existing MXE (Multi-Execution Environment) account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `destinationAddress`: The destination address of the existing encrypted token account
 *   - `mint`: The mint address of the token being deposited
 * @param txArgs - The transaction arguments (same as `buildNewTokenDepositMxeInstruction`):
 *   - `expectedNullifierHash`: The Poseidon hash of the nullifier to prevent double-spending
 *   - `ephemeralArcisPublicKey`: The ephemeral X25519 public key for encryption
 *   - `nonce`: The X25519 nonce used for encryption
 *   - `depositAmountCiphertext`: The encrypted deposit amount (Rescue ciphertext)
 *   - `depositorAddressPart1Ciphertext`: The first part of the encrypted depositor address
 *   - `depositorAddressPart2Ciphertext`: The second part of the encrypted depositor address
 *   - `blindingFactor`: The blinding factor used in the encryption
 *   - `commitment`: The SHA3 commitment hash of the deposit
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 *   - `expectedMerkleRoot`: The expected Merkle root of the commitment tree
 *   - `expectedLinkerAddressHash`: The expected Poseidon hash of the linker address
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction deposits tokens into an existing MXE account. This is used when the destination
 * address already has an encrypted token account for the specified mint. The deposit is processed
 * within the Arcium Multi-Execution Environment using zero-knowledge proofs to ensure privacy.
 *
 * **New vs Existing Deposits:**
 * - **New Deposit**: Creates a new encrypted token account if one doesn't exist (`buildNewTokenDepositMxeInstruction`)
 * - **Existing Deposit**: Adds to an existing encrypted token account (this function)
 *
 * **Privacy Features:**
 * - All sensitive data (amount, depositor address) is encrypted using Rescue cipher
 * - Zero-knowledge proofs verify deposit validity without revealing details
 * - Nullifier hash prevents double-spending
 * - Merkle tree commitments maintain privacy
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'existing_token_deposit_mxe'
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless deposits.
 *
 * @example
 * ```typescript
 * const instruction = await buildExistingTokenDepositMxeInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     destinationAddress: userPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     expectedNullifierHash: nullifierHash,
 *     ephemeralArcisPublicKey: ephemeralPublicKey,
 *     nonce: encryptionNonce,
 *     depositAmountCiphertext: encryptedAmount,
 *     depositorAddressPart1Ciphertext: encryptedAddressPart1,
 *     depositorAddressPart2Ciphertext: encryptedAddressPart2,
 *     blindingFactor: blindingFactor,
 *     commitment: commitmentHash,
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *     expectedMerkleRoot: merkleRoot,
 *     expectedLinkerAddressHash: linkerHash,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildExistingTokenDepositMxeInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                destinationAddress: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                expectedNullifierHash: PoseidonHash;
                ephemeralArcisPublicKey: ArciumX25519PublicKey;
                nonce: ArciumX25519Nonce;
                depositAmountCiphertext: RescueCiphertext;
                depositorAddressPart1Ciphertext: RescueCiphertext;
                depositorAddressPart2Ciphertext: RescueCiphertext;
                blindingFactor: RescueCiphertext;
                commitment: Sha3Hash;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
                expectedMerkleRoot: PoseidonHash;
                expectedLinkerAddressHash: PoseidonHash;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(8) as AccountOffset;
                const computationOffset = generateRandomComputationOffset();
                const commissionFeesAccountOffset = generateRandomArciumCommissionFeesAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const commissionFeePoolAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        INSTRUCTION_SEED,
                        commissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        feesConfigurationAccountOffset
                );
                const nullifierHashAccount = getNullifierHashPda(txArgs.expectedNullifierHash);

                const {
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'existing_token_deposit_mxe');

                const ixBuilder = program.methods
                        .existingTokenDepositMxe(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(commissionFeesAccountOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertPoseidonHashToTransactionInput(txArgs.expectedNullifierHash),
                                convertArciumX25519PublicKeyToTransactionInput(
                                        txArgs.ephemeralArcisPublicKey
                                ),
                                convertArciumX25519NonceToTransactionInput(txArgs.nonce),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositAmountCiphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositorAddressPart1Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositorAddressPart2Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(txArgs.blindingFactor),
                                convertSha3HashToTransactionInput(txArgs.commitment),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC),
                                convertPoseidonHashToTransactionInput(txArgs.expectedMerkleRoot),
                                convertPoseidonHashToTransactionInput(
                                        txArgs.expectedLinkerAddressHash
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                accountAddress: txAccounts.destinationAddress,
                                mint: txAccounts.mint,
                                commissionFeePool: commissionFeePoolAccount,
                                feesConfiguration: feesConfigurationAccount,
                                nullifierHashAccount: nullifierHashAccount,
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
                        `Failed to build existing token deposit MXE instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for creating a new token deposit into a shared account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `destinationAddress`: The destination address where the shared token account will receive the deposit
 *   - `mint`: The mint address of the token being deposited
 * @param txArgs - The transaction arguments (same structure as MXE deposits):
 *   - `expectedNullifierHash`: The Poseidon hash of the nullifier to prevent double-spending
 *   - `ephemeralArcisPublicKey`: The ephemeral X25519 public key for encryption
 *   - `nonce`: The X25519 nonce used for encryption
 *   - `depositAmountCiphertext`: The encrypted deposit amount (Rescue ciphertext)
 *   - `depositorAddressPart1Ciphertext`: The first part of the encrypted depositor address
 *   - `depositorAddressPart2Ciphertext`: The second part of the encrypted depositor address
 *   - `blindingFactor`: The blinding factor used in the encryption
 *   - `commitment`: The SHA3 commitment hash of the deposit
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 *   - `expectedMerkleRoot`: The expected Merkle root of the commitment tree
 *   - `expectedLinkerAddressHash`: The expected Poseidon hash of the linker address
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction creates a new token deposit into a shared account. Shared accounts enable
 * multi-party access to encrypted data using X25519 key exchange, unlike MXE accounts which are
 * private to a single user.
 *
 * **Shared vs MXE Accounts:**
 * - **MXE Accounts**: Private accounts accessible only by the owner (`buildNewTokenDepositMxeInstruction`)
 * - **Shared Accounts**: Multi-party accounts accessible by authorized parties (this function)
 *
 * **Privacy Features:**
 * - All sensitive data (amount, depositor address) is encrypted using Rescue cipher
 * - Zero-knowledge proofs verify deposit validity without revealing details
 * - Nullifier hash prevents double-spending
 * - Merkle tree commitments maintain privacy
 * - X25519 key exchange enables shared access
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'new_token_deposit_shared'
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless deposits.
 *
 * @example
 * ```typescript
 * const instruction = await buildNewTokenDepositSharedInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     destinationAddress: sharedAccountPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     expectedNullifierHash: nullifierHash,
 *     ephemeralArcisPublicKey: ephemeralPublicKey,
 *     nonce: encryptionNonce,
 *     depositAmountCiphertext: encryptedAmount,
 *     depositorAddressPart1Ciphertext: encryptedAddressPart1,
 *     depositorAddressPart2Ciphertext: encryptedAddressPart2,
 *     blindingFactor: blindingFactor,
 *     commitment: commitmentHash,
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *     expectedMerkleRoot: merkleRoot,
 *     expectedLinkerAddressHash: linkerHash,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildNewTokenDepositSharedInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                destinationAddress: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                expectedNullifierHash: PoseidonHash;
                ephemeralArcisPublicKey: ArciumX25519PublicKey;
                nonce: ArciumX25519Nonce;
                depositAmountCiphertext: RescueCiphertext;
                depositorAddressPart1Ciphertext: RescueCiphertext;
                depositorAddressPart2Ciphertext: RescueCiphertext;
                blindingFactor: RescueCiphertext;
                commitment: Sha3Hash;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
                expectedMerkleRoot: PoseidonHash;
                expectedLinkerAddressHash: PoseidonHash;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(9) as AccountOffset;
                const computationOffset = generateRandomComputationOffset();
                const commissionFeesAccountOffset = generateRandomArciumCommissionFeesAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const commissionFeePoolAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        INSTRUCTION_SEED,
                        commissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        feesConfigurationAccountOffset
                );
                const nullifierHashAccount = getNullifierHashPda(txArgs.expectedNullifierHash);

                const {
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'new_token_deposit_shared');

                const ixBuilder = program.methods
                        .newTokenDepositShared(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(commissionFeesAccountOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertPoseidonHashToTransactionInput(txArgs.expectedNullifierHash),
                                convertArciumX25519PublicKeyToTransactionInput(
                                        txArgs.ephemeralArcisPublicKey
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositAmountCiphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositorAddressPart1Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositorAddressPart2Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(txArgs.blindingFactor),
                                convertArciumX25519NonceToTransactionInput(txArgs.nonce),
                                convertSha3HashToTransactionInput(txArgs.commitment),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC),
                                convertPoseidonHashToTransactionInput(txArgs.expectedMerkleRoot),
                                convertPoseidonHashToTransactionInput(
                                        txArgs.expectedLinkerAddressHash
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                accountAddress: txAccounts.destinationAddress,
                                mint: txAccounts.mint,
                                commissionFeePool: commissionFeePoolAccount,
                                feesConfiguration: feesConfigurationAccount,
                                nullifierHashAccount: nullifierHashAccount,
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
                        `Failed to build new token deposit shared instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for depositing tokens into an existing shared account.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 *   - `destinationAddress`: The destination address of the existing shared token account
 *   - `mint`: The mint address of the token being deposited
 * @param txArgs - The transaction arguments (same structure as other deposit functions):
 *   - `expectedNullifierHash`: The Poseidon hash of the nullifier to prevent double-spending
 *   - `ephemeralArcisPublicKey`: The ephemeral X25519 public key for encryption
 *   - `nonce`: The X25519 nonce used for encryption
 *   - `depositAmountCiphertext`: The encrypted deposit amount (Rescue ciphertext)
 *   - `depositorAddressPart1Ciphertext`: The first part of the encrypted depositor address
 *   - `depositorAddressPart2Ciphertext`: The second part of the encrypted depositor address
 *   - `blindingFactor`: The blinding factor used in the encryption
 *   - `commitment`: The SHA3 commitment hash of the deposit
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 *   - `expectedMerkleRoot`: The expected Merkle root of the commitment tree
 *   - `expectedLinkerAddressHash`: The expected Poseidon hash of the linker address
 *   - `optionalData`: Optional SHA3 hash for additional data
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction deposits tokens into an existing shared account. Shared accounts enable
 * multi-party access to encrypted data using X25519 key exchange, unlike MXE accounts which are
 * private to a single user.
 *
 * **New vs Existing Deposits:**
 * - **New Deposit**: Creates a new shared token account if one doesn't exist (`buildNewTokenDepositSharedInstruction`)
 * - **Existing Deposit**: Adds to an existing shared token account (this function)
 *
 * **Privacy Features:**
 * - All sensitive data (amount, depositor address) is encrypted using Rescue cipher
 * - Zero-knowledge proofs verify deposit validity without revealing details
 * - Nullifier hash prevents double-spending
 * - Merkle tree commitments maintain privacy
 * - X25519 key exchange enables shared access
 *
 * **MXE Integration:**
 * This instruction is executed within the Arcium Multi-Execution Environment, requiring:
 * - A random computation offset for the MXE computation
 * - All Arcium accounts (computation, compDef, cluster, MXE, mempool, executing pool)
 * - The computation definition for 'existing_token_deposit_shared'
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless deposits.
 *
 * @example
 * ```typescript
 * const instruction = await buildExistingTokenDepositSharedInstruction(
 *   {
 *     relayer: relayerPublicKey,
 *     destinationAddress: sharedAccountPublicKey,
 *     mint: tokenMintAddress,
 *   },
 *   {
 *     expectedNullifierHash: nullifierHash,
 *     ephemeralArcisPublicKey: ephemeralPublicKey,
 *     nonce: encryptionNonce,
 *     depositAmountCiphertext: encryptedAmount,
 *     depositorAddressPart1Ciphertext: encryptedAddressPart1,
 *     depositorAddressPart2Ciphertext: encryptedAddressPart2,
 *     blindingFactor: blindingFactor,
 *     commitment: commitmentHash,
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *     expectedMerkleRoot: merkleRoot,
 *     expectedLinkerAddressHash: linkerHash,
 *     optionalData: optionalDataHash,
 *   }
 * );
 * ```
 */
export async function buildExistingTokenDepositSharedInstruction(
        txAccounts: {
                relayer: SolanaAddress;
                destinationAddress: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                expectedNullifierHash: PoseidonHash;
                ephemeralArcisPublicKey: ArciumX25519PublicKey;
                nonce: ArciumX25519Nonce;
                depositAmountCiphertext: RescueCiphertext;
                depositorAddressPart1Ciphertext: RescueCiphertext;
                depositorAddressPart2Ciphertext: RescueCiphertext;
                blindingFactor: RescueCiphertext;
                commitment: Sha3Hash;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
                expectedMerkleRoot: PoseidonHash;
                expectedLinkerAddressHash: PoseidonHash;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(10) as AccountOffset;
                const computationOffset = generateRandomComputationOffset();
                const commissionFeesAccountOffset = generateRandomArciumCommissionFeesAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const feesConfigurationAccountOffset = generateRandomFeesConfigurationAccountOffset(
                        INSTRUCTION_SEED,
                        txAccounts.mint
                );
                const commissionFeePoolAccount = getArciumCommissionFeesPoolPda(
                        txAccounts.mint,
                        INSTRUCTION_SEED,
                        commissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        txAccounts.mint,
                        feesConfigurationAccountOffset
                );
                const nullifierHashAccount = getNullifierHashPda(txArgs.expectedNullifierHash);

                const {
                        compDefAccount,
                        clusterAccount,
                        mxeAccount,
                        mempoolAccount,
                        executingPool,
                } = getArciumAccounts(computationOffset, 'existing_token_deposit_shared');

                const ixBuilder = program.methods
                        .existingTokenDepositShared(
                                convertComputationOffsetToTransactionInput(computationOffset),
                                convertAccountOffsetToTransactionInput(commissionFeesAccountOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertPoseidonHashToTransactionInput(txArgs.expectedNullifierHash),
                                convertArciumX25519PublicKeyToTransactionInput(
                                        txArgs.ephemeralArcisPublicKey
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositAmountCiphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositorAddressPart1Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(
                                        txArgs.depositorAddressPart2Ciphertext
                                ),
                                convertRescueCiphertextToTransactionInput(txArgs.blindingFactor),
                                convertArciumX25519NonceToTransactionInput(txArgs.nonce),
                                convertSha3HashToTransactionInput(txArgs.commitment),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC),
                                convertPoseidonHashToTransactionInput(txArgs.expectedMerkleRoot),
                                convertPoseidonHashToTransactionInput(
                                        txArgs.expectedLinkerAddressHash
                                ),
                                convertSha3HashToTransactionInput(txArgs.optionalData)
                        )
                        .accountsPartial({
                                relayer: txAccounts.relayer,
                                accountAddress: txAccounts.destinationAddress,
                                mint: txAccounts.mint,
                                commissionFeePool: commissionFeePoolAccount,
                                feesConfiguration: feesConfigurationAccount,
                                nullifierHashAccount: nullifierHashAccount,
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
                        `Failed to build existing token deposit shared instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for depositing SOL into the mixer pool.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `arciumSigner`: The Arcium signer account used for MXE operations
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 * @param txArgs - The transaction arguments:
 *   - `amount`: The amount of SOL being deposited (in lamports)
 *   - `commitmentInnerHash`: The Poseidon hash of the inner commitment
 *   - `linkerHash`: The Poseidon hash of the linker address for compliance
 *   - `time`: The timestamp components for transaction linking
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction deposits SOL (native Solana) into the mixer pool. The mixer pool is a
 * privacy-preserving pool that allows users to deposit and withdraw tokens while maintaining
 * anonymity through zero-knowledge proofs and Merkle tree commitments.
 *
 * **Mixer Pool Deposits:**
 * Deposits into the mixer pool:
 * - Create a privacy-preserving commitment in the Merkle tree
 * - Enable anonymous withdrawals later
 * - Support compliance through linker hash
 * - Use zero-knowledge proofs to verify deposit validity
 *
 * **Privacy Features:**
 * - Deposit amount is hidden through commitments
 * - Depositor identity is hidden
 * - Zero-knowledge proofs verify deposit without revealing details
 * - Merkle tree commitments maintain privacy
 * - Linker hash enables compliance while preserving privacy
 *
 * **SOL-Specific:**
 * This function is specifically for SOL deposits. It uses WSOL (Wrapped SOL) mint address
 * internally for account derivation. For SPL token deposits, use `buildDepositIntoMixerPoolSplInstruction`.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless deposits.
 *
 * **Time Components:**
 * The time parameter is used for transaction linking and uniqueness, enabling compliance
 * features while maintaining privacy.
 *
 * @example
 * ```typescript
 * const instruction = await buildDepositIntoMixerSolInstruction(
 *   {
 *     arciumSigner: arciumSignerPublicKey,
 *     relayer: relayerPublicKey,
 *   },
 *   {
 *     amount: BigInt(1000000000), // 1 SOL in lamports
 *     commitmentInnerHash: commitmentHash,
 *     linkerHash: linkerAddressHash,
 *     time: { year: 2024, month: 1, day: 1, hour: 12, minute: 0, second: 0 },
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *   }
 * );
 * ```
 */
export async function buildDepositIntoMixerSolInstruction(
        txAccounts: {
                arciumSigner: SolanaAddress;
                relayer: SolanaAddress;
        },
        txArgs: {
                amount: Amount;
                commitmentInnerHash: PoseidonHash;
                linkerHash: PoseidonHash;
                time: Time;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(19) as AccountOffset;

                const relayerOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const commissionFeesAccountOffset = generateRandomPublicCommissionFeesAccountOffset(
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
                        relayerOffset
                );
                const publicCommissionFeesPoolAccount = getPublicCommissionFeesPoolPda(
                        WSOL_MINT_ADDRESS as MintAddress,
                        INSTRUCTION_SEED,
                        commissionFeesAccountOffset
                );
                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        feesConfigurationAccountOffset
                );

                const ixBuilder = program.methods
                        .depositIntoMixerPoolSol(
                                convertAccountOffsetToTransactionInput(relayerOffset),
                                convertAccountOffsetToTransactionInput(commissionFeesAccountOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertAmountToTransactionInput(txArgs.amount),
                                convertPoseidonHashToTransactionInput(txArgs.commitmentInnerHash),
                                convertPoseidonHashToTransactionInput(txArgs.linkerHash),
                                convertTimeToTransactionInput(txArgs.time),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC)
                        )
                        .accountsPartial({
                                arciumSigner: txAccounts.arciumSigner,
                                relayer: txAccounts.relayer,
                                relayerFeesPool: relayerFeesPoolAccount,
                                publicCommissionFeesPool: publicCommissionFeesPoolAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
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
                        `Failed to build deposit into mixer pool SOL instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Builds a transaction instruction for depositing SPL tokens into the mixer pool.
 *
 * @param txAccounts - The accounts required for the transaction:
 *   - `arciumSigner`: The Arcium signer account used for MXE operations
 *   - `relayer`: The relayer account that will process the transaction and pay fees
 * @param txArgs - The transaction arguments:
 *   - `amount`: The amount of SPL tokens being deposited
 *   - `commitmentInnerHash`: The Poseidon hash of the inner commitment
 *   - `linkerHash`: The Poseidon hash of the linker address for compliance
 *   - `time`: The timestamp components for transaction linking
 *   - `groth16ProofA`, `groth16ProofB`, `groth16ProofC`: The Groth16 zero-knowledge proof components
 * @returns A promise resolving to the constructed transaction instruction
 *
 * @throws {@link InstructionBuildingError} When account derivation fails, conversion errors occur, or instruction building fails
 *
 * @remarks
 * This instruction deposits SPL tokens into the mixer pool. The mixer pool is a privacy-preserving
 * pool that allows users to deposit and withdraw tokens while maintaining anonymity through
 * zero-knowledge proofs and Merkle tree commitments.
 *
 * **Mixer Pool Deposits:**
 * Deposits into the mixer pool:
 * - Create a privacy-preserving commitment in the Merkle tree
 * - Enable anonymous withdrawals later
 * - Support compliance through linker hash
 * - Use zero-knowledge proofs to verify deposit validity
 *
 * **Privacy Features:**
 * - Deposit amount is hidden through commitments
 * - Depositor identity is hidden
 * - Zero-knowledge proofs verify deposit without revealing details
 * - Merkle tree commitments maintain privacy
 * - Linker hash enables compliance while preserving privacy
 *
 * **SPL Token Support:**
 * This function supports all SPL tokens (USDC, USDT, etc.). Each token mint has its own mixer pool.
 * The function currently uses WSOL mint address for account derivation, which may need to be
 * updated to support token-specific pools.
 *
 * **Note:** The current implementation uses `WSOL_MINT_ADDRESS` for account derivation. This
 * may need to be updated to support token-specific mixer pools in the future.
 *
 * **Relayer Support:**
 * The relayer pays transaction fees on behalf of the user, enabling gasless deposits.
 *
 * **Time Components:**
 * The time parameter is used for transaction linking and uniqueness, enabling compliance
 * features while maintaining privacy.
 *
 * @example
 * ```typescript
 * const instruction = await buildDepositIntoMixerPoolSplInstruction(
 *   {
 *     arciumSigner: arciumSignerPublicKey,
 *     relayer: relayerPublicKey,
 *   },
 *   {
 *     amount: BigInt(1000000), // 1 USDC (6 decimals)
 *     commitmentInnerHash: commitmentHash,
 *     linkerHash: linkerAddressHash,
 *     time: { year: 2024, month: 1, day: 1, hour: 12, minute: 0, second: 0 },
 *     groth16ProofA: proofA,
 *     groth16ProofB: proofB,
 *     groth16ProofC: proofC,
 *   }
 * );
 * ```
 */
export async function buildDepositIntoMixerPoolSplInstruction(
        txAccounts: {
                arciumSigner: SolanaAddress;
                relayer: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                amount: Amount;
                commitmentInnerHash: PoseidonHash;
                linkerHash: PoseidonHash;
                time: Time;
                groth16ProofA: Groth16ProofABeBytes;
                groth16ProofB: Groth16ProofBBeBytes;
                groth16ProofC: Groth16ProofCBeBytes;
        }
): Promise<TransactionInstruction> {
        try {
                const INSTRUCTION_SEED = BigInt(20) as AccountOffset;

                const relayerOffset = generateRandomRelayerFeesPoolOffset(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress
                );
                const commissionFeesAccountOffset = generateRandomPublicCommissionFeesAccountOffset(
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
                        relayerOffset
                );

                const publicCommissionFeesPoolAccount = getPublicCommissionFeesPoolPda(
                        WSOL_MINT_ADDRESS as MintAddress,
                        INSTRUCTION_SEED,
                        commissionFeesAccountOffset
                );

                const feesConfigurationAccount = getFeesConfigurationPda(
                        INSTRUCTION_SEED,
                        WSOL_MINT_ADDRESS as MintAddress,
                        feesConfigurationAccountOffset
                );

                const ixBuilder = program.methods
                        .depositIntoMixerPoolSpl(
                                convertAccountOffsetToTransactionInput(relayerOffset),
                                convertAccountOffsetToTransactionInput(commissionFeesAccountOffset),
                                convertAccountOffsetToTransactionInput(
                                        feesConfigurationAccountOffset
                                ),
                                convertAmountToTransactionInput(txArgs.amount),
                                convertPoseidonHashToTransactionInput(txArgs.commitmentInnerHash),
                                convertPoseidonHashToTransactionInput(txArgs.linkerHash),
                                convertTimeToTransactionInput(txArgs.time),
                                convertGroth16ProofABeBytesToTransactionInput(txArgs.groth16ProofA),
                                convertGroth16ProofBBeBytesToTransactionInput(txArgs.groth16ProofB),
                                convertGroth16ProofCBeBytesToTransactionInput(txArgs.groth16ProofC)
                        )
                        .accountsPartial({
                                arciumSigner: txAccounts.arciumSigner,
                                relayer: txAccounts.relayer,
                                relayerFeesPool: relayerFeesPoolAccount,
                                publicCommissionFeesPool: publicCommissionFeesPoolAccount,
                                feesConfigurationAccount: feesConfigurationAccount,
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
                        `Failed to build deposit into mixer pool SPL instruction: ${error instanceof Error ? error.message : String(error)}`,
                        error instanceof Error ? error : undefined
                );
        }
}
