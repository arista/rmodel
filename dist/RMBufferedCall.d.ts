export default class RMBufferedCall {
    key: any;
    call: () => void;
    priority: number;
    constructor(key: any, call: () => void, priority: number);
}
