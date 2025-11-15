import { program } from '@/idl';
import {
        ArciumX25519Nonce,
        convertArciumX25519NonceToTransactionInput,
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
        PoseidonHash,
        RescueCiphertext,
        Sha3Hash,
        SolanaAddress,
} from '@/types';
import { generateRandomComputationOffset } from '@/utils/arcium';
import { TransactionInstruction } from '@solana/web3.js';

export async function buildUpdateMasterViewingKeyInstruction(
        txAccounts: {
                payer: SolanaAddress;
                arciumSigner: SolanaAddress;
        },
        txArgs: {
                masterViewingKey: PoseidonHash;
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
        const computationOffset = generateRandomComputationOffset();

        const ixBuilder = program.methods
                .updateMasterViewingKey(
                        convertComputationOffsetToTransactionInput(computationOffset),
                        convertRescueCiphertextToTransactionInput(
                                txArgs.masterViewingKeyCiphertext
                        ),
                        convertRescueCiphertextToTransactionInput(
                                txArgs.masterViewingKeyBlindingFactor
                        ),
                        convertArciumX25519NonceToTransactionInput(txArgs.masterViewingKeyNonce),
                        convertSha3HashToTransactionInput(txArgs.masterViewingKeyShaCommitment),
                        convertPoseidonHashToTransactionInput(txArgs.masterViewingKeyHash),
                        convertGroth16ProofABeBytesToTransactionInput(txArgs.proofA),
                        convertGroth16ProofBBeBytesToTransactionInput(txArgs.proofB),
                        convertGroth16ProofCBeBytesToTransactionInput(txArgs.proofC),
                        convertSha3HashToTransactionInput(txArgs.optionalData)
                )
                .accountsPartial({
                        payer: txAccounts.payer,
                        arciumSigner: txAccounts.arciumSigner,
                });

        return await ixBuilder.instruction();
}
