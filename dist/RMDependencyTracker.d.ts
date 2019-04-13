import RMDependency from './RMDependency';
import RMNode from './RMNode';
export default class RMDependencyTracker {
    dependencies: Array<RMDependency> | null;
    constructor();
    addPropertyDependency(node: RMNode, property: string): void;
    hasPropertyDependency(node: RMNode, property: string): boolean;
    addRootDependency(node: RMNode): void;
    hasRootDependency(node: RMNode): boolean;
    addParentDependency(node: RMNode): void;
    hasParentDependency(node: RMNode): boolean;
    addPropertyNameDependency(node: RMNode): void;
    hasPropertyNameDependency(node: RMNode): boolean;
    addIdDependency(node: RMNode): void;
    hasIdDependency(node: RMNode): boolean;
    addFindByIdDependency(node: RMNode, id: string): void;
    hasFindByIdDependency(node: RMNode, id: string): boolean;
    addListeners(f: () => void): void;
    removeListeners(f: () => void): void;
}
