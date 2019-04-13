// Type declarations that are not meant to be publicly used

// The event fired when the root of an object is changed
export interface RootChangeEvent {
  type: 'RootChange'

  // The object whose root is being changed
  target: object

  // The old value of the root
  oldValue: object

  // The new value of the root
  newValue: object
}

// A function registered to listen for changes to an object's root
export type RootChangeListener = (event:RootChangeEvent)=>void

// The event fired when the parent of an object is changed
export interface ParentChangeEvent {
  type: 'ParentChange'

  // The object whose parent is being changed
  target: object

  // The old value of the parent
  oldValue: object | null

  // The new value of the parent
  newValue: object | null
}

// A function registered to listen for changes to an object's parent
export type ParentChangeListener = (event:ParentChangeEvent)=>void

// The event fired when the property name of an object is changed
export interface PropertyNameChangeEvent {
  type: 'PropertyNameChange'

  // The object whose property name is being changed
  target: object

  // The old value of the property name
  oldValue: string | null

  // The new value of the property name
  newValue: string | null
}

// A function registered to listen for changes to an object's property
// name
export type PropertyNameChangeListener = (event:PropertyNameChangeEvent)=>void

// The event fired when the id of an object is changed
export interface IdChangeEvent {
  type: 'IdChange'

  // The object whose id is being changed
  target: object

  // The old value of the id
  oldValue: string | null

  // The new value of the id
  newValue: string | null
}

// A function registered to listen for changes to an object's id
export type IdChangeListener = (event:IdChangeEvent)=>void

// The event fired when the mapping from id to object changes
export interface FindByIdChangeEvent {
  type: 'FindByIdChange'

  // The object whose id is being changed
  target: Object

  // The id being changed
  id: string

  // The old value referenced by the id
  oldValue: object | null

  // The new value referenced by the id
  newValue: object | null
}

// A function registered to listen for changes to the mapping from id
// to object
export type FindByIdChangeListener = (event:FindByIdChangeEvent)=>void
