import RMNode from './RMNode';
export default class RMProxy {
    node: RMNode;
    constructor(node: RMNode);
    get(target: object, property: (string | symbol)): any | null;
    set(target: object, property: (string | symbol), value: any | null): boolean;
    deleteProperty(target: object, property: (string | symbol)): boolean;
    static getNode(obj: object): RMNode | null;
}
