import { program } from '@/idl';
import {
        ArciumX25519Nonce,
        convertArciumX25519NonceToTransactionInput,
        convertSha3HashToTransactionInput,
        Sha3Hash,
        SolanaAddress,
} from '@/types';
import { getUserAllotedComplianceGrantPda } from '@/utils/pda-generators';
import { TransactionInstruction } from '@solana/web3.js';

export async function buildInitComplianceGrantInstruction(
        txAccounts: {
                sender: SolanaAddress;
                destinationAddress: SolanaAddress;
        },
        txArgs: {
                nonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        const ixBuilder = program.methods
                .initComplianceGrant(
                        convertArciumX25519NonceToTransactionInput(txArgs.nonce),
                        convertSha3HashToTransactionInput(txArgs.optionalData)
                )
                .accountsPartial({
                        sender: txAccounts.sender,
                        arciumSenderUserAccount: txAccounts.sender,
                        destinationArciumUserAccount: txAccounts.destinationAddress,
                });

        return await ixBuilder.instruction();
}

export async function buildDeleteComplianceGrantInstruction(
        txAccounts: {
                senderSigner: SolanaAddress;
                destinationAddress: SolanaAddress;
        },
        txArgs: {
                nonce: ArciumX25519Nonce;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        const userAllotedComplianceGrantPda = getUserAllotedComplianceGrantPda(
                txAccounts.senderSigner,
                txAccounts.destinationAddress,
                txArgs.nonce
        );

        const ixBuilder = program.methods
                .deleteComplianceGrant(
                        convertArciumX25519NonceToTransactionInput(txArgs.nonce),
                        convertSha3HashToTransactionInput(txArgs.optionalData)
                )
                .accountsPartial({
                        senderSigner: txAccounts.senderSigner,
                        complianceGrant: userAllotedComplianceGrantPda,
                });

        return await ixBuilder.instruction();
}
