// A proxy for the Array.push function which passes its calls to the
// RMNode

import RMNode from './RMNode'

export default class RMArrayPushProxy {
  node: RMNode<any>
  constructor(node: RMNode<any>) {
    this.node = node
  }

  apply(target: any, thisArg: object, args: Array<any | null>): any | null {
    return this.node.proxyArrayPush(target, args)
  }
}
