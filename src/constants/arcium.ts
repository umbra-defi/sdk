import { program } from '@/idl';
import { ArciumX25519PublicKey } from '@/types';
import {
        getClusterAccAddress,
        getExecutingPoolAccAddress,
        getMempoolAccAddress,
        getMXEAccAddress,
} from '@arcium-hq/client';

export const MXE_ARCIUM_X25519_PUBLIC_KEY: ArciumX25519PublicKey = new Uint8Array([
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00,
]) as ArciumX25519PublicKey;

export const CLUSTER_OFFSET = 0;

export const DEFAULT_SIGNING_MESSAGE = new TextEncoder().encode(
        'Umbra Privacy - do NOT sign this message unless you are using an application or integration with Umbra Privacy! Proceed cautiously as this signature will be used to derive sensitive information that can be used to control/transact/decrypt balances and funds from your Umbra Accounts.'
);

export const ARCIUM_CLUSTER_ACCOUNT = getClusterAccAddress(CLUSTER_OFFSET);
export const ARCIUM_MXE_ACCOUNT = getMXEAccAddress(program.programId);
export const ARCIUM_MEMPOOL_ACCOUNT = getMempoolAccAddress(program.programId);
export const ARCIUM_EXECUTING_POOL_ACCOUNT = getExecutingPoolAccAddress(program.programId);
