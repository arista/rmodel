import RMNode from './RMNode';
import RMComputed from './RMComputed';
import { ChangeListenerOptions } from './Types';
import { ChangeListener } from './Types';
import { Reference } from './Types';
import { Dependency } from './Types';
import { ComputedPropertyOptions } from './Types';
import { ImmutableListener } from './Types';
export default class RMGlobal {
    static toRModel(value: any): any;
    static isRoot(value: any): boolean;
    static getRoot(value: any): object | null;
    static getParent(value: any): object | null;
    static getProperty(value: any): string | null;
    static getPrimaryReference(value: any): Reference | null;
    static getSecondaryReferences(value: any): Reference[];
    static hasRModel(value: any): boolean;
    static getManagedValue(value: any): boolean;
    static addChangeListener(value: any, listener: ChangeListener, options?: ChangeListenerOptions | null): void;
    static removeChangeListener(value: any, listener: ChangeListener, options?: ChangeListenerOptions | null): void;
    static findDependencies(func: () => void): Array<Dependency>;
    static bufferCall(key: any, f: () => void): void;
    static flushBufferedCalls(): void;
    static addComputedProperty<T, R>(value: T, property: string, f: (obj: T) => R, options?: ComputedPropertyOptions | null): void;
    static removeComputedProperty(value: any, property: string): void;
    static setId(value: any, id: string): void;
    static getId(value: any): string | null;
    static deleteId(value: any): void;
    static findById(value: any, id: string): object | null;
    static setImmutable(value: any, listener: ImmutableListener): object;
    static requireNodeForValue(value: any): RMNode;
    static requireConnectedOrDisconnectedNodeForValue(value: any): RMNode;
    static getObjectForNode(node: RMNode | null): object | null;
    static requireObjectForNode(node: RMNode): object;
    static computed<T, R>(f: (obj: T) => R, options?: ComputedPropertyOptions | null): RMComputed<T, R>;
}
