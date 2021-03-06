// Represents a dependency on the property of an object

import RMDependency from './RMDependency'
import RMNode from './RMNode'
import {PropertyNameDependency} from './Types'
import {Dependency} from './Types'

export default class RMPropertyNameDependency extends RMDependency {
  target: RMNode<any>
  constructor(target: RMNode<any>) {
    super()
    this.target = target
  }

  // Converts this to an application-visible Dependency
  toDependency(toExternalValue: (node:RMNode<any>)=>object): Dependency {
    const ret:PropertyNameDependency = {
      type: 'PropertyNameDependency',
      target: toExternalValue(this.target)
    }
    return ret
  }

  // Returns true if the given propertyName dependency matches this
  matchesPropertyNameDependency(node: RMNode<any>): boolean {
    return this.target === node
  }

  // Adds whatever listeners are required to call the given function
  // if a dependency changes
  addListeners(f: ()=>void) {
    if (!this.target.hasPropertyNameChangeListener(f)) {
      this.target.addPropertyNameChangeListener(f)
    }
  }

  // Removes whatever listeners were added to call the given function
  // if a dependency changes
  removeListeners(f: ()=>void) {
    this.target.removePropertyNameChangeListener(f)
  }
}
