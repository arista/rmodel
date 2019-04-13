import RMNode from './RMNode';
export default class RMArrayPushProxy {
    node: RMNode;
    constructor(node: RMNode);
    apply(target: any, thisArg: object, args: Array<any | null>): any | null;
}
