import RMNode from './RMNode';
export default class RMArrayPopProxy {
    readonly node: RMNode;
    constructor(node: RMNode);
    apply(target: any, thisArg: object, args: Array<any | null>): any | null;
}
