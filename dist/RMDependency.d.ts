import RMNode from './RMNode';
import { Dependency } from './Types';
export default class RMDependency {
    constructor();
    toDependency(toExternalValue: (node: RMNode) => object): Dependency;
    matchesPropertyDependency(node: RMNode, property: string): boolean;
    matchesRootDependency(node: RMNode): boolean;
    matchesParentDependency(node: RMNode): boolean;
    matchesPropertyNameDependency(node: RMNode): boolean;
    matchesIdDependency(node: RMNode): boolean;
    matchesFindByIdDependency(node: RMNode, id: string): boolean;
    addListeners(f: () => void): void;
    removeListeners(f: () => void): void;
}
