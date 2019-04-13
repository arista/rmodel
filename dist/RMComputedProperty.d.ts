import RMNode from './RMNode';
import RMDependencyTracker from './RMDependencyTracker';
import { ComputedPropertyOptions } from './Types';
export default class RMComputedProperty<T, R> {
    target: RMNode;
    property: string;
    f: (obj: T) => R;
    options: ComputedPropertyOptions | null;
    targetObject: T;
    value: R | null;
    dependencies: RMDependencyTracker | null;
    computeValueCall: () => void;
    dependencyChangedCall: () => void;
    computeAndAssignValueCall: () => void;
    constructor(target: RMNode, targetObject: T, property: string, f: (obj: T) => R, options: ComputedPropertyOptions | null);
    computeValue(): void;
    computeAndAssignValue(): void;
    dependencyChanged(): void;
    updateListeners(oldDependencies: RMDependencyTracker | null, newDependencies: RMDependencyTracker): void;
    disconnect(): void;
}
