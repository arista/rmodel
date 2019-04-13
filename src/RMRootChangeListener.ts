// Represents one RootChangeListener registered with a node

import RMNode from './RMNode'
import {RootChangeListener} from './InternalTypes'

export default class RMRootChangeListener {
  listener: RootChangeListener

  constructor(listener: RootChangeListener) {
    this.listener = listener
  }

  // Returns true if the given listener matches this listener
  matches(listener: RootChangeListener): boolean {
    return this.listener == listener
  }
}
