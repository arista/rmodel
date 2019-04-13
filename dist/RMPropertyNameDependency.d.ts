import RMDependency from './RMDependency';
import RMNode from './RMNode';
import { Dependency } from './Types';
export default class RMPropertyNameDependency extends RMDependency {
    target: RMNode;
    constructor(target: RMNode);
    toDependency(toExternalValue: (node: RMNode) => object): Dependency;
    matchesPropertyNameDependency(node: RMNode): boolean;
    addListeners(f: () => void): void;
    removeListeners(f: () => void): void;
}
