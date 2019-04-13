import { IdChangeListener } from './InternalTypes';
export default class RMIdChangeListener {
    listener: IdChangeListener;
    constructor(listener: IdChangeListener);
    matches(listener: IdChangeListener): boolean;
}
