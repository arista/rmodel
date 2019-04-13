import RMNode from './RMNode';
import { ChangeListenerOptions } from './Types';
import { ChangeListener } from './Types';
export default class RMChangeListener {
    listener: ChangeListener;
    options: ChangeListenerOptions | null;
    constructor(listener: ChangeListener, options: ChangeListenerOptions | null);
    matches(listener: ChangeListener, options: ChangeListenerOptions | null): boolean;
    isInterestedInPropertyChange(node: RMNode, source: RMNode, property: string): boolean;
    isInterestedInArrayChange(node: RMNode, source: RMNode): boolean;
    isNotInterestedInChangeFromSource(node: RMNode, source: RMNode): boolean;
    static optionsMatch(options1: ChangeListenerOptions | null, options2: ChangeListenerOptions | null): boolean;
}
