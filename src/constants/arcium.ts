import { program } from '@/idl';
import { ArciumX25519PublicKey } from '@/types';
import {
        getClusterAccAddress,
        getExecutingPoolAccAddress,
        getMempoolAccAddress,
        getMXEAccAddress,
} from '@arcium-hq/client';

export const MXE_ARCIUM_X25519_PUBLIC_KEY: ArciumX25519PublicKey = new Uint8Array([
        27, 146, 220, 227, 8, 51, 189, 69, 119, 116, 110, 176, 137, 108, 212, 154, 185, 95, 149, 7,
        4, 186, 213, 240, 72, 99, 178, 235, 183, 45, 153, 36,
]) as ArciumX25519PublicKey;

export const CLUSTER_OFFSET = 768109697;

export const DEFAULT_SIGNING_MESSAGE = new TextEncoder().encode(
        'Umbra Privacy - do NOT sign this message unless you are using an application or integration with Umbra Privacy! Proceed cautiously as this signature will be used to derive sensitive information that can be used to control/transact/decrypt balances and funds from your Umbra Accounts.'
);

export const ARCIUM_CLUSTER_ACCOUNT = getClusterAccAddress(CLUSTER_OFFSET);
export const ARCIUM_MXE_ACCOUNT = getMXEAccAddress(program.programId);
export const ARCIUM_MEMPOOL_ACCOUNT = getMempoolAccAddress(program.programId);
export const ARCIUM_EXECUTING_POOL_ACCOUNT = getExecutingPoolAccAddress(program.programId);
