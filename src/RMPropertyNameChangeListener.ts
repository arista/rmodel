// Represents one PropertyNameChangeListener registered with a node

import RMNode from './RMNode'
import {PropertyNameChangeListener} from './InternalTypes'

export default class RMPropertyNameChangeListener {
  listener: PropertyNameChangeListener

  constructor(listener: PropertyNameChangeListener) {
    this.listener = listener
  }

  // Returns true if the given listener matches this listener
  matches(listener: PropertyNameChangeListener): boolean {
    return this.listener == listener
  }
}
