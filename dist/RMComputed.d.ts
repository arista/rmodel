import { ComputedPropertyOptions } from './Types';
export default class RMComputed<T, R> {
    f: (obj: T) => R;
    options: ComputedPropertyOptions | null;
    constructor(f: (obj: T) => R, options: ComputedPropertyOptions | null);
}
