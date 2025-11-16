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

/**
 * Error thrown when deriving a Program Derived Address (PDA) fails.
 *
 * @remarks
 * This error wraps any lower-level failure that occurs during PDA derivation using
 * `PublicKey.findProgramAddressSync`, providing additional context about which PDA
 * was being computed.
 *
 * @public
 */
export class PdaGenerationError extends Error {
        /**
         * Creates a new instance of PdaGenerationError.
         *
         * @param message - Human-readable error message describing what went wrong
         * @param cause - Optional underlying error that caused this error
         */
        public constructor(message: string, cause?: Error) {
                super(message);
                this.name = this.constructor.name;
                this.cause = cause;

                // Maintains proper stack trace for where our error was thrown (only available on V8)
                if (Error.captureStackTrace) {
                        Error.captureStackTrace(this, this.constructor);
                }
        }
}

/**
 * Derives the PDA for a given nullifier hash.
 *
 * @param nullifierHash - Poseidon hash representing the nullifier to derive the PDA for
 * @returns The program-derived address for the nullifier hash
 *
 * @throws {@link PdaGenerationError} When PDA derivation fails
 */
export function getNullifierHashPda(nullifierHash: PoseidonHash): ProgramDerivedAddress {
        try {
                return PublicKey.findProgramAddressSync(
                        [
                                Buffer.from(NULLIFIER_HASH_PDA_SEED),
                                convertLeBytesToBuffer(nullifierHash as unknown as LeBytes),
                        ],
                        program.programId
                )[0] as ProgramDerivedAddress;
        } catch (error) {
                throw new PdaGenerationError(
                        'Failed to derive nullifier hash PDA',
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Derives the PDA for a user-allotted compliance grant.
 *
 * @param senderPublicKey - Sender's Solana address
 * @param destinationPublicKey - Destination Solana address
 * @param nonce - X25519 nonce associated with the compliance grant
 * @returns The program-derived address for the compliance grant
 *
 * @throws {@link PdaGenerationError} When PDA derivation fails
 */
export function getUserAllotedComplianceGrantPda(
        senderPublicKey: SolanaAddress,
        destinationPublicKey: SolanaAddress,
        nonce: ArciumX25519Nonce
): ProgramDerivedAddress {
        try {
                return PublicKey.findProgramAddressSync(
                        [
                                Buffer.from(USER_ALLOTED_COMPLIANCE_GRANT_PDA_SEED),
                                senderPublicKey.toBuffer(),
                                destinationPublicKey.toBuffer(),
                                convertLeBytesToBuffer(
                                        convertU128ToLeBytes(nonce) as unknown as LeBytes
                                ),
                        ],
                        program.programId
                )[0] as ProgramDerivedAddress;
        } catch (error) {
                throw new PdaGenerationError(
                        'Failed to derive user-allotted compliance grant PDA',
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Derives the PDA for a relayer fees pool.
 *
 * @param relayer - Relayer's Solana address
 * @param instructionSeed - Instruction seed identifying the operation
 * @param mint - SPL token mint address
 * @param accountOffset - Account offset to distinguish multiple fee pools
 * @returns The program-derived address for the relayer fees pool
 *
 * @throws {@link PdaGenerationError} When PDA derivation fails
 */
export function getRelayerFeesPoolPda(
        relayer: SolanaAddress,
        instructionSeed: AccountOffset,
        mint: MintAddress,
        accountOffset: AccountOffset
): ProgramDerivedAddress {
        try {
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
        } catch (error) {
                throw new PdaGenerationError(
                        'Failed to derive relayer fees pool PDA',
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Derives the PDA for a fees configuration account.
 *
 * @param instructionSeed - Instruction seed identifying the operation
 * @param mint - SPL token mint address
 * @param accountOffset - Account offset to distinguish multiple configuration accounts
 * @returns The program-derived address for the fees configuration account
 *
 * @throws {@link PdaGenerationError} When PDA derivation fails
 */
export function getFeesConfigurationPda(
        instructionSeed: AccountOffset,
        mint: MintAddress,
        accountOffset: AccountOffset
): ProgramDerivedAddress {
        try {
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
        } catch (error) {
                throw new PdaGenerationError(
                        'Failed to derive fees configuration PDA',
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Derives the PDA for the Arcium commission fees pool.
 *
 * @param mint - SPL token mint address
 * @param instructionSeed - Instruction seed identifying the operation
 * @param accountOffset - Account offset to distinguish multiple commission pools
 * @returns The program-derived address for the Arcium commission fees pool
 *
 * @throws {@link PdaGenerationError} When PDA derivation fails
 */
export function getArciumCommissionFeesPoolPda(
        mint: MintAddress,
        instructionSeed: AccountOffset,
        accountOffset: AccountOffset
): ProgramDerivedAddress {
        try {
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
        } catch (error) {
                throw new PdaGenerationError(
                        'Failed to derive Arcium commission fees pool PDA',
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Derives the PDA for the public commission fees pool.
 *
 * @param mint - SPL token mint address
 * @param instructionSeed - Instruction seed identifying the operation
 * @param accountOffset - Account offset to distinguish multiple commission pools
 * @returns The program-derived address for the public commission fees pool
 *
 * @throws {@link PdaGenerationError} When PDA derivation fails
 */
export function getPublicCommissionFeesPoolPda(
        mint: MintAddress,
        instructionSeed: AccountOffset,
        accountOffset: AccountOffset
): ProgramDerivedAddress {
        try {
                return PublicKey.findProgramAddressSync(
                        [
                                Buffer.from('public_commission_fees_pool:'),
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
        } catch (error) {
                throw new PdaGenerationError(
                        'Failed to derive public commission fees pool PDA',
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Derives the PDA for a wallet specifier account.
 *
 * @param instructionSeed - Instruction seed used as the wallet specifier key
 * @returns The program-derived address for the wallet specifier
 *
 * @throws {@link PdaGenerationError} When PDA derivation fails
 */
export function getWalletSpecifierPda(instructionSeed: InstructionSeed): ProgramDerivedAddress {
        try {
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
        } catch (error) {
                throw new PdaGenerationError(
                        'Failed to derive wallet specifier PDA',
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Derives the PDA for an Arcium-encrypted user account.
 *
 * @param userPublicKey - User's Solana address
 * @returns The program-derived address for the Arcium-encrypted user account
 *
 * @throws {@link PdaGenerationError} When PDA derivation fails
 */
export function getArciumEncryptedUserAccountPda(
        userPublicKey: SolanaAddress
): ProgramDerivedAddress {
        try {
                return PublicKey.findProgramAddressSync(
                        [Buffer.from('arcium_encrypted_user_account'), userPublicKey.toBuffer()],
                        program.programId
                )[0] as ProgramDerivedAddress;
        } catch (error) {
                throw new PdaGenerationError(
                        'Failed to derive Arcium-encrypted user account PDA',
                        error instanceof Error ? error : undefined
                );
        }
}

/**
 * Derives the PDA for a user's Arcium-encrypted SPL token account.
 *
 * @param userPublicKey - The owner's public key for whom the encrypted token account is derived.
 * @param mint - The SPL token mint address associated with the encrypted token account.
 * @returns The derived `ProgramDerivedAddress` for the Arcium-encrypted token account.
 *
 * @throws {@link PdaGenerationError} When PDA derivation fails (e.g. invalid inputs or program ID).
 *
 * @remarks
 * The PDA is derived using the seed:
 * `["arcium_encrypted_token_account", userPublicKey, mint]`
 * under the Umbra program ID. This PDA is used to store encrypted token account state for a
 * specific user/mint pair.
 */
export function getArciumEncryptedTokenAccountPda(
        userPublicKey: SolanaAddress,
        mint: MintAddress
): ProgramDerivedAddress {
        try {
                return PublicKey.findProgramAddressSync(
                        [
                                Buffer.from('arcium_encrypted_token_account'),
                                userPublicKey.toBuffer(),
                                mint.toBuffer(),
                        ],
                        program.programId
                )[0] as ProgramDerivedAddress;
        } catch (error) {
                throw new PdaGenerationError(
                        'Failed to derive Arcium-encrypted token account PDA',
                        error instanceof Error ? error : undefined
                );
        }
}
