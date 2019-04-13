import { ImmutableListener } from './Types';
import RMNode from './RMNode';
export default class RMImmutableTracker {
    node: RMNode;
    listener: ImmutableListener;
    changedNodes: Array<RMNode> | null;
    flushCall: () => void;
    constructor(node: RMNode, listener: ImmutableListener);
    addChangedNode(node: RMNode): void;
    flush(): void;
}
