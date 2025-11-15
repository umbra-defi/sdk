import { Bytes, U128, U64 } from '@/types/common';
import BN from 'bn.js';

export type ComputationOffset = U64;

export type ArciumX25519PublicKey = Bytes & { _brand: 'ArciumX25519PublicKey'; length: 32 };
export type ArciumX25519SecretKey = Bytes & { _brand: 'ArciumX25519SecretKey'; length: 32 };
export type RescueCiphertext = Bytes & { _brand: 'RescueCiphertext'; length: 32 };
export type ArciumX25519Nonce = U128;
export type RescueCipherSharedSecret = Bytes & { _brand: 'RescueCipherSharedSecret'; length: 32 };

export type ArciumX25519PublicKeyTransactionInput = { 0: Array<number> };
export type ArciumX25519SecretKeyTransactionInput = { 0: Array<number> };
export type RescueCiphertextTransactionInput = { 0: Array<number> };
export type ArciumX25519NonceTransactionInput = { 0: BN };
export type ComputationOffsetTransactionInput = { 0: BN };

export function convertArciumX25519PublicKeyToTransactionInput(
        publicKey: ArciumX25519PublicKey
): ArciumX25519PublicKeyTransactionInput {
        return { 0: Array.from(publicKey) };
}

export function convertArciumX25519SecretKeyToTransactionInput(
        secretKey: ArciumX25519SecretKey
): ArciumX25519SecretKeyTransactionInput {
        return { 0: Array.from(secretKey) };
}

export function convertRescueCiphertextToTransactionInput(
        ciphertext: RescueCiphertext
): RescueCiphertextTransactionInput {
        return { 0: Array.from(ciphertext) };
}

export function convertArciumX25519NonceToTransactionInput(
        nonce: ArciumX25519Nonce
): ArciumX25519NonceTransactionInput {
        return { 0: new BN(nonce) };
}

export function convertComputationOffsetToTransactionInput(
        offset: ComputationOffset
): ComputationOffsetTransactionInput {
        return { 0: new BN(offset) };
}
