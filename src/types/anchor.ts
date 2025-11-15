import { U8 } from '@/types/common';
import BN from 'bn.js';

export type VersionByte = U8;
export type CanonicalBump = U8;
export type ReservedSpace = U8;

export type VersionByteTransactionInput = { 0: BN };
export type CanonicalBumpTransactionInput = { 0: BN };
export type ReservedSpaceTransactionInput = { 0: BN };

export function convertVersionByteToTransactionInput(
        versionByte: VersionByte
): VersionByteTransactionInput {
        return { 0: new BN(versionByte) };
}

export function convertCanonicalBumpToTransactionInput(
        canonicalBump: CanonicalBump
): CanonicalBumpTransactionInput {
        return { 0: new BN(canonicalBump) };
}

export function convertReservedSpaceToTransactionInput(
        reservedSpace: ReservedSpace
): ReservedSpaceTransactionInput {
        return { 0: new BN(reservedSpace) };
}
