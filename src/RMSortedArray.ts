import RMNode from './RMNode'
import {RMNODE_ADDED} from './RMNode'
import {RMNODE_REMOVED} from './RMNode'
import RMSortedArrayElem from './RMSortedArrayElem'
import RMDependencyTrackers from './RMDependencyTrackers'
import {ChangeListener} from './Types'
import {ChangeEvent} from './Types'
import {ArrayChange} from './Types'

// Manages an Array that is a sorted representation of another
// RModel-enabled Array

export default class RMSortedArray<T,K> {
  node:RMNode<Array<T>>
  arr: Array<T>
  sortKeyFunc:(v:T)=>K
  result: Array<T>
  elems: Array<RMSortedArrayElem<T,K>>
  arrayChangeListener: ChangeListener
  constructor(node:RMNode<Array<T>>, sortKeyFunc:(v:T)=>K) {
    this.node = node
    this.arr = RMNode.toExternalValue(node)
    this.sortKeyFunc = sortKeyFunc
    this.result = []
    this.elems = []
    this.arrayChangeListener = (e:ChangeEvent)=>this.arrayChanged(e)

    // Add the callbacks to let us know when the values are being
    // added or removed
    const resultAny:any = this.result
    resultAny[RMNODE_ADDED] = ()=>this.added()
    resultAny[RMNODE_REMOVED] = ()=>this.removed()
  }

  // Called when the array is added to an RModel tree.  This will add
  // a listener to the underlying node, then add all the items from
  // that node
  added() {
    // Add a listener to the array
    this.node.addChangeListener(e=>this.arrayChanged(e))

    // Add all the elements from the existing array
    for(const e of this.arr) {
      this.add(e)
    }
  }

  // Called when the array is being removed from the RModel tree.
  // This will remove the listener from the underlying node, and also
  // remove any listeners from dependencies recorded when the sort
  // keys were computed
  removed() {
    // FIXME - implement this
  }

  // Called whenever the aray changes
  arrayChanged(e:ChangeEvent) {
    if (e.type === 'ArrayChange') {
      const ee:ArrayChange = (e as ArrayChange)
      if (ee.inserted) {
        for(const val of ee.inserted) {
          this.add(val)
        }
      }
      else if (ee.deleted) {
        for(const val of ee.deleted) {
          this.remove(val)
        }
      }
    }
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

  remove(elem:T) {
    // FIXME - implement this
  }
}
