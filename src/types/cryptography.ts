import { BeBytes, LeBytes, U128 } from '@/types/common';
import BN from 'bn.js';

export type PoseidonHash = LeBytes;
export type Sha3Hash = LeBytes;
export type ZkMerkleTreeInsertionIndex = U128;
export type Groth16ProofABeBytes = BeBytes;
export type Groth16ProofBBeBytes = BeBytes;
export type Groth16ProofCBeBytes = BeBytes;

export type PoseidonHashTransactionInput = { 0: Array<number> };
export type Sha3HashTransactionInput = { 0: Array<number> };
export type ZkMerkleTreeInsertionIndexTransactionInput = { 0: BN };
export type Groth16ProofATransactionInput = { 0: Array<number> };
export type Groth16ProofBTransactionInput = { 0: Array<number> };
export type Groth16ProofCTransactionInput = { 0: Array<number> };

export function convertPoseidonHashToTransactionInput(
        poseidonHash: PoseidonHash
): PoseidonHashTransactionInput {
        return { 0: Array.from(poseidonHash) };
}

export function convertSha3HashToTransactionInput(sha3Hash: Sha3Hash): Sha3HashTransactionInput {
        return { 0: Array.from(sha3Hash) };
}

export function convertZkMerkleTreeInsertionIndexToTransactionInput(
        zkMerkleTreeInsertionIndex: ZkMerkleTreeInsertionIndex
): ZkMerkleTreeInsertionIndexTransactionInput {
        return { 0: new BN(zkMerkleTreeInsertionIndex) };
}

export function convertGroth16ProofAToTransactionInput(
        groth16ProofA: Groth16ProofABeBytes
): Groth16ProofATransactionInput {
        return { 0: Array.from(groth16ProofA) };
}

export function convertGroth16ProofBToTransactionInput(
        groth16ProofB: Groth16ProofBBeBytes
): Groth16ProofBTransactionInput {
        return { 0: Array.from(groth16ProofB) };
}

export function convertGroth16ProofCToTransactionInput(
        groth16ProofC: Groth16ProofCBeBytes
): Groth16ProofCTransactionInput {
        return { 0: Array.from(groth16ProofC) };
}
