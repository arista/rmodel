import { PropertyNameChangeListener } from './InternalTypes';
export default class RMPropertyNameChangeListener {
    listener: PropertyNameChangeListener;
    constructor(listener: PropertyNameChangeListener);
    matches(listener: PropertyNameChangeListener): boolean;
}
