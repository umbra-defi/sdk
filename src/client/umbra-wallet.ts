import { U128 } from '@/types';
import { ISigner } from '@/client/interface';

export abstract class UmbraWallet {
        private readonly signer: ISigner;
        private readonly masterViewingKey: U128;
}
