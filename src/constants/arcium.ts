import { ArciumX25519PublicKey } from '@/types';

export const MXE_ARCIUM_X25519_PUBLIC_KEY: ArciumX25519PublicKey = new Uint8Array([
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00,
]) as ArciumX25519PublicKey;

export const DEFAULT_SIGNING_MESSAGE = new TextEncoder().encode(
        'Umbra Privacy - do NOT sign this message unless you are using an application or integration with Umbra Privacy! Proceed cautiously as this signature will be used to derive sensitive information that can be used to control/transact/decrypt balances and funds from your Umbra Accounts.'
);
