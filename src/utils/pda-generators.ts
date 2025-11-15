import { PoseidonHash, ProgramDerivedAddress } from '@/types';
import { PublicKey } from '@solana/web3.js';
import { convertLeBytesToBuffer } from '@/utils/convertors';
import { program } from '@/idl';

export function getNullifierHashPda(nullifierHash: PoseidonHash): ProgramDerivedAddress {
        return PublicKey.findProgramAddressSync(
                [Buffer.from('nullifier_hash:'), convertLeBytesToBuffer(nullifierHash)],
                program.programId
        )[0] as ProgramDerivedAddress;
}
