import { UmbraWallet } from '@/client/umbra-wallet';
import { ITransactionForwarder } from './interface';
import { SolanaTransactionSignature } from '@/types';
import { ConnectionBasedForwarder } from '@/client/implementation/connection-based-forwarder';
export class UmbraClient<T = SolanaTransactionSignature> {
        public readonly umbraWallets: Array<UmbraWallet>;
        public readonly txForwarders: Array<ITransactionForwarder<T>>;
        public readonly relayerForwarders: Array<RelayerForwarder>;
        public readonly connectionBasedForwarder: ConnectionBasedForwarder;
}
