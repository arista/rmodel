export interface RootChangeEvent {
    type: 'RootChange';
    target: object;
    oldValue: object;
    newValue: object;
}
export declare type RootChangeListener = (event: RootChangeEvent) => void;
export interface ParentChangeEvent {
    type: 'ParentChange';
    target: object;
    oldValue: object | null;
    newValue: object | null;
}
export declare type ParentChangeListener = (event: ParentChangeEvent) => void;
export interface PropertyNameChangeEvent {
    type: 'PropertyNameChange';
    target: object;
    oldValue: string | null;
    newValue: string | null;
}
export declare type PropertyNameChangeListener = (event: PropertyNameChangeEvent) => void;
export interface IdChangeEvent {
    type: 'IdChange';
    target: object;
    oldValue: string | null;
    newValue: string | null;
}
export declare type IdChangeListener = (event: IdChangeEvent) => void;
export interface FindByIdChangeEvent {
    type: 'FindByIdChange';
    target: Object;
    id: string;
    oldValue: object | null;
    newValue: object | null;
}
export declare type FindByIdChangeListener = (event: FindByIdChangeEvent) => void;
