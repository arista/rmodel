export interface Reference {
    referrer: object;
    property: string;
}
export declare type ChangeEvent = PropertyChange | ArrayChange;
export interface PropertyChange {
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
export interface ArrayChange {
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
export declare type Dependency = PropertyDependency | RootDependency | ParentDependency | PropertyNameDependency | IdDependency | FindByIdDependency;
export interface PropertyDependency {
    type: 'PropertyDependency';
    target: object;
    property: string;
}
export interface RootDependency {
    type: 'RootDependency';
    target: object;
}
export interface ParentDependency {
    type: 'ParentDependency';
    target: object;
}
export interface PropertyNameDependency {
    type: 'PropertyNameDependency';
    target: object;
}
export interface IdDependency {
    type: 'IdDependency';
    target: object;
}
export interface FindByIdDependency {
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
