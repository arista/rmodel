import { FindByIdChangeListener } from './InternalTypes';
export default class RMFindByIdChangeListener {
    listener: FindByIdChangeListener;
    id: string;
    constructor(listener: FindByIdChangeListener, id: string);
    matches(listener: FindByIdChangeListener, id: string): boolean;
}
