import RMDependency from './RMDependency';
import RMNode from './RMNode';
import { Dependency } from './Types';
import { ChangeListenerOptions } from './Types';
export default class RMPropertyDependency extends RMDependency {
    target: RMNode;
    property: string;
    constructor(target: RMNode, property: string);
    toDependency(toExternalValue: (node: RMNode) => object): Dependency;
    matchesPropertyDependency(node: RMNode, property: string): boolean;
    addListeners(f: () => void): void;
    removeListeners(f: () => void): void;
    readonly changeListenerOptions: ChangeListenerOptions;
}
