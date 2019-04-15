import RMNode from './RMNode'
import RMComputed from './RMComputed'
import {ChangeListenerOptions} from './Types'
import {ChangeListener} from './Types'
import {Reference} from './Types'
import {Dependency} from './Types'
import {ComputedPropertyOptions} from './Types'
import {ImmutableListener} from './Types'
import RMDependencyTracker from './RMDependencyTracker'
import RMDependencyTrackers from './RMDependencyTrackers'
import RMBufferedCalls from './RMBufferedCalls'

// Serves both as the main gateway of the rmodel API, and as a
// singleton instance for holding global RModel state
export default class RMGlobal {
  // FIXME - description
  static toRModel(value: any): any {
    return RMNode.valueToRModel(value)
  }

  // FIXME - description
  static isRoot(value: any): boolean {
    const node = this.requireNodeForValue(value)
    return node.isRoot()
  }

  // FIXME - description
  static getRoot(value: any): object | null {
    const node = this.requireNodeForValue(value)
    return this.getObjectForNode(node.root)
  }

  // FIXME - description
  static getParent(value: any): object | null {
    const node = this.requireNodeForValue(value)
    return this.getObjectForNode(node.parent)
  }

  // FIXME - description
  static getProperty(value: any): string | null {
    const node = this.requireNodeForValue(value)
    return node.property
  }

  // FIXME - description
  static getPrimaryReference(value: any): Reference | null {
    const node = this.requireNodeForValue(value)
    const ref = node.primaryReference
    if (ref != null) {
      return {
        referrer: this.requireObjectForNode(ref.referrer),
        property: ref.property
      }
    }
    else {
      return null
    }
  }

  // FIXME - description
  static getSecondaryReferences(value: any): Reference[] {
    const node = this.requireNodeForValue(value)
    const ret = []
    if (node.secondaryReferences != null) {
      for(const ref of node.secondaryReferences) {
        const r = {
          referrer: this.requireObjectForNode(ref.referrer),
          property: ref.property
        }
        ret.push(r)
      }
    }
    return ret
  }

  // FIXME - description
  static hasRModel(value: any): boolean {
    return RMNode.hasRModel(value)
  }

  // FIXME - description
  static getManagedValue(value: any): boolean {
    return RMNode.getManagedValue(value)
  }

  // FIXME - description
  static addChangeListener(value: any, listener: ChangeListener, options: ChangeListenerOptions | null = null) {
    const node = this.requireNodeForValue(value)
    node.addChangeListener(listener, options)
  }

  // FIXME - description
  static removeChangeListener(value: any, listener: ChangeListener, options: ChangeListenerOptions | null = null) {
    const node = this.requireNodeForValue(value)
    node.removeChangeListener(listener, options)
  }

  // Executes the given function while watching to see what RModel
  // values are accessed as that function is executed.  The resulting
  // values are returned as a list of dependencies
  static findDependencies(func: ()=>void): Array<Dependency> {
    const ret = []
    const dependencyTracker = RMDependencyTrackers.trackDependencies(func)
    const deps = dependencyTracker.dependencies
    if (deps != null) {
      for(const dep of deps) {
        const retdep = dep.toDependency(RMNode.toExternalValue)
        ret.push(retdep)
      }
    }
    return ret
  }

  // FIXME - description
  static bufferCall(key: any, f: ()=>void) {
    RMBufferedCalls.bufferCall(key, f)
  }

  // FIXME - description
  static flushBufferedCalls() {
    RMBufferedCalls.flushBufferedCalls()
  }

  static addComputedProperty<T,R>(value: T, property: string, f: (obj:T)=>R, options: ComputedPropertyOptions | null = null) {
    const node = this.requireNodeForValue(value)
    node.addComputedProperty(property, f, options)
  }

  static removeComputedProperty(value: any, property: string) {
    const node = this.requireNodeForValue(value)
    node.removeComputedProperty(property)
  }

  static setId(value: any, id: string) {
    const node = this.requireNodeForValue(value)
    node.setId(id)
  }
  static getId(value: any): string | null {
    // This case is a little special - if a node is removed and
    // disconnected, and not yet added to another tree, we still want
    // to be able to see what its id used to be.
    const node = this.requireConnectedOrDisconnectedNodeForValue(value)
    return node.getId()
  }
  static deleteId(value: any) {
    const node = this.requireNodeForValue(value)
    node.deleteId()
  }
  static findById(value: any, id: string): object | null {
    const node = this.requireNodeForValue(value)
    return node.findById(id)
  }
  static setImmutable(value: any, listener: ImmutableListener): object {
    const node = this.requireNodeForValue(value)
    return node.setImmutable(listener)
  }

  
  // Returns the RMNode associated with the given value, throws an
  // exception if none
  static requireNodeForValue(value: any): RMNode {
    const node = RMNode.getNodeForValue(value)
    if (node == null) {
      throw new Error('InvalidArgument: Expected an RModel-enabled object value')
    }
    return node
  }

  // Returns the RMNode associated with the given value, even if that
  // node has been disconnected, throws an exception if none
  static requireConnectedOrDisconnectedNodeForValue(value: any): RMNode {
    let node = RMNode.getNodeForValue(value)
    if (node == null) {
      if (value instanceof Object) {
        node = RMNode.getConnectedOrDisconnectedNodeForObject(value)
      }
    }
    if (node == null) {
      throw new Error('InvalidArgument: Expected an RModel-enabled object value')
    }
    return node
  }

  // Returns the external object that should be exposed to the
  // application for the given node
  static getObjectForNode(node: RMNode | null): object | null {
    return node != null ? node.proxy : null
  }

  // Returns the external object that should be exposed to the
  // application for the given node
  static requireObjectForNode(node: RMNode): object {
    return node.proxy
  }

  // Returns an RMComputed wrapping the given function and options.
  // If this RMComputed is later set as a property value, then it will
  // effectively be treated as adding a computed property.
  static computed<T,R>(f: (obj:T)=>R, options: ComputedPropertyOptions | null = null): RMComputed<T,R> {
    return new RMComputed<T,R>(f, options)
  }
}

const SINGLETON = new RMGlobal()
