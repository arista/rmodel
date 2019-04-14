import { ChangeListenerOptions } from './Types';
import { ChangeListener } from './Types';
import { Reference } from './Types';
import { Dependency } from './Types';
import { ComputedPropertyOptions } from './Types';
import { ImmutableListener } from './Types';
declare const rmodel: ((value: any) => any) & {
    isRoot: (value: any) => boolean;
    root: (value: any) => object | null;
    parent: (value: any) => object | null;
    property: (value: any) => string | null;
    primaryReference: (value: any) => Reference | null;
    secondaryReferences: (value: any) => Reference[];
    hasRModel: (value: any) => boolean;
    managedValue: (value: any) => any;
    addChangeListener: (value: any, listener: ChangeListener, options?: ChangeListenerOptions | null) => void;
    removeChangeListener: (value: any, listener: ChangeListener, options?: ChangeListenerOptions | null) => void;
    findDependencies: (func: () => void) => Dependency[];
    bufferCall: (key: any, f: () => void) => void;
    flushBufferedCalls: () => void;
    addComputedProperty: <T, R>(value: T, property: string, f: (obj: T) => R, options?: ComputedPropertyOptions | null) => void;
    removeComputedProperty: (value: any, property: string) => void;
    setId: (value: any, id: string) => void;
    getId: (value: any) => string | null;
    deleteId: (value: any) => void;
    findById: (value: any, id: string) => object | null;
    setImmutable: (value: any, listener: ImmutableListener) => object;
};
export default rmodel;
