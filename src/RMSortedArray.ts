import RMNode from './RMNode'
import {RMNODE_ADDED} from './RMNode'
import {RMNODE_REMOVED} from './RMNode'
import RMSortedArrayElem from './RMSortedArrayElem'
import RMDependencyTrackers from './RMDependencyTrackers'
import RMDependencyTracker from './RMDependencyTracker'
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
    this.node.addChangeListener(this.arrayChangeListener)

    // Create the elements with their keys
    for(const elem of this.arr) {
      const {key, dependencies} = this.computeKey(elem)
      const selem = new RMSortedArrayElem(this, elem, key, dependencies)
      this.elems.push(selem)
    }

    // Sort the whole array at once
    this.elems.sort((s1, s2)=>this.compare(s1.key, s2.key))

    // Extract the sorted elements and push them all at once onto the
    // resulting RModel array
    const relems = this.elems.map((e)=>e.elem)
    this.result.push(...relems)
  }

  computeKey(elem:T):{key: K, dependencies: RMDependencyTracker} {
    let k = null
    const dependencies = RMDependencyTrackers.trackDependencies(()=>k = this.sortKeyFunc(elem))
    // Convince TypeScript that key will be a K at this point
    const key = ((k as unknown) as K)
    return {key, dependencies}
  }

  compare(v1:any, v2:any):number {
    if (v1 < v2) {
      return -1
    }
    else if (v1 > v2) {
      return 1
    }
    else {
      return 0
    }
  }

  // Called when the array is being removed from the RModel tree.
  // This will remove the listener from the underlying node, and also
  // remove any listeners from dependencies recorded when the sort
  // keys were computed
  removed() {
    // Remove our listener from the array
    this.node.removeChangeListener(this.arrayChangeListener)

    // Remove the listeners from all the elements
    for(const selem of this.elems) {
      selem.removed()
    }
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
      switch(this.compare(elemKey, key)) {
      case 0:
        return mid
      case -1:
        low = mid
        break
      case 1:
        high = mid
        break
      }
    }
    return high
  }

  // Returns the index of the given element
  indexOf(elem:T, key:K):number {
    const ix = this.insertionPoint(key)
    // Search up
    for(let ii = ix; ii < this.elems.length && this.elems[ii].key == key; ii++) {
      if (this.elems[ii].elem === elem) {
        return ii
      }
    }
    // Search down
    for(let ii = ix - 1; ii >= 0 && this.elems[ii].key == key; ii--) {
      if (this.elems[ii].elem === elem) {
        return ii
      }
    }
    return -1
  }

  // Adds the given element into the array
  add(elem:T) {
    const {key, dependencies} = this.computeKey(elem)
    const ix = this.insertionPoint(key)
    const selem = new RMSortedArrayElem(this, elem, key, dependencies)
    this.insertAt(selem, ix)
  }

  insertAt(selem: RMSortedArrayElem<T,K>, ix: number) {
    this.result.splice(ix, 0, selem.elem)
    this.elems.splice(ix, 0, selem)
  }

  remove(elem:T) {
    const key = this.sortKeyFunc(elem)
    const ix = this.indexOf(elem, key)
    this.removeAt(ix)
  }

  removeAt(ix:number) {
    const selem = this.elems[ix]
    selem.removed()
    this.elems.splice(ix, 1)
    this.result.splice(ix, 1)
  }

  keyChanged(selem:RMSortedArrayElem<T,K>) {
    const elem = selem.elem
    const ix = this.indexOf(elem, selem.key)
    this.removeAt(ix)
    
    // Get the new key
    const {key, dependencies} = this.computeKey(elem)
    selem.updateKey(key, dependencies)
    const newIx = this.insertionPoint(key)
    this.insertAt(selem, newIx)
  }
}
