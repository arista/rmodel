import RMNode from './RMNode'
import RMDependencyTracker from './RMDependencyTracker'
import RMSortedArray from './RMSortedArray'

// Manages an Array that is a sorted representation of another
// RModel-enabled Array

export default class RMSortedArrayElem<T,K> {
  parent: RMSortedArray<T,K>
  elem: T
  key: K
  dependencies: RMDependencyTracker
  keyListener: ()=>void
  constructor(parent: RMSortedArray<T,K>, elem:T, key: K, dependencies: RMDependencyTracker) {
    this.parent = parent
    this.elem = elem
    this.key = key
    this.dependencies = dependencies
    this.keyListener = ()=>this.dependencyChanged()

    this.dependencies.addListeners(this.keyListener)
  }

  dependencyChanged() {
    this.parent.keyChanged(this)
  }

  removed() {
    this.dependencies.removeListeners(this.keyListener)
  }

  updateKey(key: K, dependencies: RMDependencyTracker) {
    this.key = key
    this.dependencies.removeListeners(this.keyListener)
    this.dependencies = dependencies
    this.dependencies.addListeners(this.keyListener)
  }
}
