import { ITransactionForwarder } from '@/client/interface';
import { SolanaTransactionSignature } from '@/types';

export class UmbraClient {
        private readonly connectionBasedForwarder: ITransactionForwarder<SolanaTransactionSignature>;
        private r;
}
