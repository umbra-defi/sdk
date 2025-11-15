import { Bytes, I32, I64, U128, U16, U32, U64, U8 } from '@/types/common';
import BN from 'bn.js';

export type FlagBits = U8;
export type Amount = U128;
export type BasisPoints = U16;
export type AccountOffset = U16;
export type EphemeralOffset = U128;
export type Year = I32;
export type Month = U32;
export type Day = U32;
export type Hour = U32;
export type Minute = U32;
export type Second = U32;
export type Boolean = boolean;
export type Slot = U64;
export type RiskThreshold = Bytes & { _brand: 'RiskThreshold'; length: 16 };
export type NumberOfTransactions = U128;
export type InstructionSeed = U16;
export type Time = I64;

export type Plaintext = bigint;

export type FlagBitsTransactionInput = { 0: BN };
export type AmountTransactionInput = { 0: BN };
export type BasisPointsTransactionInput = { 0: number };
export type AccountOffsetTransactionInput = { 0: number };
export type EphemeralOffsetTransactionInput = { 0: BN };
export type YearTransactionInput = { 0: BN };
export type MonthTransactionInput = { 0: BN };
export type DayTransactionInput = { 0: BN };
export type HourTransactionInput = { 0: BN };
export type MinuteTransactionInput = { 0: BN };
export type SecondTransactionInput = { 0: BN };
export type BooleanTransactionInput = { 0: boolean };
export type SlotTransactionInput = { 0: BN };
export type RiskThresholdTransactionInput = { 0: Array<number> };
export type NumberOfTransactionsTransactionInput = { 0: BN };
export type InstructionSeedTransactionInput = { 0: number };
export type TimeTransactionInput = { 0: BN };

export function convertFlagBitsToTransactionInput(flagBits: FlagBits): FlagBitsTransactionInput {
        return { 0: new BN(flagBits) };
}

export function convertAmountToTransactionInput(amount: Amount): AmountTransactionInput {
        return { 0: new BN(amount) };
}

export function convertBasisPointsToTransactionInput(
        basisPoints: BasisPoints
): BasisPointsTransactionInput {
        return { 0: Number(basisPoints) };
}

export function convertAccountOffsetToTransactionInput(
        accountOffset: AccountOffset
): AccountOffsetTransactionInput {
        return { 0: Number(accountOffset) };
}

export function convertEphemeralOffsetToTransactionInput(
        ephemeralOffset: EphemeralOffset
): EphemeralOffsetTransactionInput {
        return { 0: new BN(ephemeralOffset) };
}

export function convertYearToTransactionInput(year: Year): YearTransactionInput {
        return { 0: new BN(year) };
}

export function convertMonthToTransactionInput(month: Month): MonthTransactionInput {
        return { 0: new BN(month) };
}

export function convertDayToTransactionInput(day: Day): DayTransactionInput {
        return { 0: new BN(day) };
}

export function convertHourToTransactionInput(hour: Hour): HourTransactionInput {
        return { 0: new BN(hour) };
}

export function convertMinuteToTransactionInput(minute: Minute): MinuteTransactionInput {
        return { 0: new BN(minute) };
}

export function convertSecondToTransactionInput(second: Second): SecondTransactionInput {
        return { 0: new BN(second) };
}

export function convertBooleanToTransactionInput(boolean: Boolean): BooleanTransactionInput {
        return { 0: boolean };
}

export function convertSlotToTransactionInput(slot: Slot): SlotTransactionInput {
        return { 0: new BN(slot) };
}

export function convertRiskThresholdToTransactionInput(
        riskThreshold: RiskThreshold
): RiskThresholdTransactionInput {
        return { 0: Array.from(riskThreshold) };
}

export function convertNumberOfTransactionsToTransactionInput(
        numberOfTransactions: NumberOfTransactions
): NumberOfTransactionsTransactionInput {
        return { 0: new BN(numberOfTransactions) };
}

export function convertInstructionSeedToTransactionInput(
        instructionSeed: InstructionSeed
): InstructionSeedTransactionInput {
        return { 0: Number(instructionSeed) };
}

export function convertTimeToTransactionInput(time: Time): TimeTransactionInput {
        return { 0: new BN(time) };
}
