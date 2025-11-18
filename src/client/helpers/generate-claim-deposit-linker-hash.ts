import {
        Day,
        Hour,
        Minute,
        Month,
        PoseidonHash,
        Second,
        SolanaAddress,
        Time,
        U128,
        U64,
        Year,
} from '@/types';
import { generateIndividualTransactionViewingKey } from '@/client/helpers/generate-individual-transaction-viewing-key';
import { breakPublicKeyIntoTwoParts, convertU256LeBytesToU256, PoseidonHasher } from '@/utils';

export function generateClaimDepositLinkerHash(
        masterViewingKey: U128,
        purpose: 'claim_spl_deposit_with_hidden_amount' | 'claim_spl_deposit_with_public_amount',
        time: Time,
        commitmentInsertionIndex: U64
): PoseidonHash {
        const dateObj = new Date(Number(time) * 1000);
        const year = dateObj.getUTCFullYear();
        const month = dateObj.getUTCMonth() + 1; // Months are zero-based
        const day = dateObj.getUTCDate();
        const hour = dateObj.getUTCHours();
        const minute = dateObj.getUTCMinutes();
        const second = dateObj.getUTCSeconds();

        const individualTransactionViewingKey = generateIndividualTransactionViewingKey(
                masterViewingKey,
                purpose,
                BigInt(year) as Year,
                BigInt(month) as Month,
                BigInt(day) as Day,
                BigInt(hour) as Hour,
                BigInt(minute) as Minute,
                BigInt(second) as Second
        );

        return PoseidonHasher.hash([
                convertU256LeBytesToU256(individualTransactionViewingKey),
                commitmentInsertionIndex,
        ]);
}

export function generateCreateDepositLinkerHash(
        masterViewingKey: U128,
        purpose: 'create_spl_deposit_with_hidden_amount' | 'create_spl_deposit_with_public_amount',
        time: Time,
        address: SolanaAddress
): PoseidonHash {
        const dateObj = new Date(Number(time) * 1000);
        const year = dateObj.getUTCFullYear();
        const month = dateObj.getUTCMonth() + 1; // Months are zero-based
        const day = dateObj.getUTCDate();
        const hour = dateObj.getUTCHours();
        const minute = dateObj.getUTCMinutes();
        const second = dateObj.getUTCSeconds();

        const [addressLow, addressHigh] = breakPublicKeyIntoTwoParts(address);

        const individualTransactionViewingKey = generateIndividualTransactionViewingKey(
                masterViewingKey,
                purpose,
                BigInt(year) as Year,
                BigInt(month) as Month,
                BigInt(day) as Day,
                BigInt(hour) as Hour,
                BigInt(minute) as Minute,
                BigInt(second) as Second
        );

        return PoseidonHasher.hash([
                convertU256LeBytesToU256(individualTransactionViewingKey),
                addressLow,
                addressHigh,
        ]);
}
