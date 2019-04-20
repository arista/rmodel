// Type declarations intended to be exposed to applications

// Represents a reference from a "referrer" managed object to a
// "referenced" Object.  Returned by primaryReference() and
// secondaryReferences()
export interface Reference {
  referrer: object
  property: string
}

// An event fired when a change is made to a managed object
export interface ChangeEvent {
  type: string
}

// An event fired when a property's value changes
export interface PropertyChange extends ChangeEvent {
  type: 'PropertyChange'

  // The object whose property is being changed
  target: object

  // The property being changed.  This is always a string, even for
  // array indices
  property: string

  // The old value of the property (undefined if the property was not
  // defined for the object before the change)
  oldValue: any | null

  // The new value of the property (undefined if the property is no
  // longer defined after the change)
  newValue: any | null

  // Set to true if the property was defined on the object before the
  // property change, even if the property's previous value was
  // undefined or null
  hadOwnProperty: boolean

  // Set to true if the property is defined on the object before the
  // property change, even if the property's previous value was
  // undefined or null.  This would, for example, be set to false if
  // the property is deleted
  hasOwnProperty: boolean

  // The list of objects that were added to the tree as a result of
  // this change
  added: Array<object> | null

  // The list of objects that were removed from the tree as a result
  // of this change
  removed: Array<object> | null
}

// An event fired when an Array is modified by a mutator method (push,
// pop, shift, unshift, splice).  Rather than representing the
// operation as an equivalent series of PropertyChanges, the operation
// is represented by a single event.
export interface ArrayChange extends ChangeEvent {
  type: 'ArrayChange'
  target: Array<any | null>
  index: number
  deleteCount: number
  insertCount: number
  deleted: Array<any | null> | null
  inserted: Array<any | null> | null
  oldLength: number
  newLength: number
  added: Array<object> | null
  removed: Array<object> | null
}

// A function registered to listen for change events
export type ChangeListener = (event:ChangeEvent)=>void

// The options available when registering a function to listen for
// change events using addChangeListener()
export interface ChangeListenerOptions {
  // If specified, the listener will only be notified if a change is
  // made to the specified property.  By default, a listener will
  // notified for any property
  property?: string | null

  // If specified, the listener will be notified if the target object
  // of the change matches the specified EventSource.  By default, the
  // listener will only be notified of changes made to properties of
  // the object
  source?: EventSource | null
}

// A ChangeListenerOption limiting the listener to being notified only
// for events from the specified origin
export type EventSource =
  // Only listen for events originating from the object
  'self' |
  // Only listen for events originating from the object or any of its direct children
  'children' |
  // Listen for events originating from the object or any of its descendants
  'descendants'

// Represents one dependency found while calling RModel.findDependencies
export interface Dependency {
  type: string
}

// Indicates that a computation depends on the specified property of
// the specified object
export interface PropertyDependency extends Dependency {
  type: 'PropertyDependency'
  target: object
  property: string
}

// Indicates that a computation depends on RModel.root() of the
// specified object
export interface RootDependency extends Dependency {
  type: 'RootDependency'
  target: object
}

// Indicates that a computation depends on RModel.parent() of the
// specified object
export interface ParentDependency extends Dependency {
  type: 'ParentDependency'
  target: object
}

// Indicates that a computation depends on RModel.property() of the
// specified object
export interface PropertyNameDependency extends Dependency {
  type: 'PropertyNameDependency'
  target: object
}

// Indicates that a computation depends on RModel.id() of the
// specified object
export interface IdDependency extends Dependency {
  type: 'IdDependency'
  target: object
}

// Indicates that a computation depends on RModel.findById() of the
// specified object
export interface FindByIdDependency extends Dependency {
  type: 'FindByIdDependency'
  target: object
  id: string
}

// The options available when registering a computed property
export interface ComputedPropertyOptions {
  // If true, then the property will be recomputed immediately every
  // time a dependency changes.  If false (the default), then all
  // dependency changes will be "buffered" and executed at the end of
  // the current "tick"
  immediate?: ?boolean
}

// The listener at the root of an immutable tree notified when the
// root's value has changed
export type ImmutableListener<T> = (event:ImmutableChangeEvent<T>)=>void

// The event reported at the root of an immutable tree, indicating
// that a change has occurred somewhere in the tree, eventually
// resulting in a new value for the immutable root of the tree
export interface ImmutableChangeEvent<T> {
  type: 'ImmutableChange'
  oldValue: T
  newValue: T
}
