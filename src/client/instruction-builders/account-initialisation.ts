import { program } from '@/idl';
import {
        convertPoseidonHashToTransactionInput,
        convertSha3HashToTransactionInput,
        MintAddress,
        PoseidonHash,
        Sha3Hash,
        SolanaAddress,
} from '@/types';
import { getNullifierHashPda } from '@/utils/pda-generators';
import { TransactionInstruction } from '@solana/web3.js';

export async function buildInitialiseArciumEncryptedUserAccountInstruction(
        txAccounts: {
                destinationAddress: SolanaAddress;
                signer: SolanaAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        const ixBuilder = program.methods
                .initialiseArciumEncryptedUserAccount(
                        convertSha3HashToTransactionInput(txArgs.optionalData)
                )
                .accountsPartial({
                        destinationAddress: txAccounts.destinationAddress,
                });

        return await ixBuilder.instruction();
}

export async function buildInitialiseArciumEncryptedTokenAccountInstruction(
        txAccounts: {
                destinationAddress: SolanaAddress;
                signer: SolanaAddress;
                mint: MintAddress;
        },
        txArgs: {
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        const ixBuilder = program.methods
                .initialiseArciumEncryptedTokenAccount(
                        convertSha3HashToTransactionInput(txArgs.optionalData)
                )
                .accountsPartial({
                        destinationAddress: txAccounts.destinationAddress,
                        signer: txAccounts.signer,
                        mint: txAccounts.mint,
                });

        return await ixBuilder.instruction();
}

export async function buildInitialiseNullifierHashInstruction(
        txAccounts: {
                signer: SolanaAddress;
        },
        txArgs: {
                nullifierHash: PoseidonHash;
                optionalData: Sha3Hash;
        }
): Promise<TransactionInstruction> {
        const nullifierHashPda = getNullifierHashPda(txArgs.nullifierHash);

        const ixBuilder = program.methods
                .initialiseNullifierHash(
                        convertPoseidonHashToTransactionInput(txArgs.nullifierHash),
                        convertSha3HashToTransactionInput(txArgs.optionalData)
                )
                .accountsPartial({
                        nullifierHash: nullifierHashPda,
                        signer: txAccounts.signer,
                });

        return await ixBuilder.instruction();
}
