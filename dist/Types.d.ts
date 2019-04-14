export interface Reference {
    referrer: object;
    property: string;
}
export interface ChangeEvent {
    type: string;
}
export interface PropertyChange extends ChangeEvent {
    type: 'PropertyChange';
    target: object;
    property: string;
    oldValue: any | null;
    newValue: any | null;
    hadOwnProperty: boolean;
    hasOwnProperty: boolean;
    added: Array<object> | null;
    removed: Array<object> | null;
}
export interface ArrayChange extends ChangeEvent {
    type: 'ArrayChange';
    target: Array<any | null>;
    index: number;
    deleteCount: number;
    insertCount: number;
    deleted: Array<any | null> | null;
    inserted: Array<any | null> | null;
    oldLength: number;
    newLength: number;
    added: Array<object> | null;
    removed: Array<object> | null;
}
export declare type ChangeListener = (event: ChangeEvent) => void;
export interface ChangeListenerOptions {
    property?: string | null;
    source?: EventSource | null;
}
export declare type EventSource = 'self' | 'children' | 'descendants';
export interface Dependency {
    type: string;
}
export interface PropertyDependency extends Dependency {
    type: 'PropertyDependency';
    target: object;
    property: string;
}
export interface RootDependency extends Dependency {
    type: 'RootDependency';
    target: object;
}
export interface ParentDependency extends Dependency {
    type: 'ParentDependency';
    target: object;
}
export interface PropertyNameDependency extends Dependency {
    type: 'PropertyNameDependency';
    target: object;
}
export interface IdDependency extends Dependency {
    type: 'IdDependency';
    target: object;
}
export interface FindByIdDependency extends Dependency {
    type: 'FindByIdDependency';
    target: object;
    id: string;
}
export interface ComputedPropertyOptions {
    immediate?: ?boolean;
}
export declare type ImmutableListener = (event: ImmutableChangeEvent) => void;
export interface ImmutableChangeEvent {
    type: 'ImmutableChange';
    oldValue: object;
    newValue: object;
}
