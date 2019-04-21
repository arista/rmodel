// Abstract superclass for different kinds of dependencies

import RMNode from './RMNode'
import {Dependency} from './Types'

export default class RMDependency {
  constructor() {
  }

  // Converts this to an application-visible Dependency
  toDependency(toExternalValue: (node:RMNode<any>)=>object): Dependency {
    throw new Error('Abstract method')
  }

  // Returns true if the given property dependency matches this
  matchesPropertyDependency(node: RMNode<any>, property: string): boolean {
    return false
  }

  // Returns true if the given root dependency matches this
  matchesRootDependency(node: RMNode<any>): boolean {
    return false
  }

  // Returns true if the given parent dependency matches this
  matchesParentDependency(node: RMNode<any>): boolean {
    return false
  }

  // Returns true if the given propertyName dependency matches this
  matchesPropertyNameDependency(node: RMNode<any>): boolean {
    return false
  }

  // Returns true if the given id dependency matches this
  matchesIdDependency(node: RMNode<any>): boolean {
    return false
  }

  // Returns true if the given findById dependency matches this
  matchesFindByIdDependency(node: RMNode<any>, id: string): boolean {
    return false
  }

  // Adds whatever listeners are required to call the given function
  // if a dependency changes
  addListeners(f: ()=>void) {
    throw new Error('Abstract method')
  }

  // Removes whatever listeners were added to call the given function
  // if a dependency changes
  removeListeners(f: ()=>void) {
    throw new Error('Abstract method')
  }
}
