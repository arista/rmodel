// A proxy for the Array.unshift function which passes its calls to
// the RMNode

import RMNode from './RMNode'

export default class RMArrayUnshiftProxy {
  node: RMNode<any>
  constructor(node: RMNode<any>) {
    this.node = node
  }

  apply(target: any, thisArg: object, args: Array<any | null>): any | null {
    return this.node.proxyArrayUnshift(target, args)
  }
}
