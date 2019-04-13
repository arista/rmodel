// Represents one IdChangeListener registered with a node

import RMNode from './RMNode'
import {IdChangeListener} from './InternalTypes'

export default class RMIdChangeListener {
  listener: IdChangeListener

  constructor(listener: IdChangeListener) {
    this.listener = listener
  }

  // Returns true if the given listener matches this listener
  matches(listener: IdChangeListener): boolean {
    return this.listener == listener
  }
}
