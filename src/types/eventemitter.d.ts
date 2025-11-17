declare module 'eventemitter' {
  export default class EventEmitter {
    constructor();
    addListener(event: string | symbol, listener: (...args: unknown[]) => void): this;
    on(event: string | symbol, listener: (...args: unknown[]) => void): this;
    once(event: string | symbol, listener: (...args: unknown[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: unknown[]) => void): this;
    off(event: string | symbol, listener: (...args: unknown[]) => void): this;
    emit(event: string | symbol, ...args: unknown[]): boolean;
    removeAllListeners(event?: string | symbol): this;
  }
}

