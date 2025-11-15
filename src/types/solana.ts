import { PublicKey } from '@solana/web3.js';
import { Bytes } from '@/types/common';

export type SolanaAddress = PublicKey & { _brand: 'SolanaAddress' };
export type MintAddress = PublicKey & { _brand: 'MintAddress' };
export type ProgramDerivedAddress = PublicKey & { _brand: 'ProgramDerivedAddress' };
export type ProgramAddress = PublicKey & { _brand: 'ProgramAddress' };

export type SolanaAddressTransactionInput = { 0: PublicKey };
export type MintAddressTransactionInput = { 0: PublicKey };
export type ProgramDerivedAddressTransactionInput = { 0: PublicKey };
export type ProgramAddressTransactionInput = { 0: PublicKey };

export type SolanaSignature = Bytes & { _brand: 'SolanaSignature'; length: 64 };
export type SolanaTransactionSignature = string;

export function convertSolanaAddressToTransactionInput(
        solanaAddress: SolanaAddress
): SolanaAddressTransactionInput {
        return { 0: solanaAddress };
}

export function convertMintAddressToTransactionInput(
        mintAddress: MintAddress
): MintAddressTransactionInput {
        return { 0: mintAddress };
}

export function convertProgramDerivedAddressToTransactionInput(
        programDerivedAddress: ProgramDerivedAddress
): ProgramDerivedAddressTransactionInput {
        return { 0: programDerivedAddress };
}

export function convertProgramAddressToTransactionInput(
        programAddress: ProgramAddress
): ProgramAddressTransactionInput {
        return { 0: programAddress };
}
