import { RootChangeListener } from './InternalTypes';
export default class RMRootChangeListener {
    listener: RootChangeListener;
    constructor(listener: RootChangeListener);
    matches(listener: RootChangeListener): boolean;
}
