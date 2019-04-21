// The handler that intercepts calls to get, set, or delete properties
// on an underlying object, passing those calls through to the RMNode
// representing that object.
//
// The Proxy has a special designated property (RMOBJECTPROXY_NODEKEY)
// which provides access back to the RMNode

import RMNode from './RMNode'

export default class RMProxy {
  node: RMNode<any>

  constructor(node: RMNode<any>) {
    this.node = node
  }

  // Proxies property getters to the RMNode.  The special
  // RMOBJECTPROXY_NODEKEY symbol is used to access the RMNode from
  // the proxy (and to identify that the object is actually a proxy)
  get (target: object, property: (string | symbol)): any | null {
    if(property === RMPROXY_NODEKEY) {
      return this.node
    }
    else {
      return this.node.proxyGet(property)
    }
  }

  // Proxies property setters to the RMNode.
  set (target: object, property: (string | symbol), value: any | null): boolean {
    return this.node.proxySet(property, value)
  }

  // Proxies property delections to the RMNode
  deleteProperty (target: object, property: (string | symbol)): boolean {
    return this.node.proxyDelete(property)
  }

  //--------------------------------------------------

  // FIXME - are these still needed?
  //  // Returns true if the given value is the proxy representation for a
  //  // value managed by RModel
  //  static isRMProxy(value/*:?any*/)/*:boolean*/ {
  //    return RMProxy.getRMNode(value) != null
  //  }
  //
  //  // Returns the RMNode associated with the proxy representation of an
  //  // RModel-managed value, or null if the value is not managed by
  //  // RModel
  //  static getRMNode(value/*:?any*/)/*:?RMNode*/ {
  //    return (value instanceof Object) ? this.getRMNodeForObject(value) : null
  //  }

  // Returns the RMNode associated with the proxy representation of an
  // RModel-managed value, or null if the value is not managed by
  // RModel
  static getNode(obj: object): RMNode<any> | null {
    return (obj as any)[RMPROXY_NODEKEY]
  }
}

const RMPROXY_NODEKEY = Symbol('RMPROXY_NODEKEY')
