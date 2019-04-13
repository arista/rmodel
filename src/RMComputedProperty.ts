// Manages a mechanism which calls a function to compute a value, then
// sets that value onto the property of a target object.  While the
// value is being computed, its dependencies are tracked, and
// listeners are added to the appropriate dependencies.  If those
// listeners fire, then the function will be re-evaluated and its new
// value will be set on the property, possibly with a new list of
// dependencies and listeners.
//
// By default, changes from dependencies will be "buffered" until the
// end of the current "tick", so that multiple changes resulting from
// a single operation won't immediately set off a flurry of
// computation and re-computation.  This can be overridden by the
// "immediate" option, which will force the property to be
// re-evaluated immediately every time a dependency changes.

import RMDependencyTrackers from './RMDependencyTrackers'
import RMBufferedCalls from './RMBufferedCalls'
import RMNode from './RMNode'
import RMDependencyTracker from './RMDependencyTracker'
import {ComputedPropertyOptions} from './Types'

export default class RMComputedProperty<T,R> {
  // The <T,R> are placeholder types, where T is the type of the
  // underlying object, and R is the type of the computed property
  
  target: RMNode
  property: string
  f: (obj:T)=>R
  options: ComputedPropertyOptions | null

  // The external value of the target
  targetObject: T
  // The most recently-computed value
  value: R | null

  // The most recently obtained list of dependencies
  dependencies: RMDependencyTracker | null

  // Functions bound to this instance
  computeValueCall: ()=>void
  dependencyChangedCall: ()=>void
  computeAndAssignValueCall: ()=>void

  constructor(target: RMNode, targetObject: T, property: string, f: (obj:T)=>R, options: ComputedPropertyOptions | null) {
    this.target = target
    this.property = property
    this.f = f
    this.options = options
    this.targetObject = targetObject

    this.value = null
    this.dependencies = null

    // Bind the function calls to this instance
    this.computeValueCall = ()=>this.computeValue()
    this.dependencyChangedCall = ()=>this.dependencyChanged()
    this.computeAndAssignValueCall = ()=>this.computeAndAssignValue()
  }

  // Computes the value and stores the result.  The result is not
  // immediately set on the property, to avoid triggering downstream
  // events until we're ready
  computeValue() {
    this.value = this.f(this.targetObject)
  }

  // Computes the value of the property, then assigns it to the property
  computeAndAssignValue() {
    // Call the valueComputer to execute the function and store the
    // value, and get the resulting dependencies
    const dependencies = RMDependencyTrackers.trackDependencies(this.computeValueCall)

    // Assign the resulting value to the property
    const obj: any = this.targetObject
    obj[this.property] = this.value

    // Update the listeners when moving from the old set of listeners
    // to the new set
    this.updateListeners(this.dependencies, dependencies)
    this.dependencies = dependencies

    // Clear out the computed value so we're not holding on to it
    this.value = null
  }

  // Called when a registered listener reports that a dependency has
  // changed
  dependencyChanged() {
    if (this.options && this.options.immediate) {
      this.computeAndAssignValue()
    }
    else {
      RMBufferedCalls.bufferComputedPropertyCall(this, this.computeAndAssignValueCall)
    }
  }

  // Compares the new set of dependencies against the old set,
  // removing listeners that are no longer needed and adding listeners
  // that are
  updateListeners(oldDependencies: RMDependencyTracker | null, newDependencies: RMDependencyTracker) {
    // This is a brute force method - remove all listeners from old
    // dependencies and add the ones from the new.  FIXME - should we
    // look at something that tries to avoid unnecessary listener
    // "thrashing"?
    if (oldDependencies != null) {
      oldDependencies.removeListeners(this.dependencyChangedCall)
    }
    newDependencies.addListeners(this.dependencyChangedCall)
  }

  // Called when a computed property is being discarded, in which case
  // all of its listeners have to be removed
  disconnect() {
    const dependencies = this.dependencies
    if (dependencies != null) {
      dependencies.removeListeners(this.dependencyChangedCall)
    }
  }
}
