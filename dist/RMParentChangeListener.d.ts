import { ParentChangeListener } from './InternalTypes';
export default class RMParentChangeListener {
    listener: ParentChangeListener;
    constructor(listener: ParentChangeListener);
    matches(listener: ParentChangeListener): boolean;
}
