// Represents a dependency on a property of an object

import RMDependency from './RMDependency'
import RMNode from './RMNode'
import {Dependency} from './Types'
import {PropertyDependency} from './Types'
import {ChangeListenerOptions} from './Types'

export default class RMPropertyDependency extends RMDependency {
  target: RMNode<any>
  property: string
  constructor(target: RMNode<any>, property: string) {
    super()
    this.target = target
    this.property = property
  }

  // Converts this to an application-visible Dependency
  toDependency(toExternalValue: (node:RMNode<any>)=>object): Dependency {
    const ret:PropertyDependency = {
      type: 'PropertyDependency',
      target: toExternalValue(this.target),
      property: this.property
    }
    return ret
  }

  // Returns true if the given property dependency matches this
  matchesPropertyDependency(node: RMNode<any>, property: string): boolean {
    return this.target === node && this.property == property
  }

  // Adds whatever listeners are required to call the given function
  // if a dependency changes
  addListeners(f: ()=>void) {
    const options = this.changeListenerOptions
    // It's possible for the same computed property to have multiple
    // listeners for the exact same target (especially if the value is
    // an array, in which case property might be null), so make sure
    // we're only adding one.
    if (!this.target.hasChangeListener(f, options)) {
      this.target.addChangeListener(f, options)
    }
  }

  // Removes whatever listeners were added to call the given function
  // if a dependency changes
  removeListeners(f: ()=>void) {
    const options = this.changeListenerOptions
    this.target.removeChangeListener(f, options)
  }

  // Returns the options that should be used for listeners
  get changeListenerOptions(): ChangeListenerOptions {
    // If the object is an array, then potentially the property could
    // be affected by array mutations, so we want to listen for any
    // array change, not just a change to the property.
    //
    // FIXME - is there a better way to do it than just listening to
    // all array changes?
    const property = Array.isArray(this.target.target) ? null : this.property
    return {
      property: property,
      source: 'self'
    }
  }
}
