// Represents a dependency on the parent of an object

import RMDependency from './RMDependency'
import RMNode from './RMNode'
import {ParentDependency} from './Types'
import {Dependency} from './Types'

export default class RMParentDependency extends RMDependency {
  target: RMNode
  constructor(target: RMNode) {
    super()
    this.target = target
  }

  // Converts this to an application-visible Dependency
  toDependency(toExternalValue: (node:RMNode)=>object): Dependency {
    const ret:ParentDependency = {
      type: 'ParentDependency',
      target: toExternalValue(this.target)
    }
    return ret
  }

  // Returns true if the given parent dependency matches this
  matchesParentDependency(node: RMNode): boolean {
    return this.target === node
  }

  // Adds whatever listeners are required to call the given function
  // if a dependency changes
  addListeners(f: ()=>void) {
    if (!this.target.hasParentChangeListener(f)) {
      this.target.addParentChangeListener(f)
    }
  }

  // Removes whatever listeners were added to call the given function
  // if a dependency changes
  removeListeners(f: ()=>void) {
    this.target.removeParentChangeListener(f)
  }
}
