import {
        Amount,
        BasisPoints,
        Day,
        Groth16ProofABeBytes,
        Groth16ProofBBeBytes,
        Groth16ProofCBeBytes,
        Hour,
        Minute,
        Month,
        PoseidonHash,
        Second,
        Sha3Hash,
        U128,
        U8,
        VersionByte,
        Year,
        ZkMerkleTreeInsertionIndex,
} from '@/types';

/**
 * Abstract base class for all zero-knowledge proof generator-related errors.
 *
 * @remarks
 * This class provides a foundation for all ZK prover errors, ensuring consistent
 * error handling and type safety across proof generator implementations. All ZK prover errors
 * should extend this class.
 *
 * @public
 */
export abstract class ZkProverError extends Error {
        /**
         * Creates a new instance of ZkProverError.
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
 * Abstract base class defining the contract for zero-knowledge proof generation.
 *
 * @remarks
 * Implementations of this class must provide cryptographic proof generation capabilities
 * for zero-knowledge operations on the Solana blockchain. All methods are asynchronous
 * to support various proof generation backends (WASM, native libraries, remote services).
 *
 * This interface supports multiple proof types including:
 * - Master viewing key registration proofs
 * - SPL token deposit proofs (with hidden and public amounts)
 * - Deposit claim proofs with Merkle tree inclusion verification
 *
 * @public
 *
 * @example
 * ```typescript
 * class WasmZkProver extends IZkProver {
 *   async generateMasterViewingKeyRegistrationProof(
 *     masterViewingKey: U128,
 *     poseidonBlindingFactor: U128,
 *     sha3BlindingFactor: U128,
 *     expectedPoseidonCommitment: PoseidonHash,
 *     expectedSha3Commitment: Sha3Hash
 *   ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]> {
 *     // Implementation using WASM circuit
 *   }
 *   // ... other methods
 * }
 * ```
 */
export abstract class IZkProver {
        /**
         * Generates a zero-knowledge proof for master viewing key registration.
         *
         * @param masterViewingKey - The master viewing key to register (128-bit unsigned integer)
         * @param poseidonBlindingFactor - Blinding factor for Poseidon hash commitment (128-bit)
         * @param sha3BlindingFactor - Blinding factor for SHA-3 hash commitment (128-bit)
         * @param expectedPoseidonCommitment - Expected Poseidon hash commitment to verify against
         * @param expectedSha3Commitment - Expected SHA-3 hash commitment to verify against
         * @returns A promise resolving to a tuple of Groth16 proof components (A, B, C) in big-endian byte format
         *
         * @throws {@link ZkProverError} When proof generation fails due to invalid inputs, circuit errors, or computation failures
         *
         * @remarks
         * This proof demonstrates knowledge of a master viewing key and its corresponding blinding factors
         * without revealing the actual key. The proof verifies that the commitments match the expected values.
         * Used for privacy-preserving key registration in the Umbra protocol.
         *
         * @example
         * ```typescript
         * const proof = await prover.generateMasterViewingKeyRegistrationProof(
         *   masterViewingKey,
         *   poseidonBlindingFactor,
         *   sha3BlindingFactor,
         *   expectedPoseidonCommitment,
         *   expectedSha3Commitment
         * );
         * const [proofA, proofB, proofC] = proof;
         * ```
         */
        public abstract generateMasterViewingKeyRegistrationProof(
                masterViewingKey: U128,
                poseidonBlindingFactor: U128,
                sha3BlindingFactor: U128,
                expectedPoseidonCommitment: PoseidonHash,
                expectedSha3Commitment: PoseidonHash
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]>;

        /**
         * Generates a zero-knowledge proof for creating an SPL token deposit with a hidden amount.
         *
         * @param masterViewingKey - Master viewing key for compliance linkage (128-bit)
         * @param poseidonBlindingFactor - Blinding factor for Poseidon commitments (128-bit)
         * @param destinationAddressLow - Low 128 bits of the destination address
         * @param destinationAddressHigh - High 128 bits of the destination address
         * @param randomSecret - Random secret for commitment privacy (128-bit)
         * @param nullifier - Nullifier secret to prevent double-spending (128-bit)
         * @param amount - Deposit amount (private, not revealed in proof)
         * @param relayerFee - Fee paid to the relayer
         * @param commissionFeeLowBound - Lower bound for commission fee
         * @param commissionFeeHighBound - Upper bound for commission fee
         * @param commissionFeeBps - Commission fee in basis points
         * @param year - Transaction year
         * @param month - Transaction month
         * @param day - Transaction day
         * @param hour - Transaction hour
         * @param minute - Transaction minute
         * @param second - Transaction second
         * @param expectedYear - Expected year for verification
         * @param expectedMonth - Expected month for verification
         * @param expectedDay - Expected day for verification
         * @param expectedHour - Expected hour for verification
         * @param expectedMinute - Expected minute for verification
         * @param expectedSecond - Expected second for verification
         * @param expectedLinkerAddressHash - Expected linker address hash commitment
         * @param expectedDepositDataHash - Expected deposit data hash commitment
         * @param expectedOnChainMvkHash - Expected on-chain master viewing key hash
         * @param expectedSha3AggregatedHash - Expected SHA-3 aggregated hash commitment
         * @param expectedRelayerFee - Expected relayer fee for verification
         * @param expectedCommissionFeeLowBound - Expected commission fee lower bound
         * @param expectedCommissionFeeHighBound - Expected commission fee upper bound
         * @param expectedCommissionFeeBps - Expected commission fee in basis points
         * @returns A promise resolving to a tuple of Groth16 proof components (A, B, C) in big-endian byte format
         *
         * @throws {@link ZkProverError} When proof generation fails due to invalid inputs, circuit errors, or computation failures
         *
         * @remarks
         * This proof creates a deposit commitment where the amount is hidden (private). The proof verifies
         * that all expected commitments match while keeping the actual deposit amount private. Used for
         * privacy-preserving token deposits in the Umbra protocol.
         *
         * @example
         * ```typescript
         * const proof = await prover.generateCreateSplDepositWithHiddenAmountProof(
         *   masterViewingKey,
         *   poseidonBlindingFactor,
         *   destinationAddressLow,
         *   destinationAddressHigh,
         *   randomSecret,
         *   nullifier,
         *   amount,
         *   relayerFee,
         *   commissionFeeLowBound,
         *   commissionFeeHighBound,
         *   commissionFeeBps,
         *   year, month, day, hour, minute, second,
         *   expectedYear, expectedMonth, expectedDay, expectedHour, expectedMinute, expectedSecond,
         *   expectedLinkerAddressHash,
         *   expectedDepositDataHash,
         *   expectedOnChainMvkHash,
         *   expectedSha3AggregatedHash,
         *   expectedRelayerFee,
         *   expectedCommissionFeeLowBound,
         *   expectedCommissionFeeHighBound,
         *   expectedCommissionFeeBps
         * );
         * ```
         */
        public abstract generateCreateSplDepositWithHiddenAmountProof(
                masterViewingKey: U128,
                poseidonBlindingFactor: U128,
                destinationAddressLow: U128,
                destinationAddressHigh: U128,
                randomSecret: U128,
                nullifier: U128,
                amount: Amount,
                relayerFee: Amount,
                commissionFeeLowBound: Amount,
                commissionFeeHighBound: Amount,
                commissionFeeBps: BasisPoints,
                commissionFeeQuotient: U128,
                commissionFeeRemainder: U128,
                year: Year,
                month: Month,
                day: Day,
                hour: Hour,
                minute: Minute,
                second: Second,
                expectedYear: Year,
                expectedMonth: Month,
                expectedDay: Day,
                expectedHour: Hour,
                expectedMinute: Minute,
                expectedSecond: Second,
                expectedLinkerAddressHash: PoseidonHash,
                expectedDepositDataHash: PoseidonHash,
                expectedOnChainMvkHash: PoseidonHash,
                expectedSha3AggregatedHash: Sha3Hash,
                expectedRelayerFee: Amount,
                expectedCommissionFeeLowBound: Amount,
                expectedCommissionFeeHighBound: Amount,
                expectedCommissionFeeBps: BasisPoints
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]>;

        /**
         * Generates a zero-knowledge proof for creating an SPL token deposit with a public amount.
         *
         * @param masterViewingKey - Master viewing key for compliance linkage (128-bit)
         * @param poseidonBlindingFactor - Blinding factor for Poseidon commitments (128-bit)
         * @param destinationAddressLow - Low 128 bits of the destination address
         * @param destinationAddressHigh - High 128 bits of the destination address
         * @param randomSecret - Random secret for commitment privacy (128-bit)
         * @param nullifier - Nullifier secret to prevent double-spending (128-bit)
         * @param commissionFeeLowerBound - Lower bound for commission fee
         * @param commissionFeeUpperBound - Upper bound for commission fee
         * @param commissionFeeBps - Commission fee in basis points
         * @param commissionFeeQuotient - Commission fee quotient
         * @param commissionFeeRemainder - Commission fee remainder
         * @param amount - Deposit amount (public, revealed in proof)
         * @param year - Transaction year
         * @param month - Transaction month
         * @param day - Transaction day
         * @param hour - Transaction hour
         * @param minute - Transaction minute
         * @param second - Transaction second
         * @param expectedAmount - Expected deposit amount for verification
         * @param expectedYear - Expected year for verification
         * @param expectedMonth - Expected month for verification
         * @param expectedDay - Expected day for verification
         * @param expectedHour - Expected hour for verification
         * @param expectedMinute - Expected minute for verification
         * @param expectedSecond - Expected second for verification
         * @param expectedLinkerAddressHash - Expected linker address hash commitment
         * @param expectedDepositDataHash - Expected deposit data hash commitment
         * @param expectedOnChainMvkHash - Expected on-chain master viewing key hash
         * @returns A promise resolving to a tuple of Groth16 proof components (A, B, C) in big-endian byte format
         *
         * @throws {@link ZkProverError} When proof generation fails due to invalid inputs, circuit errors, or computation failures
         *
         * @remarks
         * This proof creates a deposit commitment where the amount is public (revealed). The proof verifies
         * that the deposit amount matches the expected value and that all commitments are valid. Used for
         * transparent token deposits where amount visibility is required.
         *
         * @example
         * ```typescript
         * const proof = await prover.generateCreateSplDepositWithPublicAmountProof(
         *   masterViewingKey,
         *   poseidonBlindingFactor,
         *   destinationAddressLow,
         *   destinationAddressHigh,
         *   randomSecret,
         *   nullifier,
         *   amount,
         *   year, month, day, hour, minute, second,
         *   expectedAmount,
         *   expectedYear, expectedMonth, expectedDay, expectedHour, expectedMinute, expectedSecond,
         *   expectedLinkerAddressHash,
         *   expectedDepositDataHash,
         *   expectedOnChainMvkHash
         * );
         * ```
         */
        public abstract generateCreateSplDepositWithPublicAmountProof(
                masterViewingKey: U128,
                poseidonBlindingFactor: U128,
                destinationAddressLow: U128,
                destinationAddressHigh: U128,
                randomSecret: U128,
                nullifier: U128,
                amount: Amount,
                year: Year,
                month: Month,
                day: Day,
                hour: Hour,
                minute: Minute,
                second: Second,
                expectedAmount: Amount,
                expectedYear: Year,
                expectedMonth: Month,
                expectedDay: Day,
                expectedHour: Hour,
                expectedMinute: Minute,
                expectedSecond: Second,
                expectedLinkerAddressHash: PoseidonHash,
                expectedDepositDataHash: PoseidonHash,
                expectedOnChainMvkHash: PoseidonHash
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]>;

        /**
         * Generates a zero-knowledge proof for claiming an SPL token deposit with a hidden amount.
         *
         * @param randomSecret - Random secret used in the original deposit commitment (128-bit)
         * @param nullifier - Nullifier secret to prevent double-spending (128-bit)
         * @param masterViewingKey - Master viewing key for compliance linkage (128-bit)
         * @param merkleSiblingPathElements - Array of sibling node hashes in the Merkle tree path
         * @param merkleSiblingPathIndicies - Array of path direction indices (0=left, 1=right) for each tree level
         * @param version - Protocol version identifier (must be 1)
         * @param commitmentIndex - Index of the commitment in the Merkle tree
         * @param destinationAddressLow - Low 128 bits of the destination address
         * @param destinationAddressHigh - High 128 bits of the destination address
         * @param senderAddressLow - Low 128 bits of the sender address
         * @param senderAddressHigh - High 128 bits of the sender address
         * @param blockchainId - Blockchain/network identifier (must be 1)
         * @param amount - Deposit amount (private, not revealed in proof)
         * @param year - Transaction year
         * @param month - Transaction month
         * @param day - Transaction day
         * @param hour - Transaction hour
         * @param minute - Transaction minute
         * @param second - Transaction second
         * @param mintPublicKeyLow - Low 128 bits of the SPL token mint public key
         * @param mintPublicKeyHigh - High 128 bits of the SPL token mint public key
         * @param secondAddressBlindingFactor - Blinding factor for second address commitment (128-bit)
         * @param commissionFeeLowerBound - Lower bound for commission fee
         * @param commissionFeeUpperBound - Upper bound for commission fee
         * @param relayerPubkeyLow - Low 128 bits of the relayer public key
         * @param relayerPubkeyHigh - High 128 bits of the relayer public key
         * @param expectedVersion - Expected protocol version for verification (must be 1)
         * @param expectedFirstAddressLow - Expected low 128 bits of first address
         * @param expectedFirstAddressHigh - Expected high 128 bits of first address
         * @param expectedBlockchainId - Expected blockchain identifier for verification (must be 1)
         * @param expectedMerkleRoot - Expected Merkle tree root hash
         * @param expectedLinkerAddressHash - Expected linker address hash commitment
         * @param expectedNullifierHash - Expected nullifier hash commitment
         * @param expectedSecondAddressSha3AggregatedHash - Expected SHA-3 aggregated hash for second address
         * @param expectedLowerBound - Expected commission fee lower bound
         * @param expectedUpperBound - Expected commission fee upper bound
         * @param expectedMintPubkeyLow - Expected low 128 bits of mint public key
         * @param expectedMintPubkeyHigh - Expected high 128 bits of mint public key
         * @param expectedRelayerPubkeyLow - Expected low 128 bits of relayer public key
         * @param expectedRelayerPubkeyHigh - Expected high 128 bits of relayer public key
         * @returns A promise resolving to a tuple of Groth16 proof components (A, B, C) in big-endian byte format
         *
         * @throws {@link ZkProverError} When proof generation fails due to invalid inputs, circuit errors, Merkle path validation failures, or computation errors
         *
         * @remarks
         * This proof demonstrates knowledge of a deposit commitment and its inclusion in the Merkle tree
         * without revealing the deposit amount. The proof verifies the Merkle path, nullifier, and all
         * expected commitments. Used for privacy-preserving deposit claims in the Umbra protocol.
         *
         * @example
         * ```typescript
         * const proof = await prover.generateClaimSplDepositWithHiddenAmountProof(
         *   randomSecret,
         *   nullifier,
         *   masterViewingKey,
         *   merkleSiblingPathElements,
         *   merkleSiblingPathIndicies,
         *   1, // version
         *   commitmentIndex,
         *   destinationAddressLow,
         *   destinationAddressHigh,
         *   senderAddressLow,
         *   senderAddressHigh,
         *   1, // blockchainId
         *   amount,
         *   year, month, day, hour, minute, second,
         *   mintPublicKeyLow,
         *   mintPublicKeyHigh,
         *   secondAddressBlindingFactor,
         *   commissionFeeLowerBound,
         *   commissionFeeUpperBound,
         *   relayerPubkeyLow,
         *   relayerPubkeyHigh,
         *   1, // expectedVersion
         *   expectedFirstAddressLow,
         *   expectedFirstAddressHigh,
         *   1, // expectedBlockchainId
         *   expectedMerkleRoot,
         *   expectedLinkerAddressHash,
         *   expectedNullifierHash,
         *   expectedSecondAddressSha3AggregatedHash,
         *   expectedLowerBound,
         *   expectedUpperBound,
         *   expectedMintPubkeyLow,
         *   expectedMintPubkeyHigh,
         *   expectedRelayerPubkeyLow,
         *   expectedRelayerPubkeyHigh
         * );
         * ```
         */
        public abstract generateClaimSplDepositWithHiddenAmountProof(
                randomSecret: U128,
                nullifier: U128,
                masterViewingKey: U128,
                merkleSiblingPathElements: Array<PoseidonHash>,
                merkleSiblingPathIndicies: Array<0 | 1>,
                version: 1,
                commitmentIndex: ZkMerkleTreeInsertionIndex,
                destinationAddressLow: U128,
                destinationAddressHigh: U128,
                senderAddressLow: U128,
                senderAddressHigh: U128,
                blockchainId: 1,
                amount: Amount,
                year: Year,
                month: Month,
                day: Day,
                hour: Hour,
                minute: Minute,
                second: Second,
                mintPublicKeyLow: U128,
                mintPublicKeyHigh: U128,
                secondAddressBlindingFactor: U128,
                commissionFeeLowerBound: Amount,
                commissionFeeUpperBound: Amount,
                relayerPubkeyLow: U128,
                relayerPubkeyHigh: U128,
                expectedVersion: 1,
                expectedFirstAddressLow: U128,
                expectedFirstAddressHigh: U128,
                expectedBlockchainId: 1,
                expectedMerkleRoot: PoseidonHash,
                expectedLinkerAddressHash: PoseidonHash,
                expectedNullifierHash: PoseidonHash,
                expectedSecondAddressSha3AggregatedHash: PoseidonHash,
                expectedLowerBound: Amount,
                expectedUpperBound: Amount,
                expectedMintPubkeyLow: U128,
                expectedMintPubkeyHigh: U128,
                expectedRelayerPubkeyLow: U128,
                expectedRelayerPubkeyHigh: U128
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]>;

        /**
         * Generates a zero-knowledge proof for claiming an SPL token deposit.
         *
         * @param randomSecret - Random secret used in the original deposit commitment (128-bit)
         * @param nullifier - Nullifier secret to prevent double-spending (128-bit)
         * @param masterViewingKey - Master viewing key for compliance linkage (128-bit)
         * @param merklePathElements - Array of sibling node hashes in the Merkle tree path
         * @param merklePathIndices - Array of path direction indices (0=left, 1=right) for each tree level
         * @param version - Protocol version identifier
         * @param commitmentIndex - Index of the commitment in the Merkle tree
         * @param firstAddressLow - Low 128 bits of the first address (destination)
         * @param firstAddressHigh - High 128 bits of the first address (destination)
         * @param secondAddressLow - Low 128 bits of the second address (sender)
         * @param secondAddressHigh - High 128 bits of the second address (sender)
         * @param blockchainId - Blockchain/network identifier
         * @param amount - Deposit amount (private, not revealed in proof)
         * @param year - Transaction year
         * @param month - Transaction month
         * @param day - Transaction day
         * @param hour - Transaction hour
         * @param minute - Transaction minute
         * @param seconds - Transaction seconds
         * @param mintPubkeyLow - Low 128 bits of the SPL token mint public key
         * @param mintPubkeyHigh - High 128 bits of the SPL token mint public key
         * @param secondAddressBlindingFactor - Blinding factor for second address commitment (128-bit)
         * @param relayerPubkeyLow - Low 128 bits of the relayer public key
         * @param relayerPubkeyHigh - High 128 bits of the relayer public key
         * @param expectedVersion - Expected protocol version for verification
         * @param expectedBlockchainId - Expected blockchain identifier for verification
         * @param expectedFirstAddressLow - Expected low 128 bits of first address
         * @param expectedFirstAddressHigh - Expected high 128 bits of first address
         * @param expectedAmount - Expected deposit amount for verification
         * @param expectedMintPubkeyLow - Expected low 128 bits of mint public key
         * @param expectedMintPubkeyHigh - Expected high 128 bits of mint public key
         * @param expectedMerkleRoot - Expected Merkle tree root hash
         * @param expectedLinkerAddressHash - Expected linker address hash commitment
         * @param expectedNullifierHash - Expected nullifier hash commitment
         * @param expectedSecondAddressKeccakAggregatedHash - Expected Keccak (SHA-3) aggregated hash for second address
         * @param expectedRelayerPubkeyLow - Expected low 128 bits of relayer public key
         * @param expectedRelayerPubkeyHigh - Expected high 128 bits of relayer public key
         * @returns A promise resolving to a tuple of Groth16 proof components (A, B, C) in big-endian byte format
         *
         * @throws {@link ZkProverError} When proof generation fails due to invalid inputs, circuit errors, Merkle path validation failures, or computation errors
         *
         * @remarks
         * This proof demonstrates knowledge of a deposit commitment and its inclusion in the Merkle tree.
         * The proof verifies the Merkle path, nullifier, and all expected commitments. The amount remains
         * private in the proof. Used for privacy-preserving deposit claims in the Umbra protocol.
         *
         * @example
         * ```typescript
         * const proof = await prover.generateClaimSplDepositProof(
         *   randomSecret,
         *   nullifier,
         *   masterViewingKey,
         *   merklePathElements,
         *   merklePathIndices,
         *   version,
         *   commitmentIndex,
         *   firstAddressLow,
         *   firstAddressHigh,
         *   secondAddressLow,
         *   secondAddressHigh,
         *   blockchainId,
         *   amount,
         *   year, month, day, hour, minute, seconds,
         *   mintPubkeyLow,
         *   mintPubkeyHigh,
         *   secondAddressBlindingFactor,
         *   relayerPubkeyLow,
         *   relayerPubkeyHigh,
         *   expectedVersion,
         *   expectedBlockchainId,
         *   expectedFirstAddressLow,
         *   expectedFirstAddressHigh,
         *   expectedAmount,
         *   expectedMintPubkeyLow,
         *   expectedMintPubkeyHigh,
         *   expectedMerkleRoot,
         *   expectedLinkerAddressHash,
         *   expectedNullifierHash,
         *   expectedSecondAddressKeccakAggregatedHash,
         *   expectedRelayerPubkeyLow,
         *   expectedRelayerPubkeyHigh
         * );
         * ```
         */
        public abstract generateClaimSplDepositProof(
                randomSecret: U128,
                nullifier: U128,
                masterViewingKey: U128,
                merklePathElements: Array<PoseidonHash>,
                merklePathIndices: Array<0 | 1>,
                version: VersionByte,
                commitmentIndex: ZkMerkleTreeInsertionIndex,
                firstAddressLow: U128,
                firstAddressHigh: U128,
                secondAddressLow: U128,
                secondAddressHigh: U128,
                blockchainId: U8,
                amount: Amount,
                year: Year,
                month: Month,
                day: Day,
                hour: Hour,
                minute: Minute,
                seconds: Second,
                mintPubkeyLow: U128,
                mintPubkeyHigh: U128,
                secondAddressBlindingFactor: U128,
                relayerPubkeyLow: U128,
                relayerPubkeyHigh: U128,
                expectedVersion: VersionByte,
                expectedBlockchainId: U8,
                expectedFirstAddressLow: U128,
                expectedFirstAddressHigh: U128,
                expectedAmount: Amount,
                expectedMintPubkeyLow: U128,
                expectedMintPubkeyHigh: U128,
                expectedMerkleRoot: PoseidonHash,
                expectedLinkerAddressHash: PoseidonHash,
                expectedNullifierHash: PoseidonHash,
                expectedSecondAddressKeccakAggregatedHash: Sha3Hash,
                expectedRelayerPubkeyLow: U128,
                expectedRelayerPubkeyHigh: U128
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]>;
}
