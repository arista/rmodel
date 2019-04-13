import RMBufferedCall from './RMBufferedCall';
export default class RMBufferedCalls {
    calls: Array<RMBufferedCall>;
    callsByKey: Map<any, RMBufferedCall>;
    flushing: boolean;
    flushCall: () => void;
    constructor();
    add(key: any, f: () => void, priority?: number): void;
    registerFlushCallback(): void;
    flush(): void;
    static getInsertionPoint(arr: Array<RMBufferedCall>, entry: RMBufferedCall): number;
    static bufferCall(key: any, f: () => void, priority?: number): void;
    static flushBufferedCalls(): void;
    static bufferImmutableTrackerCall(key: any, f: () => void): void;
    static bufferComputedPropertyCall(key: any, f: () => void): void;
}
