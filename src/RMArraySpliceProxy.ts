// A proxy for the Array.splice function which passes its calls to the
// RMNode

import RMNode from './RMNode'

export default class RMArraySpliceProxy {
  node: RMNode
  constructor(node: RMNode) {
    this.node = node
  }

  apply(target: any, thisArg: object, args: Array<any | null>): any | null {
    return this.node.proxyArraySplice(target, args)
  }
}
