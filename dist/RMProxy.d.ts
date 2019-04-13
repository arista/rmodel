import RMNode from './RMNode';
export default class RMProxy {
    node: RMNode;
    constructor(node: RMNode);
    get(target: object, property: (string | Symbol)): any | null;
    set(target: object, property: (string | Symbol), value: any | null): boolean;
    deleteProperty(target: object, property: (string | Symbol)): boolean;
    static getNode(obj: object): RMNode | null;
}
