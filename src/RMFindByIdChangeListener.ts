// Represents one FindByIdChangeListener registered with a node
// (typically registered with the root node)

import RMNode from './RMNode'
import {FindByIdChangeListener} from './InternalTypes'

export default class RMFindByIdChangeListener {
  listener: FindByIdChangeListener
  id: string

  constructor(listener: FindByIdChangeListener, id: string) {
    this.listener = listener
    this.id = id
  }

  // Returns true if the given listener matches this listener and id
  matches(listener: FindByIdChangeListener, id: string): boolean {
    return this.listener == listener && this.id == id
  }
}
