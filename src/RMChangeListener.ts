// Represents one ChangeListener registered with a node, with a set of
// options

import RMNode from './RMNode'
import {ChangeListenerOptions} from './Types'
import {ChangeListener} from './Types'

export default class RMChangeListener {
  listener: ChangeListener
  options: ChangeListenerOptions | null

  constructor(listener: ChangeListener, options: ChangeListenerOptions | null) {
    this.listener = listener
    this.options = options
  }

  // Returns true if the given listener/options matches this listener
  matches(listener: ChangeListener, options: ChangeListenerOptions | null): boolean {
    return this.listener == listener && RMChangeListener.optionsMatch(this.options, options)
  }

  // Returns true if this listener (belonging to the given node) is
  // interested in change events from the given source node for the
  // given property
  isInterestedInPropertyChange(node: RMNode<any>, source: RMNode<any>, property: string): boolean {
    // If a specific property is required and doesn't match, then no
    if (this.options != null &&
        this.options.property != null &&
        this.options.property != property) {
      return false
    }
    return !this.isNotInterestedInChangeFromSource(node, source)
  }

  // Returns true if this listener (belonging to the given node) is
  // interested in array change events from the given source node
  isInterestedInArrayChange(node: RMNode<any>, source: RMNode<any>): boolean {
    // If a specific property is required then no
    if (this.options != null &&
        this.options.property != null) {
      return false
    }
    return !this.isNotInterestedInChangeFromSource(node, source)
  }

  // Returns true if this listener is not interested in any changes
  // from the given source
  isNotInterestedInChangeFromSource(node: RMNode<any>, source: RMNode<any>): boolean {
    // Check the source
    if (this.options == null || this.options.source == null) {
      // Default is 'self'
      return node !== source
    }
    else {
      switch(this.options.source) {
      case 'self':
        return node !== source
      case 'children':
        return node !== source && source.parent !== node
      case 'descendants':
      default:
        return false
      }
    }
  }

  // Returns true if the two sets of options match
  static optionsMatch(options1: ChangeListenerOptions | null, options2: ChangeListenerOptions | null): boolean {
    if (options1 == null && options2 == null) {
      return true
    }
    if (options1 == null || options2 == null) {
      return false
    }
    if (options1.property != options2.property) {
      return false
    }
    if (options1.source != options2.source) {
      return false
    }
    return true
  }
}
