import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Keypair } from '@solana/web3.js';

/**
 * Loads the default Solana CLI keypair from `~/.config/solana/id.json`.
 *
 * @returns A {@link Keypair} constructed from the local secret key.
 *
 * @remarks
 * This helper is intended for local integration tests only. It assumes that:
 * - You have the Solana CLI installed.
 * - You have a keypair at `~/.config/solana/id.json`.
 *
 * Never use this in production code; it is meant purely for testing and development.
 */
export function loadLocalKeypair(): Keypair {
        const keypairPath = join(homedir(), '.config', 'solana', 'id.json');
        const raw = readFileSync(keypairPath, 'utf8');
        const secretKey = Uint8Array.from(JSON.parse(raw) as number[]);
        return Keypair.fromSecretKey(secretKey);
}
