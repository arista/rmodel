// A proxy for the Array.splice function which passes its calls to the
// RMNode

import RMNode from './RMNode'

export default class RMArraySpliceProxy {
  node: RMNode<any>
  constructor(node: RMNode<any>) {
    this.node = node
  }

  apply(target: any, thisArg: object, args: Array<any | null>): any | null {
    return this.node.proxyArraySplice(target, args)
  }
}
