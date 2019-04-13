import RMDependency from './RMDependency';
import RMNode from './RMNode';
import { Dependency } from './Types';
export default class RMRootDependency extends RMDependency {
    target: RMNode;
    constructor(target: RMNode);
    toDependency(toExternalValue: (node: RMNode) => Object): Dependency;
    matchesRootDependency(node: RMNode): boolean;
    addListeners(f: () => void): void;
    removeListeners(f: () => void): void;
}
