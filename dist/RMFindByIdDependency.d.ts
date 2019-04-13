import RMDependency from './RMDependency';
import RMNode from './RMNode';
import { Dependency } from './Types';
export default class RMIdDependency extends RMDependency {
    target: RMNode;
    id: string;
    constructor(target: RMNode, id: string);
    toDependency(toExternalValue: (node: RMNode) => object): Dependency;
    matchesFindByIdDependency(node: RMNode, id: string): boolean;
    addListeners(f: () => void): void;
    removeListeners(f: () => void): void;
}
