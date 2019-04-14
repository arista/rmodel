// Represents a dependency on the id of an object

import RMDependency from './RMDependency'
import RMNode from './RMNode'
import {IdDependency} from './Types'
import {Dependency} from './Types'

export default class RMIdDependency extends RMDependency {
  target: RMNode
  constructor(target: RMNode) {
    super()
    this.target = target
  }

  // Converts this to an application-visible Dependency
  toDependency(toExternalValue: (node:RMNode)=>object): Dependency {
    const ret:IdDependency = {
      type: 'IdDependency',
      target: toExternalValue(this.target)
    }
    return ret
  }

  // Returns true if the given id dependency matches this
  matchesIdDependency(node: RMNode): boolean {
    return this.target === node
  }

  // Adds whatever listeners are required to call the given function
  // if a dependency changes
  addListeners(f: ()=>void) {
    if (!this.target.hasIdChangeListener(f)) {
      this.target.addIdChangeListener(f)
    }
  }

  // Removes whatever listeners were added to call the given function
  // if a dependency changes
  removeListeners(f: ()=>void) {
    this.target.removeIdChangeListener(f)
  }
}
