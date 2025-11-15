import {
        ArciumX25519Nonce,
        LeBytes,
        PoseidonHash,
        ProgramDerivedAddress,
        SolanaAddress,
} from '@/types';
import { PublicKey } from '@solana/web3.js';
import { convertLeBytesToBuffer, convertU128ToLeBytes } from '@/utils/convertors';
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
