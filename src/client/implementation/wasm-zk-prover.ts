import { IZkProver, ZkProverError } from '@/client/interface/zk-prover';
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
        U256,
        U8,
        VersionByte,
        Year,
        ZkMerkleTreeInsertionIndex,
} from '@/types';
import {
        convertStringToBigInt,
        convertU256LeBytesToU256,
        convertU256ToBeBytes,
} from '@/utils/convertors';
import { CircuitSignals, groth16, Groth16Proof } from 'snarkjs';

type CircuitId =
        | 'masterViewingKeyRegistration'
        | 'createSplDepositWithHiddenAmount'
        | 'createSplDepositWithPublicAmount'
        | 'claimSplDepositWithHiddenAmount'
        | 'claimSplDeposit';

/**
 * Default artifact locations for each Circom/Groth16 circuit.
 *
 * @remarks
 * These are provided as sensible defaults and can be updated by applications at build time
 * if they host the artifacts at different paths or URLs.
 *
 * All paths/URLs should be resolvable in the environment where the prover runs
 * (browser or Node, depending on how `fetch` is implemented).
 */
export const CIRCUIT_ARTIFACT_URLS: Record<
        CircuitId,
        {
                wasm: string;
                zkey: string;
                verificationKey?: string;
        }
> = {
        masterViewingKeyRegistration: {
                wasm: '/zk/master_viewing_key_registration.wasm',
                zkey: '/zk/master_viewing_key_registration.zkey',
                verificationKey: '/zk/master_viewing_key_registration_verification_key.json',
        },
        createSplDepositWithHiddenAmount: {
                wasm: '/zk/create_spl_deposit_with_hidden_amount.wasm',
                zkey: '/zk/create_spl_deposit_with_hidden_amount.zkey',
                verificationKey: '/zk/create_spl_deposit_with_hidden_amount_verification_key.json',
        },
        createSplDepositWithPublicAmount: {
                wasm: '/zk/create_spl_deposit_with_public_amount.wasm',
                zkey: '/zk/create_spl_deposit_with_public_amount.zkey',
                verificationKey: '/zk/create_spl_deposit_with_public_amount_verification_key.json',
        },
        claimSplDepositWithHiddenAmount: {
                wasm: '/zk/claim_spl_deposit_with_hidden_amount.wasm',
                zkey: '/zk/claim_spl_deposit_with_hidden_amount.zkey',
                verificationKey: '/zk/claim_spl_deposit_with_hidden_amount_verification_key.json',
        },
        claimSplDeposit: {
                wasm: '/zk/claim_spl_deposit.wasm',
                zkey: '/zk/claim_spl_deposit.zkey',
                verificationKey: '/zk/claim_spl_deposit_verification_key.json',
        },
};

/**
 * Configuration for the WASM-based ZK prover.
 *
 * @remarks
 * The configuration flags indicate which circuits should be enabled. Only the circuits
 * with a `true` flag will have their artifacts fetched and cached, allowing applications
 * to load only the proof systems they actually need.
 *
 * Artifact URLs/paths themselves are defined in {@link CIRCUIT_ARTIFACT_URLS} and can be
 * customized at build time by the application if necessary.
 */
export type WasmZkProverConfig = Partial<Record<CircuitId, boolean>>;

interface LoadedCircuitArtifacts {
        wasm: Uint8Array;
        zkey: Uint8Array;
        verificationKeyJson?: unknown;
}

/**
 * Error type for WASM-based ZK prover operations.
 *
 * @internal
 */
class WasmZkProverError extends ZkProverError {
        public constructor(message: string, cause?: Error) {
                super(message, cause);
        }
}

/**
 * Base WASM-based implementation of the {@link IZkProver} interface using snarkjs Groth16.
 *
 * @remarks
 * This class is responsible for:
 * - Managing circuit configuration
 * - Fetching and caching WASM / zkey / verification key artifacts
 * - Providing a protected `generateProof` helper that runs `snarkjs.groth16.fullProve`
 * - Converting snarkjs Groth16 proofs into Umbra's `[A, B, C]` byte-array representation
 *
 * The concrete mapping from Umbra SDK arguments to the Circom input shape is handled in the
 * IZkProver method implementations, which transform typed SDK values into plain snarkjs
 * input signals (mostly decimal strings and flattened hashes).
 *
 * All methods wrap lower-level failures in {@link WasmZkProverError}, so callers can catch
 * a single error type for ZK-related issues (circuit loading, proof generation, conversion).
 *
 * @example
 * ```typescript
 * import {
 *   WasmZkProver,
 *   WasmZkProverConfig,
 * } from '@/client/implementation/wasm-zk-prover';
 *
 * // Enable only the circuits your application needs. Artifact URLs are
 * // provided by `CIRCUIT_ARTIFACT_URLS` and can be customized at build time.
 * const config: WasmZkProverConfig = {
 *   masterViewingKeyRegistration: true,
 *   createSplDepositWithHiddenAmount: true,
 *   // other circuits default to disabled (false/undefined)
 * };
 *
 * const prover = new WasmZkProver(config);
 *
 * const [proofA, proofB, proofC] =
 *   await prover.generateMasterViewingKeyRegistrationProof(
 *     masterViewingKey,
 *     poseidonBlindingFactor,
 *     sha3BlindingFactor,
 *     expectedPoseidonCommitment,
 *     expectedSha3Commitment
 *   );
 * ```
 */
export class WasmZkProver extends IZkProver {
        protected readonly config: WasmZkProverConfig;
        private readonly cache = new Map<CircuitId, LoadedCircuitArtifacts>();

        public constructor(config: WasmZkProverConfig) {
                super();
                this.config = config;
        }

        /**
         * Generates a Groth16 proof for a given circuit with the provided input signals.
         *
         * @remarks
         * The `input` object is passed directly to `snarkjs.groth16.fullProve` without any
         * additional transformation. It is the responsibility of the caller to ensure that
         * all values are encoded in the way the Circom circuit expects (e.g. big-endian U32
         * string arrays).
         *
         * @internal
         */
        protected async generateProof(
                circuitId: CircuitId,
                input: Record<string, unknown>
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]> {
                const artifacts = await this.getArtifacts(circuitId);

                try {
                        const { proof } = (await groth16.fullProve(
                                input as unknown as CircuitSignals,
                                artifacts.wasm,
                                artifacts.zkey
                        )) as { proof: Groth16Proof };

                        // For Groth16 on BN254, snarkjs exposes the coordinates as arrays of strings:
                        // - proof.pi_a: [Ax, Ay]
                        // - proof.pi_b: [[Bax, Bay], [Bbx, Bby]]
                        // - proof.pi_c: [Cx, Cy]
                        const a = proof.pi_a;
                        const b = proof.pi_b;
                        const c = proof.pi_c;

                        if (!a || !b || !c) {
                                throw new WasmZkProverError(
                                        'snarkjs proof object did not contain expected Groth16 components'
                                );
                        }

                        const [aBytes, bBytes, cBytes] = this.convertZkProofToBytes(proof);

                        return [aBytes, bBytes, cBytes];
                } catch (error) {
                        if (error instanceof ZkProverError) {
                                throw error;
                        }
                        throw new WasmZkProverError(
                                `Failed to generate Groth16 proof for circuit "${circuitId}": ${
                                        error instanceof Error ? error.message : String(error)
                                }`,
                                error instanceof Error ? error : undefined
                        );
                }
        }

        /**
         * Lazily loads and caches the artifacts for a given circuit.
         *
         * @internal
         */
        private async getArtifacts(circuitId: CircuitId): Promise<LoadedCircuitArtifacts> {
                const cached = this.cache.get(circuitId);
                if (cached) {
                        return cached;
                }

                const enabled = this.config[circuitId] ?? false;
                if (!enabled) {
                        throw new WasmZkProverError(
                                `Circuit "${circuitId}" is not enabled in WasmZkProverConfig`
                        );
                }

                const urls = CIRCUIT_ARTIFACT_URLS[circuitId];

                const [wasm, zkey, verificationKeyJson] = await Promise.all([
                        this.fetchBinary(urls.wasm),
                        this.fetchBinary(urls.zkey),
                        urls.verificationKey
                                ? this.fetchJson(urls.verificationKey)
                                : Promise.resolve(undefined),
                ]);

                const artifacts: LoadedCircuitArtifacts = {
                        wasm,
                        zkey,
                        verificationKeyJson,
                };

                this.cache.set(circuitId, artifacts);
                return artifacts;
        }

        /**
         * Fetches a binary resource (WASM / ZKey) as a Uint8Array.
         *
         * @internal
         */
        private async fetchBinary(url: string): Promise<Uint8Array> {
                const response: any = await fetch(url as any);
                if (!response.ok) {
                        throw new WasmZkProverError(
                                `Failed to fetch binary artifact from "${url}": ${response.status} ${response.statusText}`
                        );
                }
                const buffer = await response.arrayBuffer();
                return new Uint8Array(buffer);
        }

        /**
         * Fetches a JSON resource (e.g. verification key).
         *
         * @internal
         */
        private async fetchJson(url: string): Promise<unknown> {
                const response: any = await fetch(url as any);
                if (!response.ok) {
                        throw new WasmZkProverError(
                                `Failed to fetch JSON artifact from "${url}": ${response.status} ${response.statusText}`
                        );
                }
                return response.json();
        }

        // === IZkProver implementation ===========================================================

        public async generateMasterViewingKeyRegistrationProof(
                masterViewingKey: U128,
                poseidonBlindingFactor: U128,
                sha3BlindingFactor: U128,
                expectedPoseidonCommitment: PoseidonHash,
                expectedSha3Commitment: PoseidonHash
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]> {
                const inputs = {
                        masterViewingKey: masterViewingKey.toString(),
                        poseidonBlindingFactor: poseidonBlindingFactor.toString(),
                        sha3BlindingFactor: sha3BlindingFactor.toString(),
                        expectedPoseidonCommitment: convertU256LeBytesToU256(
                                expectedPoseidonCommitment
                        ).toString(),
                        expectedSha3Commitment:
                                convertU256LeBytesToU256(expectedSha3Commitment).toString(),
                };

                return this.generateProof('masterViewingKeyRegistration', inputs);
        }

        public async generateCreateSplDepositWithHiddenAmountProof(
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
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]> {
                const inputs = {
                        masterViewingKey: masterViewingKey.toString(),
                        poseidonBlindingFactor: poseidonBlindingFactor.toString(),
                        destinationAddressLow: destinationAddressLow.toString(),
                        destinationAddressHigh: destinationAddressHigh.toString(),
                        randomSecret: randomSecret.toString(),
                        nullifier: nullifier.toString(),
                        amount: amount.toString(),
                        relayerFee: relayerFee.toString(),
                        commissionFeeLowBound: commissionFeeLowBound.toString(),
                        commissionFeeHighBound: commissionFeeHighBound.toString(),
                        commissionFeeBps: commissionFeeBps.toString(),
                        commissionFeeQuotient: commissionFeeQuotient.toString(),
                        commissionFeeRemainder: commissionFeeRemainder.toString(),
                        year: year.toString(),
                        month: month.toString(),
                        day: day.toString(),
                        hour: hour.toString(),
                        minute: minute.toString(),
                        second: second.toString(),
                        expectedYear: expectedYear.toString(),
                        expectedMonth: expectedMonth.toString(),
                        expectedDay: expectedDay.toString(),
                        expectedHour: expectedHour.toString(),
                        expectedMinute: expectedMinute.toString(),
                        expectedSecond: expectedSecond.toString(),
                        expectedLinkerAddressHash:
                                convertU256LeBytesToU256(expectedLinkerAddressHash).toString(),
                        expectedDepositDataHash:
                                convertU256LeBytesToU256(expectedDepositDataHash).toString(),
                        expectedOnChainMvkHash:
                                convertU256LeBytesToU256(expectedOnChainMvkHash).toString(),
                        expectedSha3AggregatedHash: convertU256LeBytesToU256(
                                expectedSha3AggregatedHash
                        ).toString(),
                        expectedRelayerFee: expectedRelayerFee.toString(),
                        expectedCommissionFeeLowBound: expectedCommissionFeeLowBound.toString(),
                        expectedCommissionFeeHighBound: expectedCommissionFeeHighBound.toString(),
                        expectedCommissionFeeBps: expectedCommissionFeeBps.toString(),
                };

                return this.generateProof('createSplDepositWithHiddenAmount', inputs);
        }

        public async generateCreateSplDepositWithPublicAmountProof(
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
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]> {
                const inputs = {
                        masterViewingKey: masterViewingKey.toString(),
                        poseidonBlindingFactor: poseidonBlindingFactor.toString(),
                        destinationAddressLow: destinationAddressLow.toString(),
                        destinationAddressHigh: destinationAddressHigh.toString(),
                        randomSecret: randomSecret.toString(),
                        nullifier: nullifier.toString(),
                        amount: amount.toString(),
                        year: year.toString(),
                        month: month.toString(),
                        day: day.toString(),
                        hour: hour.toString(),
                        minute: minute.toString(),
                        second: second.toString(),
                        expectedAmount: expectedAmount.toString(),
                        expectedYear: expectedYear.toString(),
                        expectedMonth: expectedMonth.toString(),
                        expectedDay: expectedDay.toString(),
                        expectedHour: expectedHour.toString(),
                        expectedMinute: expectedMinute.toString(),
                        expectedSecond: expectedSecond.toString(),
                        expectedLinkerAddressHash:
                                convertU256LeBytesToU256(expectedLinkerAddressHash).toString(),
                        expectedDepositDataHash:
                                convertU256LeBytesToU256(expectedDepositDataHash).toString(),
                        expectedOnChainMvkHash:
                                convertU256LeBytesToU256(expectedOnChainMvkHash).toString(),
                };

                return this.generateProof('createSplDepositWithPublicAmount', inputs);
        }

        public async generateClaimSplDepositWithHiddenAmountProof(
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
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]> {
                const inputs = {
                        randomSecret: randomSecret.toString(),
                        nullifier: nullifier.toString(),
                        masterViewingKey: masterViewingKey.toString(),
                        merkleSiblingPathElements: merkleSiblingPathElements.map((h) =>
                                convertU256LeBytesToU256(h).toString()
                        ),
                        merkleSiblingPathIndicies: merkleSiblingPathIndicies.map((i) =>
                                i.toString()
                        ),
                        version: version.toString(),
                        commitmentIndex: commitmentIndex.toString(),
                        destinationAddressLow: destinationAddressLow.toString(),
                        destinationAddressHigh: destinationAddressHigh.toString(),
                        senderAddressLow: senderAddressLow.toString(),
                        senderAddressHigh: senderAddressHigh.toString(),
                        blockchainId: blockchainId.toString(),
                        amount: amount.toString(),
                        year: year.toString(),
                        month: month.toString(),
                        day: day.toString(),
                        hour: hour.toString(),
                        minute: minute.toString(),
                        second: second.toString(),
                        mintPublicKeyLow: mintPublicKeyLow.toString(),
                        mintPublicKeyHigh: mintPublicKeyHigh.toString(),
                        secondAddressBlindingFactor: secondAddressBlindingFactor.toString(),
                        commissionFeeLowerBound: commissionFeeLowerBound.toString(),
                        commissionFeeUpperBound: commissionFeeUpperBound.toString(),
                        relayerPubkeyLow: relayerPubkeyLow.toString(),
                        relayerPubkeyHigh: relayerPubkeyHigh.toString(),
                        expectedVersion: expectedVersion.toString(),
                        expectedFirstAddressLow: expectedFirstAddressLow.toString(),
                        expectedFirstAddressHigh: expectedFirstAddressHigh.toString(),
                        expectedBlockchainId: expectedBlockchainId.toString(),
                        expectedMerkleRoot: convertU256LeBytesToU256(expectedMerkleRoot).toString(),
                        expectedLinkerAddressHash:
                                convertU256LeBytesToU256(expectedLinkerAddressHash).toString(),
                        expectedNullifierHash:
                                convertU256LeBytesToU256(expectedNullifierHash).toString(),
                        expectedSecondAddressSha3AggregatedHash: convertU256LeBytesToU256(
                                expectedSecondAddressSha3AggregatedHash
                        ).toString(),
                        expectedLowerBound: expectedLowerBound.toString(),
                        expectedUpperBound: expectedUpperBound.toString(),
                        expectedMintPubkeyLow: expectedMintPubkeyLow.toString(),
                        expectedMintPubkeyHigh: expectedMintPubkeyHigh.toString(),
                        expectedRelayerPubkeyLow: expectedRelayerPubkeyLow.toString(),
                        expectedRelayerPubkeyHigh: expectedRelayerPubkeyHigh.toString(),
                };

                return this.generateProof('claimSplDepositWithHiddenAmount', inputs);
        }

        public async generateClaimSplDepositProof(
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
        ): Promise<[Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes]> {
                const inputs = {
                        randomSecret: randomSecret.toString(),
                        nullifier: nullifier.toString(),
                        masterViewingKey: masterViewingKey.toString(),
                        merklePathElements: merklePathElements.map((h) =>
                                convertU256LeBytesToU256(h).toString()
                        ),
                        merklePathIndices: merklePathIndices.map((i) => i.toString()),
                        version: version.toString(),
                        commitmentIndex: commitmentIndex.toString(),
                        firstAddressLow: firstAddressLow.toString(),
                        firstAddressHigh: firstAddressHigh.toString(),
                        secondAddressLow: secondAddressLow.toString(),
                        secondAddressHigh: secondAddressHigh.toString(),
                        blockchainId: blockchainId.toString(),
                        amount: amount.toString(),
                        year: year.toString(),
                        month: month.toString(),
                        day: day.toString(),
                        hour: hour.toString(),
                        minute: minute.toString(),
                        seconds: seconds.toString(),
                        mintPubkeyLow: mintPubkeyLow.toString(),
                        mintPubkeyHigh: mintPubkeyHigh.toString(),
                        secondAddressBlindingFactor: secondAddressBlindingFactor.toString(),
                        relayerPubkeyLow: relayerPubkeyLow.toString(),
                        relayerPubkeyHigh: relayerPubkeyHigh.toString(),
                        expectedVersion: expectedVersion.toString(),
                        expectedBlockchainId: expectedBlockchainId.toString(),
                        expectedFirstAddressLow: expectedFirstAddressLow.toString(),
                        expectedFirstAddressHigh: expectedFirstAddressHigh.toString(),
                        expectedAmount: expectedAmount.toString(),
                        expectedMintPubkeyLow: expectedMintPubkeyLow.toString(),
                        expectedMintPubkeyHigh: expectedMintPubkeyHigh.toString(),
                        expectedMerkleRoot: convertU256LeBytesToU256(expectedMerkleRoot).toString(),
                        expectedLinkerAddressHash:
                                convertU256LeBytesToU256(expectedLinkerAddressHash).toString(),
                        expectedNullifierHash:
                                convertU256LeBytesToU256(expectedNullifierHash).toString(),
                        expectedSecondAddressKeccakAggregatedHash: convertU256LeBytesToU256(
                                expectedSecondAddressKeccakAggregatedHash
                        ).toString(),
                        expectedRelayerPubkeyLow: expectedRelayerPubkeyLow.toString(),
                        expectedRelayerPubkeyHigh: expectedRelayerPubkeyHigh.toString(),
                };

                return this.generateProof('claimSplDeposit', inputs);
        }

        /**
         * Converts a snarkjs Groth16 proof into flattened big-endian byte arrays compatible with
         * the Umbra on-chain types.
         *
         * @remarks
         * snarkjs represents Groth16 proofs over BN254 as:
         * - `pi_a`: [Ax, Ay]
         * - `pi_b`: [[Bax, Bay], [Bbx, Bby]]
         * - `pi_c`: [Cx, Cy]
         *
         * All coordinates are hex/decimal strings modulo the BN254 field. This helper:
         * 1. Parses each coordinate string into a bigint
         * 2. Encodes it as a 32-byte big-endian `U256`
         * 3. Flattens the points into contiguous byte arrays in the expected order:
         *    - A: [Ax || Ay]
         *    - B: [Bay || Bax || Bby || Bbx] (note the (1,0) / (0,1) ordering)
         *    - C: [Cx || Cy]
         *
         * @param proof - Groth16 proof returned by snarkjs.
         * @returns A tuple of (A, B, C) as big-endian byte arrays.
         *
         * @throws {@link WasmZkProverError} If the proof shape is invalid or a coordinate
         *         cannot be parsed as a valid U256.
         */
        public convertZkProofToBytes(
                proof: Groth16Proof
        ): [Groth16ProofABeBytes, Groth16ProofBBeBytes, Groth16ProofCBeBytes] {
                const { pi_a: a, pi_b: b, pi_c: c } = proof as any;

                if (!Array.isArray(a) || a.length !== 2) {
                        throw new WasmZkProverError(
                                'Groth16 proof `pi_a` must be an array of length 2'
                        );
                }
                if (
                        !Array.isArray(b) ||
                        b.length !== 2 ||
                        !Array.isArray(b[0]) ||
                        !Array.isArray(b[1])
                ) {
                        throw new WasmZkProverError(
                                'Groth16 proof `pi_b` must be a 2x2 array: [[Bax, Bay], [Bbx, Bby]]'
                        );
                }
                if (!Array.isArray(c) || c.length !== 2) {
                        throw new WasmZkProverError(
                                'Groth16 proof `pi_c` must be an array of length 2'
                        );
                }

                try {
                        const aBytes = a.map((x: string) =>
                                convertU256ToBeBytes(convertStringToBigInt(x) as U256)
                        );

                        const bBytes = b.map((x: [string, string]) => {
                                const bax = convertU256ToBeBytes(
                                        convertStringToBigInt(x[0]!) as U256
                                );
                                const bay = convertU256ToBeBytes(
                                        convertStringToBigInt(x[1]!) as U256
                                );
                                return [bax, bay] as const;
                        });

                        const cBytes = c.map((x: string) =>
                                convertU256ToBeBytes(convertStringToBigInt(x) as U256)
                        );

                        const aFlattened = new Uint8Array([
                                ...Array.from(aBytes[0]!),
                                ...Array.from(aBytes[1]!),
                        ]);

                        // Ordering: [Bay || Bax || Bby || Bbx]
                        const bFlattened = new Uint8Array([
                                ...Array.from(bBytes[0]![1]!),
                                ...Array.from(bBytes[0]![0]!),
                                ...Array.from(bBytes[1]![1]!),
                                ...Array.from(bBytes[1]![0]!),
                        ]);

                        const cFlattened = new Uint8Array([
                                ...Array.from(cBytes[0]!),
                                ...Array.from(cBytes[1]!),
                        ]);

                        return [
                                aFlattened as unknown as Groth16ProofABeBytes,
                                bFlattened as unknown as Groth16ProofBBeBytes,
                                cFlattened as unknown as Groth16ProofCBeBytes,
                        ];
                } catch (error) {
                        throw new WasmZkProverError(
                                `Failed to convert Groth16 proof coordinates to bytes: ${
                                        error instanceof Error ? error.message : String(error)
                                }`,
                                error instanceof Error ? error : undefined
                        );
                }
        }
}
