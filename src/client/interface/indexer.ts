import { PoseidonHash, U64 } from '@/types';

/**
 * Abstract interface for fetching on-chain indexing data required by Umbra clients.
 *
 * @remarks
 * Concrete implementations typically query an indexing service (or RPC) to provide
 * Merkle tree data that is too expensive to recompute client-side. Methods on this
 * interface are intentionally minimal so different environments (browser, node,
 * server, etc.) can supply their own transport + caching layers.
 */
export abstract class IIndexer {
        /**
         * Retrieves the sibling nodes for the Merkle path at a given commitment index.
         *
         * @param index - Zero-based insertion index of the commitment in the Merkle tree.
         *
         * @returns Promise resolving to the ordered list of Poseidon hashes that form the
         * Merkle proof from leaf to root (one hash per tree level).
         *
         * @throws Implementations should throw an error when the index is out of range or
         * when the sibling data cannot be fetched.
         */
        public abstract getMerkleSiblings(index: U64): Promise<Array<PoseidonHash>>;
}
