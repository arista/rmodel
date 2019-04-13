import RMDependency from './RMDependency';
import RMNode from './RMNode';
import { Dependency } from './Types';
export default class RMParentDependency extends RMDependency {
    target: RMNode;
    constructor(target: RMNode);
    toDependency(toExternalValue: (node: RMNode) => object): Dependency;
    matchesParentDependency(node: RMNode): boolean;
    addListeners(f: () => void): void;
    removeListeners(f: () => void): void;
}
