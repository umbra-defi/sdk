import { IIndexer } from '@/client/interface';
import { INDEXER_BASE_URL } from '@/constants';
import { PoseidonHash, U64 } from '@/types';
import { convertHexStringToPoseidonHash } from '@/utils';

type HexString = string;

/**
 * AWS-hosted indexer implementation that fetches Merkle proofs over HTTP.
 *
 * @remarks
 * This class encapsulates the networking logic necessary to retrieve Merkle siblings
 * for a given insertion index from an AWS API Gateway (or similar) endpoint. The
 * endpoint is expected to return JSON payloads containing the proof and metadata,
 * which are converted into strongly typed Poseidon hashes for downstream consumers.
 */
export class AwsIndexer extends IIndexer {
        public readonly baseUrl: string;

        private constructor(baseUrl: string) {
                super();
                this.baseUrl = baseUrl;
        }

        /**
         * Factory helper that creates an instance bound to a specific base URL.
         *
         * @param baseUrl - Fully qualified URL hosting the Merkle proof endpoint; the commitment
         * index will be appended to this prefix for each request.
         */
        public static fromBaseUrl(baseUrl: string): AwsIndexer {
                return new AwsIndexer(baseUrl);
        }

        /**
         * Fetches the Poseidon-hash siblings that constitute the Merkle proof for a commitment index.
         *
         * @param index - Zero-based position of the commitment in the Merkle tree.
         *
         * @throws {@link Error} When the network request fails, the response is non-OK, JSON parsing
         * fails, or the returned payload does not contain a proof array.
         */
        public override async getMerkleSiblings(index: U64): Promise<Array<PoseidonHash>> {
                const requestUrl = `${this.baseUrl ?? INDEXER_BASE_URL}${index.toString()}`;

                let response: Response;
                try {
                        response = await fetch(requestUrl);
                } catch (error) {
                        throw new Error(
                                `Failed to fetch Merkle siblings from AWS indexer: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                if (!response.ok) {
                        throw new Error(
                                `AWS indexer responded with ${response.status} ${response.statusText} for URL ${requestUrl}`
                        );
                }

                let data: {
                        index: number;
                        proof: Array<HexString>;
                        depth: number;
                        leaf_count: number;
                };
                try {
                        data = (await response.json()) as {
                                index: number;
                                proof: Array<HexString>;
                                depth: number;
                                leaf_count: number;
                        };
                } catch (error) {
                        throw new Error(
                                `Failed to parse AWS indexer response: ${
                                        error instanceof Error ? error.message : String(error)
                                }`
                        );
                }

                if (!Array.isArray(data.proof)) {
                        throw new Error('AWS indexer response is missing a proof array.');
                }

                return data.proof.map(convertHexStringToPoseidonHash);
        }
}
