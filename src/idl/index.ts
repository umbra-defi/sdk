export * from '@/idl/idl';
import { Program, Wallet } from '@coral-xyz/anchor';
import { AnchorProvider } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';
import { Umbra } from '@/idl/idl';
import idl from '@/idl/idl.json';

export const program: Program<Umbra> = new Program(
        idl,
        new AnchorProvider(
                new Connection('https://api.devnet.solana.com'),
                new Wallet(Keypair.generate())
        )
);
