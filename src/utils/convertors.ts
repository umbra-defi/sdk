import {
        BeBytes,
        LeBytes,
        U16LeBytes,
        U16BeBytes,
        U16,
        U8,
        U8BeBytes,
        U8LeBytes,
        U32BeBytes,
        U32LeBytes,
        U32,
        U64,
        U64LeBytes,
        U64BeBytes,
        U128,
        U128LeBytes,
        U128BeBytes,
        U256,
        U256LeBytes,
        U256BeBytes,
} from '@/types/common';

/**
 * Ensures that a bigint value fits into the requested byte width.
 *
 * @param value - The bigint value to validate.
 * @param numberOfBytes - The number of bytes available for the representation.
 *
 * @throws RangeError If the value is negative or cannot be represented in `numberOfBytes` bytes.
 */
function assertFitsInBytes(value: bigint, numberOfBytes: number): void {
        const max = (1n << (8n * BigInt(numberOfBytes))) - 1n;
        if (value < 0n || value > max) {
                throw new RangeError(
                        `Value ${value.toString()} does not fit in ${numberOfBytes} bytes`
                );
        }
}

/**
 * Converts a bigint into a little-endian byte array of fixed length.
 *
 * @param bigint - The unsigned bigint value to convert.
 * @param numberOfBytes - The exact number of bytes to output.
 * @returns A `LeBytes` buffer representing the value in little-endian order.
 *
 * @throws RangeError If `bigint` cannot be represented in `numberOfBytes` bytes.
 */
export function convertBigIntToLeBytes(bigint: bigint, numberOfBytes: number): LeBytes {
        assertFitsInBytes(bigint, numberOfBytes);
        const bytes = new Uint8Array(numberOfBytes);
        for (let i = 0; i < numberOfBytes; i++) {
                bytes[i] = Number(bigint & 0xffn);
                bigint = bigint >> 8n;
        }
        return bytes as LeBytes;
}

/**
 * Converts a bigint into a big-endian byte array of fixed length.
 *
 * @param bigint - The unsigned bigint value to convert.
 * @param numberOfBytes - The exact number of bytes to output.
 * @returns A `BeBytes` buffer representing the value in big-endian order.
 *
 * @throws RangeError If `bigint` cannot be represented in `numberOfBytes` bytes.
 */
export function convertBigIntToBeBytes(bigint: bigint, numberOfBytes: number): BeBytes {
        assertFitsInBytes(bigint, numberOfBytes);
        const bytes = new Uint8Array(numberOfBytes);
        for (let i = 0; i < numberOfBytes; i++) {
                bytes[i] = Number((bigint >> (8n * BigInt(numberOfBytes - i - 1))) & 0xffn);
        }
        return bytes as BeBytes;
}

/**
 * Converts a little-endian byte array into a bigint.
 *
 * @param bytes - The little-endian bytes.
 * @param numberOfBytes - Number of bytes to read from the buffer.
 * @returns The reconstructed bigint value.
 */
export function convertLeBytesToBigInt(bytes: LeBytes, numberOfBytes: number): bigint {
        let bigint = 0n;
        for (let i = 0; i < numberOfBytes; i++) {
                bigint = (bigint << 8n) | BigInt(bytes.at(i)!);
        }
        return bigint;
}

/**
 * Converts a big-endian byte array into a bigint.
 *
 * @param bytes - The big-endian bytes.
 * @param numberOfBytes - Number of bytes to read from the buffer.
 * @returns The reconstructed bigint value.
 */
export function convertBeBytesToBigInt(bytes: BeBytes, numberOfBytes: number): bigint {
        let bigint = 0n;
        for (let i = 0; i < numberOfBytes; i++) {
                bigint = (bigint << 8n) | BigInt(bytes.at(i)!);
        }
        return bigint;
}

/**
 * Converts little-endian bytes to a Node.js `Buffer`.
 */
export function convertLeBytesToBuffer(bytes: LeBytes): Buffer {
        return Buffer.from(bytes);
}
/**
 * Converts big-endian bytes to a Node.js `Buffer`.
 */
export function convertBeBytesToBuffer(bytes: BeBytes): Buffer {
        return Buffer.from(bytes);
}

/**
 * U8 ⇄ bytes (LE / BE) helpers.
 *
 * @remarks
 * These functions assume the underlying bigint already satisfies the U8 range.
 */
export function convertU8ToLeBytes(u8: U8): U8LeBytes {
        return convertBigIntToLeBytes(u8, 1) as unknown as U8LeBytes;
}
export function convertU8ToBeBytes(u8: U8): U8BeBytes {
        return convertBigIntToBeBytes(u8, 1) as unknown as U8BeBytes;
}
export function convertU8LeBytesToU8(u8Bytes: U8LeBytes): U8 {
        return convertLeBytesToBigInt(u8Bytes as unknown as LeBytes, 1) as unknown as U8;
}
export function convertU8BeBytesToU8(u8BeBytes: U8BeBytes): U8 {
        return convertBeBytesToBigInt(u8BeBytes as unknown as BeBytes, 1) as unknown as U8;
}

/**
 * U16 ⇄ bytes (LE / BE) helpers.
 */
export function convertU16ToLeBytes(u16: U16): U16LeBytes {
        return convertBigIntToLeBytes(u16, 2) as unknown as U16LeBytes;
}
export function convertU16ToBeBytes(u16: U16): U16BeBytes {
        return convertBigIntToBeBytes(u16, 2) as unknown as U16BeBytes;
}
export function convertU16LeBytesToU16(u16Bytes: U16LeBytes): U16 {
        return convertLeBytesToBigInt(u16Bytes as unknown as LeBytes, 2) as unknown as U16;
}
export function convertU16BeBytesToU16(u16BeBytes: U16BeBytes): U16 {
        return convertBeBytesToBigInt(u16BeBytes as unknown as BeBytes, 2) as unknown as U16;
}

/**
 * U32 ⇄ bytes (LE / BE) helpers.
 */
export function convertU32ToLeBytes(u32: U32): U32LeBytes {
        return convertBigIntToLeBytes(u32, 4) as unknown as U32LeBytes;
}
export function convertU32ToBeBytes(u32: U32): U32BeBytes {
        return convertBigIntToBeBytes(u32, 4) as unknown as U32BeBytes;
}
export function convertU32LeBytesToU32(u32Bytes: U32LeBytes): U32 {
        return convertLeBytesToBigInt(u32Bytes as unknown as LeBytes, 4) as unknown as U32;
}
export function convertU32BeBytesToU32(u32BeBytes: U32BeBytes): U32 {
        return convertBeBytesToBigInt(u32BeBytes as unknown as BeBytes, 4) as unknown as U32;
}

/**
 * U64 ⇄ bytes (LE / BE) helpers.
 */
export function convertU64ToLeBytes(u64: U64): U64LeBytes {
        return convertBigIntToLeBytes(u64, 8) as unknown as U64LeBytes;
}
export function convertU64ToBeBytes(u64: U64): U64BeBytes {
        return convertBigIntToBeBytes(u64, 8) as unknown as U64BeBytes;
}
export function convertU64LeBytesToU64(u64Bytes: U64LeBytes): U64 {
        return convertLeBytesToBigInt(u64Bytes as unknown as LeBytes, 8) as unknown as U64;
}
export function convertU64BeBytesToU64(u64BeBytes: U64BeBytes): U64 {
        return convertBeBytesToBigInt(u64BeBytes as unknown as BeBytes, 8) as unknown as U64;
}

/**
 * U128 ⇄ bytes (LE / BE) helpers.
 */
export function convertU128ToLeBytes(u128: U128): U128LeBytes {
        return convertBigIntToLeBytes(u128, 16) as unknown as U128LeBytes;
}
export function convertU128ToBeBytes(u128: U128): U128BeBytes {
        return convertBigIntToBeBytes(u128, 16) as unknown as U128BeBytes;
}
export function convertU128LeBytesToU128(u128Bytes: U128LeBytes): U128 {
        return convertLeBytesToBigInt(u128Bytes as unknown as LeBytes, 16) as unknown as U128;
}
export function convertU128BeBytesToU128(u128BeBytes: U128BeBytes): U128 {
        return convertBeBytesToBigInt(u128BeBytes as unknown as BeBytes, 16) as unknown as U128;
}

/**
 * U256 ⇄ bytes (LE / BE) helpers.
 */
export function convertU256ToLeBytes(u256: U256): U256LeBytes {
        return convertBigIntToLeBytes(u256, 32) as unknown as U256LeBytes;
}
export function convertU256ToBeBytes(u256: U256): U256BeBytes {
        return convertBigIntToBeBytes(u256, 32) as unknown as U256BeBytes;
}
export function convertU256LeBytesToU256(u256Bytes: U256LeBytes): U256 {
        return convertLeBytesToBigInt(u256Bytes as unknown as LeBytes, 32) as unknown as U256;
}
export function convertU256BeBytesToU256(u256BeBytes: U256BeBytes): U256 {
        return convertBeBytesToBigInt(u256BeBytes as unknown as BeBytes, 32) as unknown as U256;
}

/**
 * Converts a decimal string representation of an integer into a bigint.
 *
 * @param string - The string to convert (typically base-10 encoded).
 * @returns The corresponding bigint value.
 *
 * @throws SyntaxError If the string is not a valid bigint literal for `BigInt(...)`.
 */
export function convertStringToBigInt(string: string): bigint {
        return BigInt(string);
}
