import RMNode from './RMNode'
import RMDependencyTracker from './RMDependencyTracker'

// Manages an Array that is a sorted representation of another
// RModel-enabled Array

export default class RMSortedArrayElem<T,K> {
  elem: T
  key: K
  dependencies: RMDependencyTracker
  constructor(elem:T, key: K, dependencies: RMDependencyTracker) {
    this.elem = elem
    this.key = key
    this.dependencies = dependencies
  }
}
