// Represents a dependency on the result of a findById call on an
// object

import RMDependency from './RMDependency'
import RMNode from './RMNode'
import {FindByIdDependency} from './Types'
import {Dependency} from './Types'

export default class RMIdDependency extends RMDependency {
  target: RMNode<any>
  id: string
  constructor(target: RMNode<any>, id: string) {
    super()
    this.target = target
    this.id = id
  }

  // Converts this to an application-visible Dependency
  toDependency(toExternalValue: (node:RMNode<any>)=>object): Dependency {
    const ret:FindByIdDependency = {
      type: 'FindByIdDependency',
      target: toExternalValue(this.target),
      id: this.id
    }
    return ret
  }

  // Returns true if the given findById dependency matches this
  matchesFindByIdDependency(node: RMNode<any>, id: string): boolean {
    return this.target === node && this.id == id
  }

  // Adds whatever listeners are required to call the given function
  // if a dependency changes
  addListeners(f: ()=>void) {
    const root = this.target.root
    if (!root.hasFindByIdChangeListener(f, this.id)) {
      root.addFindByIdChangeListener(f, this.id)
    }
  }

  // Removes whatever listeners were added to call the given function
  // if a dependency changes
  removeListeners(f: ()=>void) {
    const root = this.target.root
    root.removeFindByIdChangeListener(f, this.id)
  }
}
