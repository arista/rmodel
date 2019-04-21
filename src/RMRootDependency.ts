// Represents a dependency on the root of an object

import RMDependency from './RMDependency'
import RMNode from './RMNode'
import {Dependency} from './Types'
import {RootDependency} from './Types'

export default class RMRootDependency extends RMDependency {
  target: RMNode<any>
  constructor(target: RMNode<any>) {
    super()
    this.target = target
  }

  // Converts this to an application-visible Dependency
  toDependency(toExternalValue: (node:RMNode<any>)=>Object): Dependency {
    const ret: RootDependency = {
      type: 'RootDependency',
      target: toExternalValue(this.target)
    }
    return ret
  }

  // Returns true if the given root dependency matches this
  matchesRootDependency(node: RMNode<any>): boolean {
    return this.target === node
  }

  // Adds whatever listeners are required to call the given function
  // if a dependency changes
  addListeners(f: ()=>void) {
    if (!this.target.hasRootChangeListener(f)) {
      this.target.addRootChangeListener(f)
    }
  }

  // Removes whatever listeners were added to call the given function
  // if a dependency changes
  removeListeners(f: ()=>void) {
    this.target.removeRootChangeListener(f)
  }
}
