import RMNode from './RMNode'
import RMSortedArrayElem from './RMSortedArrayElem'
import RMDependencyTrackers from './RMDependencyTrackers'

// Manages an Array that is a sorted representation of another
// RModel-enabled Array

export default class RMSortedArray<T,K> {
  node:RMNode<Array<T>>
  sortKeyFunc:(v:T)=>K
  result: Array<T>
  elems: Array<RMSortedArrayElem<T,K>>
  constructor(node:RMNode<Array<T>>, sortKeyFunc:(v:T)=>K) {
    this.node = node
    this.sortKeyFunc = sortKeyFunc
    this.result = []
    this.elems = []
  }

  // Returns the index at which an element with the given key should
  // be inserted.  If multiple existing elements have the same key,
  // it's not defined which of those will be chosen.
  insertionPoint(key:K):number {
    let low = -1
    let high = this.elems.length
    while (low < high - 1) {
      const mid = Math.floor((low + high) / 2)
      const elem = this.elems[mid]
      const elemKey = elem.key
      if (elemKey == key) {
        return mid
      }
      else if (elemKey < key) {
        low = mid
      }
      else if (elemKey > key) {
        high = mid
      }
    }
    return high
  }

  // Adds the given element into the array
  add(elem:T) {
    // Get the key while tracking dependencies
    let key = null
    const dependencies = RMDependencyTrackers.trackDependencies(()=>key = this.sortKeyFunc(elem))
    // Convince TypeScript that key will be a K at this point
    const elemKey = ((key as unknown) as K)
    const ix = this.insertionPoint(elemKey)
    const rmaElem = new RMSortedArrayElem(elem, elemKey, dependencies)

    // Create listeners
    // FIXME - implement this

    // Insert into the arrays
    this.result.splice(ix, 0, elem)
    this.elems.splice(ix, 0, rmaElem)
    // FIXME - implement this
  }
}
