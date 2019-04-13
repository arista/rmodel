import RMDependencyTracker from './RMDependencyTracker';
import RMNode from './RMNode';
export default class RMDependencyTrackers {
    dependencyTrackers: Array<RMDependencyTracker>;
    constructor();
    static trackDependencies(f: () => void): RMDependencyTracker;
    static readonly current: RMDependencyTracker | null;
    static addPropertyDependency(node: RMNode, property: string): void;
    static addRootDependency(node: RMNode): void;
    static addParentDependency(node: RMNode): void;
    static addPropertyNameDependency(node: RMNode): void;
    static addIdDependency(node: RMNode): void;
    static addFindByIdDependency(node: RMNode, id: string): void;
}
