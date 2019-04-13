import RMNode from './RMNode';
export default class RMReference {
    referrer: RMNode;
    property: string;
    constructor(referrer: RMNode, property: string);
    equals(ref: RMReference | null): boolean;
    matches(referrer: RMNode, property: string): boolean;
    disconnect(): void;
}
