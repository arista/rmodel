// Tracks the nodes that have changed their immutable values over the
// course of one 'tick'.  These changed values are buffered in each
// node until the end of the 'tick', at which point each of those
// nodes is directed to make the copy become the new value, and the
// listener at the top of the tree is notified.

import RMBufferedCalls from './RMBufferedCalls'
import {ImmutableListener} from './Types'
import {ImmutableChangeEvent} from './Types'
import RMNode from './RMNode'

export default class RMImmutableTracker<T> {
  node: RMNode<T>
  listener: ImmutableListener<T>
  changedNodes: Array<RMNode<any>> | null

  // Functions bound to this instance
  flushCall: ()=>void

  constructor(node: RMNode<T>, listener: ImmutableListener<T>) {
    this.node = node
    this.listener = listener
    this.changedNodes = null

    // Bind the function calls to this instance
    this.flushCall = ()=>this.flush()
  }

  // Notifies that the given node has created and modified a copy of
  // its immutable value, and will have to be notified at the end of
  // the current 'tick'
  addChangedNode(node: RMNode<any>) {
    if(this.changedNodes == null) {
      this.changedNodes = [node]
    }
    else {
      this.changedNodes.push(node)
    }
    RMBufferedCalls.bufferImmutableTrackerCall(this, this.flushCall)
  }

  // Called at the end of the current 'tick' to tell all of the nodes
  // to put their new immutable values into use, and to notify the
  // listener at the top of the immutable tree.
  flush() {
    if(this.changedNodes != null) {
      // Keep track of the old immutable value of the root, to be used
      // in the event that will be fired
      const oldValue = this.node.immutableValue
      if(oldValue == null) {
        throw new Error('Assertion failed - oldNode should not be null')
      }

      // Notify all of the nodes that have changed their immutable
      // values
      for(const n of this.changedNodes) {
        n.flushImmutableChanges()
      }
      this.changedNodes = null

      // Keep track of the new immutable value of the root, to be used
      // in the event that will be fired
      const newValue = this.node.immutableValue
      if(newValue == null) {
        throw new Error('Assertion failed - oldNode should not be null')
      }

      // Fire the event
      const event: ImmutableChangeEvent<T> = {
        type: 'ImmutableChange',
        oldValue,
        newValue
      }
      this.listener(event)
    }
  }
}
