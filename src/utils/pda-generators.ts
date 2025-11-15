import {
        AccountOffset,
        ArciumX25519Nonce,
        InstructionSeed,
        LeBytes,
        MintAddress,
        PoseidonHash,
        ProgramDerivedAddress,
        SolanaAddress,
        U32,
} from '@/types';
import { PublicKey } from '@solana/web3.js';
import {
        convertLeBytesToBuffer,
        convertU128ToLeBytes,
        convertU16ToLeBytes,
        convertU32ToLeBytes,
} from '@/utils/convertors';
import { program } from '@/idl';
import {
        NULLIFIER_HASH_PDA_SEED,
        USER_ALLOTED_COMPLIANCE_GRANT_PDA_SEED,
} from '@/constants/anchor';

export function getNullifierHashPda(nullifierHash: PoseidonHash): ProgramDerivedAddress {
        return PublicKey.findProgramAddressSync(
                [Buffer.from(NULLIFIER_HASH_PDA_SEED), convertLeBytesToBuffer(nullifierHash)],
                program.programId
        )[0] as ProgramDerivedAddress;
}

export function getUserAllotedComplianceGrantPda(
        senderPublicKey: SolanaAddress,
        destinationPublicKey: SolanaAddress,
        nonce: ArciumX25519Nonce
): ProgramDerivedAddress {
        return PublicKey.findProgramAddressSync(
                [
                        Buffer.from(USER_ALLOTED_COMPLIANCE_GRANT_PDA_SEED),
                        senderPublicKey.toBuffer(),
                        destinationPublicKey.toBuffer(),
                        convertLeBytesToBuffer(convertU128ToLeBytes(nonce) as unknown as LeBytes),
                ],
                program.programId
        )[0] as ProgramDerivedAddress;
}

export function getRelayerFeesPoolPda(
        relayer: SolanaAddress,
        instructionSeed: AccountOffset,
        mint: MintAddress,
        accountOffset: AccountOffset
): ProgramDerivedAddress {
        return PublicKey.findProgramAddressSync(
                [
                        Buffer.from('relayer_fees_pool:'),
                        convertLeBytesToBuffer(
                                convertU16ToLeBytes(instructionSeed) as unknown as LeBytes
                        ),
                        relayer.toBuffer(),
                        mint.toBuffer(),
                        convertLeBytesToBuffer(
                                convertU16ToLeBytes(accountOffset) as unknown as LeBytes
                        ),
                ],
                program.programId
        )[0] as ProgramDerivedAddress;
}

export function getFeesConfigurationPda(
        instructionSeed: AccountOffset,
        mint: MintAddress,
        accountOffset: AccountOffset
): ProgramDerivedAddress {
        return PublicKey.findProgramAddressSync(
                [
                        Buffer.from('fees_configuration:'),
                        convertLeBytesToBuffer(
                                convertU16ToLeBytes(instructionSeed) as unknown as LeBytes
                        ),
                        mint.toBuffer(),
                        convertLeBytesToBuffer(
                                convertU16ToLeBytes(accountOffset) as unknown as LeBytes
                        ),
                ],
                program.programId
        )[0] as ProgramDerivedAddress;
}

export function getArciumCommissionFeesPoolPda(
        mint: MintAddress,
        instructionSeed: AccountOffset,
        accountOffset: AccountOffset
): ProgramDerivedAddress {
        return PublicKey.findProgramAddressSync(
                [
                        Buffer.from('arcium_commission_fees_pool:'),
                        convertLeBytesToBuffer(
                                convertU16ToLeBytes(instructionSeed) as unknown as LeBytes
                        ),
                        mint.toBuffer(),
                        convertLeBytesToBuffer(
                                convertU16ToLeBytes(accountOffset) as unknown as LeBytes
                        ),
                ],
                program.programId
        )[0] as ProgramDerivedAddress;
}

export function getWalletSpecifierPda(instructionSeed: InstructionSeed): ProgramDerivedAddress {
        return PublicKey.findProgramAddressSync(
                [
                        Buffer.from('wallet_specifier:'),
                        convertLeBytesToBuffer(
                                convertU32ToLeBytes(
                                        instructionSeed as unknown as U32
                                ) as unknown as LeBytes
                        ),
                ],
                program.programId
        )[0] as ProgramDerivedAddress;
}
