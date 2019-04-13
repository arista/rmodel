// Represents one ParentChangeListener registered with a node

import RMNode from './RMNode'
import {ParentChangeListener} from './InternalTypes'

export default class RMParentChangeListener {
  listener: ParentChangeListener

  constructor(listener: ParentChangeListener) {
    this.listener = listener
  }

  // Returns true if the given listener matches this listener
  matches(listener: ParentChangeListener): boolean {
    return this.listener == listener
  }
}
