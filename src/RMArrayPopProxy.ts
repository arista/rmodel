// A proxy for the Array.pop function which passes its calls to the
// RMNode

import RMNode from './RMNode'

export default class RMArrayPopProxy {
  readonly node: RMNode

  constructor(node: RMNode) {
    this.node = node
  }

  apply(target: any, thisArg: object, args: Array<any|null>): any | null {
    return this.node.proxyArrayPop(target, args)
  }
}
