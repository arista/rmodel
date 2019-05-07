// Represents the RModel state associated with an object (Object or
// Array) in a tree, along with the Proxy object that serves as the
// application-facing value of that object.  This maintains the parent
// of the object, any secondary references to the object, listeners
// added to the object, etc.
//
// Once an object has been "RModel-ized", it maintains a pointer back
// to its RMNode with the RMNODE_KEY property
//
// The object's Proxy allows RModel to intercept get/set/delete
// property calls intended for the object.  For the most part, RModel
// tries to be as "transparent" as possible, passing calls faithfully
// to the underlying object and only watching those calls enough to
// update its own internal state.  However, there are a few places
// where RModel affects values going through the Proxy:
//
// * object values being returned to the application (i.e., get) are converted to RModel values
// * values coming from the application (i.e., set) are converted back to their underlying values
// * array mutator methods are returned as Proxies, allowing them to further intercept calls and run them through RMNode

import RMArrayPushProxy from './RMArrayPushProxy'
import RMArrayPopProxy from './RMArrayPopProxy'
import RMArrayUnshiftProxy from './RMArrayUnshiftProxy'
import RMArrayShiftProxy from './RMArrayShiftProxy'
import RMArraySpliceProxy from './RMArraySpliceProxy'
import RMChangeListener from './RMChangeListener'
import RMComputed from './RMComputed'
import RMIdref from './RMIdref'
import RMProxy from './RMProxy'
import RMReference from './RMReference'
import RMDependencyTrackers from './RMDependencyTrackers'
import RMComputedProperty from './RMComputedProperty'
import RMRootChangeListener from './RMRootChangeListener'
import RMParentChangeListener from './RMParentChangeListener'
import RMPropertyNameChangeListener from './RMPropertyNameChangeListener'
import RMIdChangeListener from './RMIdChangeListener'
import RMFindByIdChangeListener from './RMFindByIdChangeListener'
import RMImmutableTracker from './RMImmutableTracker'
import {ChangeListenerOptions} from './Types'
import {ChangeListener} from './Types'
import {Dependency} from './Types'
import {PropertyChange} from './Types'
import {ComputedPropertyOptions} from './Types'
import {ImmutableListener} from './Types'
import {RootChangeListener} from './InternalTypes'
import {ParentChangeListener} from './InternalTypes'
import {PropertyNameChangeListener} from './InternalTypes'
import {IdChangeListener} from './InternalTypes'
import {FindByIdChangeListener} from './InternalTypes'
import {RootChangeEvent} from './InternalTypes'
import {ParentChangeEvent} from './InternalTypes'
import {PropertyNameChangeEvent} from './InternalTypes'
import {IdChangeEvent} from './InternalTypes'
import {FindByIdChangeEvent} from './InternalTypes'
import StringUtils from './StringUtils'

export default class RMNode<T extends Object> {
  // The underlying object (Object or Array) represented by this
  // RMNode
  target: T

  // Flag indicating that the target has been removed from its tree
  // and no longer has an associated RMNode.  In this state, the
  // target property will still point to the target, but all calls to
  // the proxy will be passed straight through to the target.
  disconnected: boolean

  // The root of the tree to which this RMNode belongs
  _root: RMNode<any>

  // The handler object used by the Proxy
  proxyHandler: RMProxy
  
  // The Proxy that serves as the "application view" of the underlying
  // object, intercepting access to the Object's properties.
  proxy: object

  // The single primary reference to the object, which serves as its
  // sole "parent".  If null, then this is the root.
  primaryReference: RMReference | null

  // Other references to the object from within the same tree
  secondaryReferences: Array<RMReference> | null

  // Flag used when "garbage collecting" to remove nodes from a tree,
  // indicating that this node is being considered for removal
  isGCing: boolean

  // Flag used when "garbage collecting" to remove nodes from a tree,
  // indicating that this node is referenced, and therefore safe from
  // removal
  isGCReferenced: boolean

  // Flag used when "garbage collecting" to remove nodes from a tree,
  // indicating that this node has been assigned a primary reference
  // after GC
  isGCPrimaryReferenced: boolean

  // Calls made to array mutator methods can generate many individual
  // property changes, which we'd rather report in a single array
  // change event.  To do that, we need to intercept the calls made to
  // those methods, which we have to do by proxying the methods
  // themselves when they are accessed from the object.
  _spliceProxy: Function | null
  _pushProxy: Function | null
  _popProxy: Function | null
  _shiftProxy: Function | null
  _unshiftProxy: Function | null

  // The list of change listeners
  changeListeners: Array<RMChangeListener> | null

  // The list of computed properties
  computedProperties: Array<RMComputedProperty<any,any>> | null

  // The id assigned to this object
  id: string | null

  // The mapping from id to object - this is only stored on the root
  nodesById: {[key:string]: RMNode<any>} | null

  // The listeners waiting to be notified of a change to the object's
  // root
  rootChangeListeners: Array<RMRootChangeListener> | null

  // The listeners waiting to be notified of a change to the object's
  // parent
  parentChangeListeners: Array<RMParentChangeListener> | null

  // The listeners waiting to be notified of a change to the object's
  // property name
  propertyNameChangeListeners: Array<RMPropertyNameChangeListener> | null

  // The listeners waiting to be notified of a change to the object's
  // id
  idChangeListeners: Array<RMIdChangeListener> | null

  // The listeners waiting to be notified of a change to the object's
  // mappings from id to object.  In this case, we index them by
  // property, since we anticipate that there could be a lot of
  // listeners
  findByIdChangeListeners: {[key:string]: Array<RMFindByIdChangeListener> | null} | null

  // The immutable copy of the node's value (only used if
  // followImmutable has been called on this node or one of its
  // ancestors)
  immutableValue: T | null

  // If this node has an immutableValue, and the node's value has
  // changed, this holds a shallow copy of that immutableValue in
  // which the changes are being reflected.  When
  // flushImmutableChanges() is called, this value is moved over to
  // immutableValue
  newImmutableValue: T | null

  // The RMImmutableTracker in place for this node and its descendants
  _immutableTracker: RMImmutableTracker<T> | null

  constructor(target: T) {
    this.target = target
    this.disconnected = false
    this._root = this
    this.proxyHandler = new RMProxy(this)
    const handler: any = this.proxyHandler
    this.proxy = new Proxy(target, handler)
    this.primaryReference = null
    this.secondaryReferences = null
    this.isGCing = false
    this.isGCReferenced = false
    this.isGCPrimaryReferenced = false
    this._spliceProxy = null
    this._pushProxy = null
    this._popProxy = null
    this._shiftProxy = null
    this._unshiftProxy = null
    this.changeListeners = null
    this.computedProperties = null
    this.id = null
    this.nodesById = null
    this.rootChangeListeners = null
    this.parentChangeListeners = null
    this.propertyNameChangeListeners = null
    this.idChangeListeners = null
    this.findByIdChangeListeners = null
    this.immutableValue = null
    this.newImmutableValue = null
    this._immutableTracker = null
  }

  // Returns true if this node is the root of its tree
  isRoot(): boolean {
    return this.root === this
  }

  // Returns the root of the tree containing this node
  get root(): RMNode<any> {
    RMDependencyTrackers.addRootDependency(this)
    return this._root
  }
  
  // Returns true if this and the given node are in the same tree -
  // i.e., they have the same roots
  isSameTree(node: RMNode<any> | null): boolean {
    return node != null && this.root === node.root
  }

  // Shorthad for getting the referrer of the primary reference, null
  // if this is the root
  get parent(): RMNode<any> | null {
    RMDependencyTrackers.addParentDependency(this)
    return this.primaryReference != null ? this.primaryReference.referrer : null
  }

  // Shorthad for getting the property of the primary reference, null
  // if this is the root
  get property(): string | null {
    RMDependencyTrackers.addPropertyNameDependency(this)
    return this.primaryReference != null ? this.primaryReference.property : null
  }

  // Returns all of the children of this node - that is, other nodes
  // referenced by this as primary references
  get children(): Array<RMNode<any>> {
    // FIXME - test this
    const ret = []
    for (const property in this.target) {
      const val = (this.target as any)[property]
      const node = RMNode.getNodeForValue(val)
      if (node != null) {
        if (node.isPrimaryReference(this, property)) {
          ret.push(node)
        }
      }
    }
    return ret
  }

  // Returns all of the descendants of this node, including only nodes
  // referenced with a primary reference
  get descendants(): Array<RMNode<any>> {
    // FIXME - test this
    const ret: Array<RMNode<any>> = []
    this.addDescendantsToArray(ret)
    return ret
  }

  // Returns an array including this and all of the descendants of
  // this node, including only nodes referenced with a primary
  // reference
  get thisAndDescendants(): Array<RMNode<any>> {
    // FIXME - test this
    const ret = [this]
    this.addDescendantsToArray(ret)
    return ret
  }

  // Returns an array of the "path" of property names that lead from
  // the root to this node through primary references
  get path(): Array<string> {
    const ref = this.primaryReference
    if (ref == null) {
      return []
    }
    else {
      const p = ref.referrer.path
      p.push(ref.property)
      return p
    }
  }

  get pathStr():string {
    return this.getPathStr(null)
  }

  getPathStr(rootName:string|null):string {
    let ret = (rootName == null) ? "<root>" : rootName
    const path = this.path
    for(const e of path) {
      if (StringUtils.isNumberString(e)) {
        ret = `${ret}[${e}]`
      }
      else if (StringUtils.isJSIdentifier(e)) {
        ret = `${ret}.${e}`
      }
      else {
        ret = `${ret}["${StringUtils.escapeToJSString(e)}"]`
      }
    }
    return ret
  }

  addDescendantsToArray(arr: Array<RMNode<any>>) {
    for (const property in this.target) {
      const val = (this.target as any)[property]
      const node = RMNode.getNodeForValue(val)
      if (node != null) {
        if (node.isPrimaryReference(this, property)) {
          arr.push(node)
          node.addDescendantsToArray(arr)
        }
      }
    }
  }

  // Returns true if this node is a descendant of ancestor
  isDescendantOf(ancestor: RMNode<any>): boolean {
    let n = this.parent
    while (n != null) {
      if (n === ancestor) {
        return true
      }
      n = n.parent
    }
    return false
  }

  // Returns true if this node is the same as ancestor or is a
  // descendant of ancestor
  isSameOrDescendantOf(ancestor: RMNode<any>): boolean {
    return this === ancestor || this.isDescendantOf(ancestor)
  }

  // Returns true if the given referrer/property is the primary reference to this node
  isPrimaryReference(referrer: RMNode<any>, property: string): boolean {
    const ref = this.primaryReference
    return ref != null && ref.matches(referrer, property)
  }  

  // Sets the given referrer and property to be the primary reference
  // to this node.  This will also set the root of this node to the
  // referrer's root
  setPrimaryReference(referrer: RMNode<any>, property: string, added: Array<RMNode<any>> | null) {
    if (!this.isPrimaryReference(referrer, property)) {
      this.assignPrimaryReference(new RMReference(referrer, property))
      this.setRoot(referrer.root, added)
    }
  }

  // Assigns the primary reference
  assignPrimaryReference(ref: RMReference | null) {
    const oldParent = this.primaryReference != null ? this.primaryReference.referrer : null
    const oldProperty = this.primaryReference != null ? this.primaryReference.property : null
    this.primaryReference = ref
    const newParent = this.primaryReference != null ? this.primaryReference.referrer : null
    const newProperty = this.primaryReference != null ? this.primaryReference.property : null
    if (oldParent !== newParent) {
      this.notifyParentChangeListeners(oldParent, newParent)
    }
    if (oldProperty !== newProperty) {
      this.notifyPropertyNameChangeListeners(oldProperty, newProperty)
    }
  }

  // Sets the root of this node.  If the root is actually changing,
  // then that means the node is being added to the tree, so it is
  // added to the given added array
  setRoot(newRoot: RMNode<any>, added: Array<RMNode<any>> | null) {
    if (this.root !== newRoot) {
      const oldRoot = this.root
      this._root = newRoot
      if (added != null) {
        added.push(this)
      }

      // If this node had a mapping by id, merge those mappings into
      // the new root
      this.mergeNodesById(newRoot)
      // If this node had listeners for id to node mappings, merge
      // those mappings into the new root, firing any listeners that
      // would be triggered by the new mappings
      this.transferFindByIdChangeListeners(newRoot)
      this.nodesById = null

      // Notify listeners of the root change
      this.notifyRootChangeListeners(oldRoot, newRoot)
    }
  }

  // Returns true if the node has a secondary reference with the given
  // referrer and property
  hasSecondaryReference(referrer: RMNode<any>, property: string): boolean {
    if (this.secondaryReferences == null) {
      return false
    }
    else {
      for (const ref of this.secondaryReferences) {
        if (ref.matches(referrer, property)) {
          return true
        }
      }
      return false
    }
  }

  // Adds a secondary reference
  addSecondaryReference(referrer: RMNode<any>, property: string) {
    const ref = new RMReference(referrer, property)
    if (this.secondaryReferences == null) {
      this.secondaryReferences = [ref]
    }
    else {
      this.secondaryReferences.push(ref)
    }
  }

  // Removes a secondary reference
  removeSecondaryReference(referrer: RMNode<any>, property: string) {
    const refs = this.secondaryReferences
    if (refs != null) {
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i]
        if (ref.matches(referrer, property)) {
          refs.splice(i, 1)
          return
        }
      }
    }
  }

  // Removes the given reference, either as a primary or a secondary
  // reference
  removeReference(referrer: RMNode<any>, property: string) {
    if (this.isPrimaryReference(referrer, property)) {
      this.assignPrimaryReference(null)
    }
    else {
      this.removeSecondaryReference(referrer, property)
    }
  }

  //--------------------------------------------------
  // Proxy method implementations

  // Called from the proxy to get a property value
  proxyGet(property: (string|symbol)): any | null {
    // If the property is RMNODE_ID, then this is a shorthand for
    // getting the RMNode's id
    if (property == RMNODE_ID) {
      return this.getId()
    }
    
    // If the target is no longer being managed by this RMNode, then
    // try to find the node that is now managing the object and pass
    // the call to it.  Otherwise just pass the call through to the
    // target
    if (this.disconnected) {
      const node = RMNode.getNodeForObject(this.target)
      if (node != null) {
        return node.proxyGet(property)
      }
      else {
        return Reflect.get(this.target, property)
      }
    }
    
    // Only handle string properties (not symbol)
    if (typeof(property) !== 'string') {
      return Reflect.get(this.target, property)
    }

    // If there is a dependency tracker in effect, notify it now
    RMDependencyTrackers.addPropertyDependency(this, property)

    const target = this.target
    const value = Reflect.get(target, property)

    // If the value is a special array mutator that reports its
    // changes as ArrayChanges, then return a Proxy for it
    switch(value) {
    case Array.prototype.splice:
      return this.spliceProxy
    case Array.prototype.push:
      return this.pushProxy
    case Array.prototype.pop:
      return this.popProxy
    case Array.prototype.shift:
      return this.shiftProxy
    case Array.prototype.unshift:
      return this.unshiftProxy
    }

    // Some properties must be returned unwrapped, such as
    // "prototype".  These are identified as properties that are not
    // writable and not configurable - FIXME - test this
    const desc = Object.getOwnPropertyDescriptor(target, property)
    // FIXME - check the performance of this
    if(desc && !desc.writable && !desc.configurable) {
      return value
    }
    // Return the value in its "external" form to the application
    else {
      return RMNode.toExternalValue(value)
    }
  }

  // Called from the proxy to set a property value
  proxySet(property: (string|symbol), value: any | null): boolean {
    // If the value is an RMComputed, then this is a shortcut for
    // addComputedProperty
    if (value instanceof RMComputed && typeof(property) === 'string') {
      const c = (value as RMComputed<any,any>)
      this.addComputedProperty(property, c.f, c.options)
      return true
    }

    // If the value is an RMIdref, then this is a shortcut for
    // addIdref
    if (value instanceof RMIdref && typeof(property) === 'string') {
      this.addIdref(property, value.id)
      return true
    }

    // If the property is RMNODE_ID, then this is a shorthand for
    // setting the RMNode's id
    if (property == RMNODE_ID) {
      this.setId(String(value))
      return true
    }
    
    // If the target is no longer being managed by this RMNode, then
    // try to find the node that is now managing the object and pass
    // the call to it.  Otherwise just pass the call through to the
    // target
    if (this.disconnected) {
      const node = RMNode.getNodeForObject(this.target)
      if (node != null) {
        return node.proxySet(property, value)
      }
      else {
        return Reflect.set(this.target, property, value)
      }
    }

    // Only handle string properties (not symbol)
    if (typeof(property) !== 'string') {
      // FIXME - test this
      return Reflect.set(this.target, property, value)
    }

    const target = this.target
    const hadOwnProperty = target.hasOwnProperty(property)
    const oldInternalValue = Reflect.get(target, property)
    const oldExternalValue = RMNode.toExternalValue(oldInternalValue)
    const newInternalValue = RMNode.toInternalValue(value)
    const newExternalValue = RMNode.toExternalValue(newInternalValue)

    const ret = Reflect.set(target, property, newInternalValue)

    if (!hadOwnProperty || (oldInternalValue !== newInternalValue)) {
      let removed = null

      // Set up the new value
      const added = this.referenceValue(newInternalValue, property, null)

      // Handle the old value
      if (oldInternalValue instanceof Object) {
        removed = []
      }
      this.dereferenceValue(oldInternalValue, property, removed)

      // Handle the immutable copy (if any)
      this.immutableSetProperty(property, value)

      // Fire the change event
      const listeners = this.getInterestedPropertyChangeListeners(property)
      if (listeners != null) {
        const externalAdded = RMNode.toExternalArray(added)
        const externalRemoved = RMNode.toExternalArray(removed)
        const event = {
          type: 'PropertyChange',
          target: this.proxy,
          property: property,
          oldValue: oldExternalValue,
          newValue: newExternalValue,
          hadOwnProperty: hadOwnProperty,
          hasOwnProperty: true,
          added: externalAdded,
          removed: externalRemoved
        }
        for(const listener of listeners) {
          const l = listener.listener
          l(event)
        }
      }
    }

    return ret
  }

  // Called from the proxy to delete a property value
  proxyDelete(property: (string|symbol)): boolean {
    // If the target is no longer being managed by this RMNode, then
    // try to find the node that is now managing the object and pass
    // the call to it.  Otherwise just pass the call through to the
    // target
    if (this.disconnected) {
      const node = RMNode.getNodeForObject(this.target)
      if (node != null) {
        return node.proxyDelete(property)
      }
      else {
        return Reflect.deleteProperty(this.target, property)
      }
    }
    
    // Only handle string properties (not symbol)
    if (typeof(property) !== 'string') {
      // FIXME - test this
      return Reflect.deleteProperty(this.target, property)
    }

    const target = this.target
    const hadOwnProperty = target.hasOwnProperty(property)
    const oldInternalValue = Reflect.get(target, property)
    const oldExternalValue = RMNode.toExternalValue(oldInternalValue)

    const ret = Reflect.deleteProperty(this.target, property)

    if (hadOwnProperty) {
      let removed = null
      if (oldInternalValue instanceof Object) {
        removed = []
      }

      // Handle the old value
      this.dereferenceValue(oldInternalValue, property, removed)

      // Handle the immutable copy (if any)
      this.immutableDeleteProperty(property)

      // Fire the change event
      const listeners = this.getInterestedPropertyChangeListeners(property)
      if (listeners != null) {
        const externalRemoved = RMNode.toExternalArray(removed)
        const event = {
          type: 'PropertyChange',
          target: this.proxy,
          property: property,
          oldValue: oldExternalValue,
          newValue: undefined,
          hadOwnProperty: hadOwnProperty,
          hasOwnProperty: false,
          added: null,
          removed: externalRemoved
        }
        for(const listener of listeners) {
          const l = listener.listener
          l(event)
        }
      }
    }

    return ret
  }

  //--------------------------------------------------
  // Associating RMNodes with objects

  // Returns the RMNode associated with an object, null if none
  static getNode<R extends Object>(target: R): RMNode<R> | null {
    return (target as any)[RMNODE_KEY]
  }

  // Creates a new RMNode for the given object and associates the
  // object with it
  static createNode<R extends Object>(target: R): RMNode<R> {
    const node = new RMNode(target)
    Object.defineProperty(target, RMNODE_KEY, {value: node, enumerable: false, writable: true, configurable: true})
    return node
  }

  // Removes the node associated with a key
  static deleteNode(target: object) {
    delete (target as any)[RMNODE_KEY]
  }
  
  //--------------------------------------------------

  // Returns the RModel version of a value.  If the value is not an
  // object, then it is returned as-is.  If the value is an object,
  // then the RModel associated with that object is found or created
  // (recursively doing the same for its descendants), and that
  // RModel's proxy is returned.
  static valueToRModel<R>(value: R): R {
    if (value instanceof Object) {
      return this.objectToRModel(value)
    }
    else {
      return value
    }
  }

  // Returns the RModel version of an object.  The RModel associated
  // with the object is found or created (recursively doing the same
  // for its descendants), and that RModel's proxy is returned
  static objectToRModel<R extends Object>(obj: R): R {
    let node = this.getConnectedOrDisconnectedNodeForObject(obj)
    if (node == null) {
      node = this.createNodeForObject(obj)
      node.processChildren()
      // Convince TypeScript to return the proxy as a type - FIXME is there a better way?
      return (node.proxy as any)
    }
    // If obj is an old node or proxy for an object that has been
    // removed from a tree, it may have been added to a new tree and
    // have a new node so try again, using the target directly
    else if(node.disconnected) {
      return this.objectToRModel(node.target)
    }
    else {
      // Convince TypeScript to return the proxy as a type - FIXME is there a better way?
      return (node.proxy as any)
    }
  }

  //--------------------------------------------------
  // Converting between values and nodes

  // Returns the RMNode associated with the given value, or null if
  // none
  static getNodeForValue(value: any): RMNode<any> | null {
    // If it's already an RMNode, return it
    if (value instanceof Object) {
      return RMNode.getNodeForObject(value)
    }
    else {
      return null
    }
  }
  
  // Returns the RMNode associated with the given object, or null if
  // none.  If the object has been removed from its tree, this will
  // also return null, unless the node has been added to a new tree,
  // in which case the new node is returned.
  static getNodeForObject<R extends Object>(obj: R): RMNode<R> | null {
    const node = this.getConnectedOrDisconnectedNodeForObject(obj)
    if (node != null) {
      // If obj is an old node or proxy for an object that has been
      // removed from a tree, it may have been added to a new tree and
      // have a new node so try again, using the target directly
      if (node.disconnected) {
        return RMNode.getNodeForObject(node.target)
      }
      else {
        return node
      }
    }
    else {
      return null
    }
  }

  // Returns the RMNode associated with the given object, or null if
  // none.  Returns the node even if it has been "disconnected"
  // because the object was removed from its tree
  static getConnectedOrDisconnectedNodeForObject<R extends Object>(obj: R): RMNode<R> | null {
    // If it's already an RMNode, return it
    if (obj instanceof RMNode) {
      return obj
    }

    // If it's already a proxy for an RMNode, return its RMNode
    const proxyNode = RMProxy.getNode(obj)
    if (proxyNode != null) {
      return proxyNode
    }

    // See if it already has a node
    const existingNode = RMNode.getNode(obj)
    if (existingNode != null) {
      return existingNode
    }

    return null
  }

  // Returns the RMNode associated with an object, creating it if not
  // found.
  static getOrCreateNodeForObject<R extends Object>(obj: R): RMNode<R> {
    const existingNode = RMNode.getNodeForObject(obj)
    if (existingNode != null) {
      return existingNode
    }

    // Otherwise, create a node
    return this.createNodeForObject(obj)
  }

  // Convert an object that has no existing RMNode to be the root of a
  // new RModel tree
  static createNodeForObject<R extends Object>(target: R): RMNode<R> {
    // If the target is a node or proxy, then try again using the
    // underlying target (so we don't try to creates nodes on top of
    // nodes or proxies)
    const node = this.getConnectedOrDisconnectedNodeForObject(target)
    if (node != null) {
      return this.createNodeForObject(node.target)
    }
    
    // Create the node and associate it with the target
    return RMNode.createNode(target)
  }

  // Returns the value that should be exposed to the external
  // application
  static toExternalValue<R>(value: any): R {
    if (value instanceof Object) {
      const node = RMNode.getNodeForObject(value)
      if (node == null) {
        // If we get to this point for an RMNode, it probably means
        // that the value was removed from a tree and therefore
        // doesn't have an RMNode associated with it.  Regardless,
        // return the proxy version of the RMNode
        if (value instanceof RMNode) {
          // FIXME - better way to convince TypeScript?
          return (value.proxy as any)
        }
        // It is possible for there to be Objects accessible from an
        // RModel tree that don't have RMNodes - for example,
        // functions on prototypes (e.g., Object.hasOwnProperty).
        // Also, Objects that have just been removed from a tree do
        // not (and should not) have RMNodes
        else {
          return value
        }
      }
      else {
        // FIXME - better way to convince TypeScript?
        return (node.proxy as any)
      }
    }
    else {
      return value
    }
  }

  // Converts an array of nodes to their external forms.  Returns null
  // if the array is null or empty
  static toExternalArray(arr: Array<RMNode<any>> | null): Array<any> | null {
    if (arr == null || arr.length == 0) {
      return null
    }
    const ret = []
    for(const elem of arr) {
      ret.push(elem.target)
    }
    return ret
  }

  // Returns the "internal value", that is, the value used within the
  // target objects
  static toInternalValue<R>(value: R): R {
    if (value instanceof Object) {
      const node = RMNode.getNodeForObject(value)
      if (node == null) {
        return value
      }
      else {
        return node.target
      }
    }
    else {
      return value
    }
  }

  // Returns true if the given value is associated with an RModel
  static hasRModel(value: any): boolean {
    if (value instanceof Object) {
      const node = RMNode.getConnectedOrDisconnectedNodeForObject(value)
      if (node == null) {
        return false
      }
      // If value is an old node or proxy for an object that has been
      // removed from a tree, it may have been added to a new tree and
      // have a new node so try again, using the target directly
      else if(node.disconnected) {
        return this.hasRModel(node.target)
      }
      else {
        return true
      }
    }
    else {
      return false
    }
  }

  // Returns the value being managed by this RMNode - i.e., the value
  // to which proxied get and set calls are being sent
  static getManagedValue(value: any): any {
    if (value instanceof Object) {
      const node = this.getConnectedOrDisconnectedNodeForObject(value)
      if (node == null) {
        return value
      }
      // If value is an old node or proxy for an object that has been
      // removed from a tree, it may have been added to a new tree and
      // have a new node so try again, using the target directly
      else if (node.disconnected) {
        return this.getManagedValue(node.target)
      }
      else {
        return node.target
      }
    }
    else {
      return value
    }
  }

  // Returns true if the given value already has a node, that is not
  // the root of its tree
  static hasNonRootNode(value: any): boolean {
    const node = RMNode.getNodeForObject(value)
    return node != null && !node.isRoot()
  }

  //--------------------------------------------------
  
  // Recursively processes the children of a node that has been
  // created, or whose root or parentage may have changed.  The
  // children's RModels are created if they don't already exist, and
  // their primary and secondary references and roots will be set up.
  //
  // If added is specified, then any nodes added to the tree as a
  // result of this call are added to the array
  processChildren(added: Array<RMNode<any>> | null = null) {
    const target = this.target
    const root = this.root

    // Flag indicating if any "shortcuts" were encountered, such as
    // RMComputed or RMFindById
    let hadShortcuts: boolean = false

    // Go through the object children
    for (const property in target) {
      const value = (target as any)[property]

      // If it's a "shortcut", take note of that
      if (value instanceof RMComputed || value instanceof RMIdref) {
        hadShortcuts = true
      }

      else if (value instanceof Object) {
        const childNode = RMNode.getNodeForObject(value)

        // If the child doesn't have an RMNode, create one, set this
        // as its primary reference, set its root, and proceed
        // recursively
        if (childNode == null) {
          const newChildNode = RMNode.createNodeForObject(value)
          newChildNode.setPrimaryReference(this, property, added)
          // Proceed recursively
          newChildNode.processChildren(added)
        }

        // If the child is actually a reference to this tree's root,
        // add a secondary reference
        else if (childNode === this.root) {
          childNode.addSecondaryReference(this, property)
        }

        // If the child already is the root of its own RModel tree,
        // add a primary reference to it and change its root
        else if (childNode.isRoot()) {
          childNode.setPrimaryReference(this, property, added)
          // FIXME - see if anything else needs to be "consolidated" in the root
          // Proceed recursively
          childNode.processChildren(added)
        }

        // If this child already has a primary reference from this
        // node, then just make sure its root is set
        else if (childNode.isPrimaryReference(this, property)) {
          childNode.setRoot(root, added)
          childNode.processChildren(added)
        }

        // If we get to this point and the child is already in the
        // same tree, then it must have a primary reference elsewhere.
        // Just add a secondary reference and don't proceed
        // recursively
        else if (this.isSameTree(childNode)) {
          childNode.addSecondaryReference(this, property)
        }
        
        // If we get to this point, then the child is already owned by
        // another RModel tree, which is an error
        else {
          // FIXME - better exception, including the attempted path to
          // the child and its existing path
          throw new Error('Attempt to add child from another tree')
        }
      }
    }

    // If any values were "shortcuts", then walk through the list
    // again
    if (hadShortcuts) {
      for (const property in target) {
        const value = (target as any)[property]
        if (value instanceof RMComputed) {
          const c = (value as RMComputed<any,any>)
          this.addComputedProperty(property, c.f, c.options)
        }
        else if (value instanceof RMIdref) {
          this.addIdref(property, value.id)
        }
      }
    }

    // If RMNODE_ID is set as a property, that's shorthand for setting
    // the RModel id of the value
    if (target.hasOwnProperty(RMNODE_ID)) {
      const id = (target as any)[RMNODE_ID]
      this.setId(String(id))
    }
  }

  //--------------------------------------------------
  // Array proxy handlers

  // This is called when .push(...) is called on this node's proxy
  proxyArrayPush(func: any, args: Array<any>): any {
    // Tell TypeScript we trust that the target is an array
    const targetArray:Array<any> = (this.target as any)
    const inserted = this.argsToInternalValues(args, 0)

    // Perform the operation
    const oldLength = targetArray.length
    let newCount = 0
    if (inserted != null) {
      newCount = targetArray.push(...inserted)
    }
    else {
      newCount = targetArray.push()
    }
    const newLength = targetArray.length

    // Have RModel process the change
    this.arraySplice(oldLength, 0, inserted, null, oldLength, newLength)

    // Apply changes to the immutable copy maintained by this object.
    // Do this after RModel has processed the change, so that RMNodes
    // are properly associated with all of the object arguments
    this.immutableApplyFunction(func, args)

    return newCount
  }
  
  // This is called when .pop(...) is called on this node's proxy
  proxyArrayPop(func: any, args: Array<any>): any {
    // Tell TypeScript we trust that the target is an array
    const targetArray:Array<any> = (this.target as any)
    // Perform the operation
    const oldLength = targetArray.length
    let deleted = null
    if (oldLength > 0) {
      deleted = targetArray.pop()
    }
    else {
      return undefined
    }
    const newLength = targetArray.length

    // Have RModel process the change
    const ret = this.arraySplice(oldLength - 1, 1, null, [deleted], oldLength, newLength)

    // Apply changes to the immutable copy maintained by this object.
    // Do this after RModel has processed the change, so that RMNodes
    // are properly associated with all of the object arguments
    this.immutableApplyFunction(func, args)

    return (ret == null) ? undefined : ret[0]
  }

  // This is called when .shift(...) is called on this node's proxy
  proxyArrayShift(func: any, args: Array<any>): any {
    // Tell TypeScript we trust that the target is an array
    const targetArray:Array<any> = (this.target as any)
    // Perform the operation
    const oldLength = targetArray.length
    let deleted = null
    if (oldLength > 0) {
      deleted = targetArray.shift()
    }
    else {
      return undefined
    }
    const newLength = targetArray.length

    // Have RModel process the change
    const ret = this.arraySplice(0, 1, null, [deleted], oldLength, newLength)

    // Apply changes to the immutable copy maintained by this object.
    // Do this after RModel has processed the change, so that RMNodes
    // are properly associated with all of the object arguments
    this.immutableApplyFunction(func, args)

    return (ret == null) ? undefined : ret[0]
  }
  
  // This is called when .unshift(...) is called on this node's proxy
  proxyArrayUnshift(func: any, args: Array<any>): any {
    // Tell TypeScript we trust that the target is an array
    const targetArray:Array<any> = (this.target as any)
    const inserted = this.argsToInternalValues(args, 0)

    // Perform the operation
    const oldLength = targetArray.length
    let newCount = 0
    if (inserted != null) {
      newCount = targetArray.unshift(...inserted)
    }
    else {
      newCount = targetArray.unshift()
    }
    const newLength = targetArray.length

    // Have RModel process the change
    this.arraySplice(0, 0, inserted, null, oldLength, newLength)

    // Apply changes to the immutable copy maintained by this object.
    // Do this after RModel has processed the change, so that RMNodes
    // are properly associated with all of the object arguments
    this.immutableApplyFunction(func, args)

    return newCount
  }
  
  // This is called when .splice(...) is called on this node's proxy
  proxyArraySplice(func: any, args: Array<any>): any {
    // Tell TypeScript we trust that the target is an array
    const targetArray:Array<any> = (this.target as any)
    const oldLength = targetArray.length

    // Normalize arguments
    let start = this.getSpliceStart(args, oldLength)
    let deleteCount = this.getSpliceDeleteCount(args, oldLength, start)

    const inserted = this.argsToInternalValues(args, 2)

    // Perform the operation
    let deleted = null
    if (inserted != null) {
      deleted = targetArray.splice(start, deleteCount, ...inserted)
    }
    else {
      deleted = targetArray.splice(start, deleteCount)
    }
    const newLength = targetArray.length

    // Have RModel process the change
    const ret = this.arraySplice(start, deleteCount, inserted, deleted, oldLength, newLength)

    // Apply changes to the immutable copy maintained by this object.
    // Do this after RModel has processed the change, so that RMNodes
    // are properly associated with all of the object arguments
    this.immutableApplyFunction(func, args)

    return (ret == null) ? [] : ret
  }

  // Eventual method called to update the RModel bookkeeping after an
  // array splice.  This should only be called with normalized
  // arguments
  arraySplice(start: number, deleteCount: number, inserted: Array<any> | null, deleted: Array<any> | null, oldLength: number, newLength: number): Array<any> | null {
    const insertCount = (inserted == null) ? 0 : inserted.length

    // Adjust the indexes of the original values in the array affected
    // by an insert or delete
    const adjustDelta = insertCount - deleteCount
    if (adjustDelta != 0) {
      const adjustStart = start + insertCount
      this.adjustReferrerIndexProperties(adjustStart, adjustDelta)
    }

    // Get the external values for all the values to be added,
    // referencing each of them and forming the list of nodes that
    // were added to the tree
    let addedNodes = null
    let externalInserted: Array<RMNode<any>> | null = null
    if (inserted != null) {
      externalInserted = []
      // A special case is if we are adding a descendant of an item,
      // then the item itself, neither of which is already in the
      // tree.  If both are RModels, then simply adding them in order
      // will fail on the first one, because it will think it is
      // adding an item from a different tree, even though both will
      // eventually end up in the same tree.
      //
      // To handle this, we make two passes - first we ignore those
      // objects that have an RModel but are not roots (i.e., those
      // that might trigger the error condition).  Then we go back and
      // make a second pass for those objects.
      const secondPass = []
      for (let insertedIx = 0; insertedIx < inserted.length; insertedIx++) {
        const internalInsertedElem = inserted[insertedIx]
        if (RMNode.hasNonRootNode(internalInsertedElem)) {
          secondPass.push(internalInsertedElem)
        }
        else {
          addedNodes = this.addValueForSplice(internalInsertedElem, start, insertedIx, addedNodes, externalInserted)
          secondPass.push(null)
        }
      }
      for (let insertedIx = 0; insertedIx < inserted.length; insertedIx++) {
        const internalInsertedElem = secondPass[insertedIx]
        if (internalInsertedElem != null) {
          addedNodes = this.addValueForSplice(internalInsertedElem, start, insertedIx, addedNodes, externalInserted)
        }
      }
    }

    // Convert the added nodes to their external values
    let added = null
    if (addedNodes != null && addedNodes.length > 0) {
      added = []
      for(const addedNode of addedNodes) {
        const externalAddedValue = RMNode.toExternalValue(addedNode)
        added.push(externalAddedValue)
      }
    }

    // Get the external values of all the values to be removed,
    // dereferencing each of them and forming the list of nodes that
    // were removed from the tree.  Note that this needs to happen
    // after the added nodes are referenced, since an added node might
    // be what keeps a removed node in the tree.
    let externalDeleted = null
    let removedNodes: Array<RMNode<any>> | null = null
    if (deleted != null && deleted.length > 0) {
      externalDeleted = []
      for (let deletedIx = 0; deletedIx < deleted.length; deletedIx++) {
        const internalDeletedElem = deleted[deletedIx]
        const deleteIx = start + deletedIx
        const externalDeletedElem = RMNode.toExternalValue(internalDeletedElem)
        externalDeleted.push(externalDeletedElem)
        if (internalDeletedElem instanceof Object) {
          if (removedNodes == null) {
            removedNodes = []
          }
          this.dereferenceValue(internalDeletedElem, deleteIx.toString(), removedNodes)
        }
      }
    }

    // Convert the removed nodes to their external values
    let removed = null
    if (removedNodes != null && removedNodes.length > 0) {
      removed = []
      for(const removedNode of removedNodes) {
        const externalRemovedValue = RMNode.toExternalValue(removedNode)
        removed.push(externalRemovedValue)
      }
    }

    // Fire the event if there was some change
    if (insertCount != 0 || deleteCount != 0) {
      const listeners = this.getInterestedArrayChangeListeners()
      if (listeners != null) {
        const eventTarget: any = this.proxy
        const event = {
          type: 'ArrayChange',
          target: eventTarget,
          index: start,
          deleteCount: deleteCount,
          insertCount: insertCount,
          deleted: externalDeleted,
          inserted: externalInserted,
          oldLength: oldLength,
          newLength: newLength,
          added: added,
          removed: removed
        }
        for(const listener of listeners) {
          const l = listener.listener
          l(event)
        }
      }
    }

    return externalDeleted
  }

  // Returns the "start" value that should be used for a call to
  // splice
  getSpliceStart(args: Array<any>, length: number): number {
    let start = (args.length >= 1) ? args[0] : 0
    if (start > length) {
      start = length
    }
    if (start < 0) {
      start = length + start
    }
    if (start < 0) {
      start = 0
    }
    return start
  }

  // Returns the "deleteCount" value that should be used for a call to
  // splice
  getSpliceDeleteCount(args: Array<any>, length: number, start: number): number {
    let deleteCount = (args.length >= 2) ? args[1] : length - start
    if (deleteCount < 0) {
      deleteCount = 0
    }
    if (start + deleteCount > length) {
      deleteCount = length - start
    }
    return deleteCount
  }

  // Converts the array of arguments, starting at the given value, to
  // an array of internal values, or null if the array would be empty
  argsToInternalValues(args: Array<any>, start: number): Array<any> | null {
    if (args.length > start) {
      const ret = []
      for (let i = start; i < args.length; i++) {
        const arg = args[i]
        const internalValue = RMNode.toInternalValue(arg)
        ret.push(internalValue)
      }
      return ret
    }
    else {
      return null
    }
  }
  
  // Takes care of adding a value as part of a call to splice.  Start
  // is the starting point of the splice, index is the index into the
  // array of inserted elements.  addedNodes is the list of nodes that
  // ended up being added, and inserted is the array of external
  // values of the inserted elements
  addValueForSplice(value: any, start: number, index: number, addedNodes: Array<RMNode<any>> | null, inserted: Array<any>): Array<RMNode<any>> | null {
    const ix = start + index
    const ret = this.referenceValue(value, ix.toString(), addedNodes)
    const externalValue = RMNode.toExternalValue(value)
    inserted[index] = externalValue
    return ret
  }

  // Adjusts all of the indexes of the array's element references
  // starting at the given start point going to the end of the array,
  // adjusting each one by the given delta.
  adjustReferrerIndexProperties(start: number, delta: number) {
    const arr = this.target
    if (Array.isArray(arr)) {
      // If we are increasing indexes, then start from the last element
      // and go backwards.  That way, if an element has multiple
      // secondary references from the same array, we won't temporarily
      // cause those references to collide.
      if (delta > 0) {
        for (let ix = arr.length - 1; ix >= start; ix--) {
          this.adjustElementReferrerIndexProperty(arr, ix, start, delta)
        }
      }
      // Same as above, except that if we're decreasing indexes, then
      // start from the first element and go forwards
      else if (delta < 0) {
        for (let ix = start; ix < arr.length; ix++) {
          this.adjustElementReferrerIndexProperty(arr, ix, start, delta)
        }
      }
    }
  }

  // Adjusts the index for one element of an array
  adjustElementReferrerIndexProperty(arr: Array<any>, ix: number, start: number, delta: number) {
    const value = arr[ix]
    const node = RMNode.getNodeForValue(value)
    if (node != null) {
      node.adjustReferrerIndexProperty(this, ix - delta, ix)
    }
  }

  // Adjusts the index of value's first matching reference, changing
  // it to the given newIndex
  adjustReferrerIndexProperty(referrer: RMNode<any>, oldIndex: number, newIndex: number) {
    const oldIndexStr = oldIndex.toString()
    const newIndexStr = newIndex.toString()
    const primaryReference = this.primaryReference
    if (primaryReference != null && primaryReference.matches(referrer, oldIndexStr)) {
      primaryReference.property = newIndexStr
      return
    }
    const secondaryReferences = this.secondaryReferences
    if (secondaryReferences != null) {
      for(const secondaryReference of secondaryReferences) {
        if (secondaryReference.matches(referrer, oldIndexStr)) {
          secondaryReference.property = newIndexStr
          return
        }
      }
    }
  }
  
  //--------------------------------------------------
  // Array proxy functions

  // Returns the proxy function that should be returned when .push is
  // called on this object.  The proxy will pass its call back to
  // proxyArrayPush on this node.
  get pushProxy(): Function {
    if (this._pushProxy == null) {
      const handler: any = new RMArrayPushProxy(this)
      const proxy: any = new Proxy(Array.prototype.push, handler)
      this._pushProxy = proxy
    }
    // Assure TypeScript that the returned value will not be null
    return (this._pushProxy as Function)
  }

  // Returns the proxy function that should be returned when .pop is
  // called on this object.  The proxy will pass its call back to
  // proxyArrayPop on this node.
  get popProxy(): Function {
    if (this._popProxy == null) {
      const handler: any = new RMArrayPopProxy(this)
      const proxy: any = new Proxy(Array.prototype.pop, handler)
      this._popProxy = proxy
    }
    // Assure TypeScript that the returned value will not be null
    return (this._popProxy as Function)
  }

  // Returns the proxy function that should be returned when .unshift
  // is called on this object.  The proxy will pass its call back to
  // proxyArrayUnshift on this node.
  get unshiftProxy(): Function {
    if (this._unshiftProxy == null) {
      const handler: any = new RMArrayUnshiftProxy(this)
      const proxy: any = new Proxy(Array.prototype.unshift, handler)
      this._unshiftProxy = proxy
    }
    // Assure TypeScript that the returned value will not be null
    return (this._unshiftProxy as Function)
  }

  // Returns the proxy function that should be returned when .shift
  // is called on this object.  The proxy will pass its call back to
  // proxyArrayShift on this node.
  get shiftProxy(): Function {
    if (this._shiftProxy == null) {
      const handler: any = new RMArrayShiftProxy(this)
      const proxy: any = new Proxy(Array.prototype.shift, handler)
      this._shiftProxy = proxy
    }
    // Assure TypeScript that the returned value will not be null
    return (this._shiftProxy as Function)
  }

  // Returns the proxy function that should be returned when .splice
  // is called on this object.  The proxy will pass its call back to
  // proxyArraySplice on this node.
  get spliceProxy(): Function {
    if (this._spliceProxy == null) {
      const handler: any = new RMArraySpliceProxy(this)
      const proxy: any = new Proxy(Array.prototype.splice, handler)
      this._spliceProxy = proxy
    }
    // Assure TypeScript that the returned value will not be null
    return (this._spliceProxy as Function)
  }

  //--------------------------------------------------
  // Listeners and events

  // Adds the given listener to the list of listeners to be notified
  // when a change is made to an object.  By default, the listener
  // will only be notified of changes made to this object, and will be
  // notified of changes to any property.  Those behaviors can be
  // changed by specifying options with the listener.
  //
  // Listeners may be added multiple times even with the same options.
  // All registered listeners will be notified in the order they were
  // added, which means that a listener could be notified multiple
  // times if it was added multiple times
  addChangeListener(listener: ChangeListener, options: ChangeListenerOptions | null = null) {
    const l = new RMChangeListener(listener, options)
    if (this.changeListeners == null) {
      this.changeListeners = [l]
    }
    else {
      this.changeListeners.push(l)
    }
  }

  // Removes the listener that was originally added with the given
  // listener and options.  Note that the options must match exactly -
  // if one set of options specifies a value that is the default, and
  // another set of options leaves that value blank (thereby using the
  // default), those are still not considered a match.
  //
  // Duplicate listeners are removed in reverse order of when they
  // were added.
  //
  // If the listener is not found, the method exits without change
  removeChangeListener(listener: ChangeListener, options: ChangeListenerOptions | null = null) {
    const listeners = this.changeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener, options)) {
          listeners.splice(i, 1)
          return
        }
      }
    }
  }

  // Returns true if any of the existing listeners match the given
  // parameters
  hasChangeListener(listener: ChangeListener, options: ChangeListenerOptions | null = null): boolean {
    const listeners = this.changeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener, options)) {
          return true
        }
      }
    }
    return false
  }

  // Returns the array of listeners that are interested in being
  // notified of a change to the given property on this node
  getInterestedPropertyChangeListeners(property: string): Array<RMChangeListener> | null {
    let ret = null
    for(let n:RMNode<any>|null = this; n != null; n = n.parent) {
      const listeners:Array<RMChangeListener>|null = n.changeListeners
      if (listeners != null) {
        for(const l of listeners) {
          if (l.isInterestedInPropertyChange(n, this, property)) {
            if (ret == null) {
              ret = [l]
            }
            else {
              ret.push(l)
            }
          }
        }
      }
    }
    return ret
  }

  // Returns the array of listeners that are interested in being
  // notified of a change to this node's array value
  getInterestedArrayChangeListeners(): Array<RMChangeListener> | null {
    let ret = null
    for(let n:RMNode<any>|null = this; n != null; n = n.parent) {
      const listeners:Array<RMChangeListener> | null = n.changeListeners
      if (listeners != null) {
        for(const l of listeners) {
          if (l.isInterestedInArrayChange(n, this)) {
            if (ret == null) {
              ret = [l]
            }
            else {
              ret.push(l)
            }
          }
        }
      }
    }
    return ret
  }

  //--------------------------------------------------
  // RootChangeListeners
  
  // Adds the given listener to the list of listeners to be notified
  // when the root of an object changes.  Duplicate listeners may be
  // added.  All added listeners, including duplicates, will be
  // notified in the order they were added.
  addRootChangeListener(listener: RootChangeListener) {
    const l = new RMRootChangeListener(listener)
    if (this.rootChangeListeners == null) {
      this.rootChangeListeners = [l]
    }
    else {
      this.rootChangeListeners.push(l)
    }
  }

  // Removes the listener that was originally added with the given
  // listener.  Duplicate listeners are removed in reverse order of
  // when they were added.  If the listener is not found, the method
  // exits without change
  removeRootChangeListener(listener: RootChangeListener) {
    const listeners = this.rootChangeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener)) {
          listeners.splice(i, 1)
          return
        }
      }
    }
  }

  // Returns true if any of the existing listeners match the given
  // parameters
  hasRootChangeListener(listener: RootChangeListener): boolean {
    const listeners = this.rootChangeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener)) {
          return true
        }
      }
    }
    return false
  }

  // Notifies any listeners of a change to the root
  notifyRootChangeListeners(oldRoot: RMNode<any>, newRoot: RMNode<any>) {
    const listeners = this.rootChangeListeners
    if (listeners != null && listeners.length > 0) {
      const listenersCopy = listeners.slice()
      const e:RootChangeEvent = {
        type: 'RootChange',
        target: RMNode.toExternalValue(this),
        oldValue: RMNode.toExternalValue(oldRoot),
        newValue: RMNode.toExternalValue(newRoot),
      }
      for(const l of listenersCopy) {
        l.listener(e)
      }
    }
  }

  // FIXME - all of the above are only tested implicitly by testing computed properties

  //--------------------------------------------------
  // ParentChangeListeners
  
  // Adds the given listener to the list of listeners to be notified
  // when the parent of an object changes.  Duplicate listeners may be
  // added.  All added listeners, including duplicates, will be
  // notified in the order they were added.
  addParentChangeListener(listener: ParentChangeListener) {
    const l = new RMParentChangeListener(listener)
    if (this.parentChangeListeners == null) {
      this.parentChangeListeners = [l]
    }
    else {
      this.parentChangeListeners.push(l)
    }
  }

  // Removes the listener that was originally added with the given
  // listener.  Duplicate listeners are removed in reverse order of
  // when they were added.  If the listener is not found, the method
  // exits without change
  removeParentChangeListener(listener: ParentChangeListener) {
    const listeners = this.parentChangeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener)) {
          listeners.splice(i, 1)
          return
        }
      }
    }
  }

  // Returns true if any of the existing listeners match the given
  // parameters
  hasParentChangeListener(listener: ParentChangeListener): boolean {
    const listeners = this.parentChangeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener)) {
          return true
        }
      }
    }
    return false
  }

  // Notifies any listeners of a change to the parent
  notifyParentChangeListeners(oldParent: RMNode<any> | null, newParent: RMNode<any> | null) {
    const listeners = this.parentChangeListeners
    if (listeners != null && listeners.length > 0) {
      const listenersCopy = listeners.slice()
      const e:ParentChangeEvent = {
        type: 'ParentChange',
        target: RMNode.toExternalValue(this),
        oldValue: RMNode.toExternalValue(oldParent),
        newValue: RMNode.toExternalValue(newParent),
      }
      for(const l of listenersCopy) {
        l.listener(e)
      }
    }
  }

  // FIXME - all of the above are only tested implicitly by testing computed properties

  //--------------------------------------------------
  // PropertyNameChangeListeners
  
  // Adds the given listener to the list of listeners to be notified
  // when the parent of an object changes.  Duplicate listeners may be
  // added.  All added listeners, including duplicates, will be
  // notified in the order they were added.
  addPropertyNameChangeListener(listener: PropertyNameChangeListener) {
    const l = new RMPropertyNameChangeListener(listener)
    if (this.propertyNameChangeListeners == null) {
      this.propertyNameChangeListeners = [l]
    }
    else {
      this.propertyNameChangeListeners.push(l)
    }
  }

  // Removes the listener that was originally added with the given
  // listener.  Duplicate listeners are removed in reverse order of
  // when they were added.  If the listener is not found, the method
  // exits without change
  removePropertyNameChangeListener(listener: PropertyNameChangeListener) {
    const listeners = this.propertyNameChangeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener)) {
          listeners.splice(i, 1)
          return
        }
      }
    }
  }

  // Returns true if any of the existing listeners match the given
  // parameters
  hasPropertyNameChangeListener(listener: PropertyNameChangeListener): boolean {
    const listeners = this.propertyNameChangeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener)) {
          return true
        }
      }
    }
    return false
  }

  // Notifies any listeners of a change to the parent
  notifyPropertyNameChangeListeners(oldProperty: string | null, newProperty: string | null) {
    const listeners = this.propertyNameChangeListeners
    if (listeners != null && listeners.length > 0) {
      const listenersCopy = listeners.slice()
      const e:PropertyNameChangeEvent = {
        type: 'PropertyNameChange',
        target: RMNode.toExternalValue(this),
        oldValue: oldProperty,
        newValue: newProperty,
      }
      for(const l of listenersCopy) {
        l.listener(e)
      }
    }
  }

  // FIXME - all of the above are only tested implicitly by testing computed properties

  //--------------------------------------------------
  // IdChangeListeners
  
  // Adds the given listener to the list of listeners to be notified
  // when the id of an object changes.  Duplicate listeners may be
  // added.  All added listeners, including duplicates, will be
  // notified in the order they were added.
  addIdChangeListener(listener: IdChangeListener) {
    const l = new RMIdChangeListener(listener)
    if (this.idChangeListeners == null) {
      this.idChangeListeners = [l]
    }
    else {
      this.idChangeListeners.push(l)
    }
  }

  // Removes the listener that was originally added with the given
  // listener.  Duplicate listeners are removed in reverse order of
  // when they were added.  If the listener is not found, the method
  // exits without change
  removeIdChangeListener(listener: IdChangeListener) {
    const listeners = this.idChangeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener)) {
          listeners.splice(i, 1)
          return
        }
      }
    }
  }

  // Returns true if any of the existing listeners match the given
  // parameters
  hasIdChangeListener(listener: IdChangeListener): boolean {
    const listeners = this.idChangeListeners
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener)) {
          return true
        }
      }
    }
    return false
  }

  // Notifies any listeners of a change to the id
  notifyIdChangeListeners(oldId: string | null, newId: string | null) {
    const listeners = this.idChangeListeners
    if (listeners != null && listeners.length > 0) {
      const listenersCopy = listeners.slice()
      const e:IdChangeEvent = {
        type: 'IdChange',
        target: RMNode.toExternalValue(this),
        oldValue: oldId,
        newValue: newId,
      }
      for(const l of listenersCopy) {
        l.listener(e)
      }
    }
  }

  // FIXME - all of the above are only tested implicitly by testing computed properties

  //--------------------------------------------------
  // FindByIdChangeListeners
  
  // Adds the given listener to the list of listeners to be notified
  // when the mapping from id to object changes.  Duplicate listeners
  // may be added.  All added listeners, including duplicates, will be
  // notified in the order they were added.
  addFindByIdChangeListener(listener: FindByIdChangeListener, id: string) {
    const l = new RMFindByIdChangeListener(listener, id)
    if (this.findByIdChangeListeners == null) {
      this.findByIdChangeListeners = {}
    }
    const listeners = this.findByIdChangeListeners[id]
    if (listeners == null) {
      this.findByIdChangeListeners[id] = [l]
    }
    else {
      listeners.push(l)
    }
  }

  // Removes the listener that was originally added with the given
  // listener and id.  Duplicate listeners are removed in reverse
  // order of when they were added.  If the listener is not found, the
  // method exits without change
  removeFindByIdChangeListener(listener: FindByIdChangeListener, id: string) {
    const listeners = this.findByIdChangeListeners ? this.findByIdChangeListeners[id] : null
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener, id)) {
          listeners.splice(i, 1)
          if (listeners.length == 0 && this.findByIdChangeListeners != null) {
            delete this.findByIdChangeListeners[id]
          }
          return
        }
      }
    }
  }

  // Returns true if any of the existing listeners match the given
  // parameters
  hasFindByIdChangeListener(listener: FindByIdChangeListener, id: string): boolean {
    const listeners = this.findByIdChangeListeners ? this.findByIdChangeListeners[id] : null
    if (listeners != null) {
      for(let i = listeners.length - 1; i >= 0; i--) {
        const l = listeners[i]
        if (l.matches(listener, id)) {
          return true
        }
      }
    }
    return false
  }

  // Notifies any listeners of a change to the object mapped to a
  // given id
  notifyFindByIdChangeListeners(id: string, oldValue: RMNode<any> | null, newValue: RMNode<any> | null) {
    const listeners = this.findByIdChangeListeners ? this.findByIdChangeListeners[id] : null
    if (listeners != null && listeners.length > 0) {
      let listenersCopy = null
      for(const l of listeners) {
        if (l.id == id) {
          if (listenersCopy == null) {
            listenersCopy = [l]
          }
          else {
            listenersCopy.push(l)
          }
        }
      }
      if (listenersCopy != null) {
        const e:FindByIdChangeEvent = {
          type: 'FindByIdChange',
          target: RMNode.toExternalValue(this),
          id: id,
          oldValue: RMNode.toExternalValue(oldValue),
          newValue: RMNode.toExternalValue(newValue),
        }
        for(const l of listenersCopy) {
          l.listener(e)
        }
      }
    }
  }

  // Moves any findById change listeners from this node to the
  // specified newRoot.  If the newRoot contains new mappings from id
  // to object, then the appropriate listeners are called
  transferFindByIdChangeListeners(newRoot: RMNode<any>) {
    // FIXME - test this
    const findByIdChangeListeners = this.findByIdChangeListeners
    if (findByIdChangeListeners != null) {
      // Go through all the listeners of all the id's
      for(const id in findByIdChangeListeners) {
        const listeners = findByIdChangeListeners[id]
        if (listeners != null && listeners.length > 0) {
          // See if the id mapping is effectively changing from the
          // point of view of the listener
          const oldValue = this.nodesById ? this.nodesById[id] : null
          const newValue = newRoot.nodesById ? newRoot.nodesById[id] : null
          let e:FindByIdChangeEvent|null = null
          if (oldValue !== newValue) {
            e = {
              type: 'FindByIdChange',
              target: RMNode.toExternalValue(newRoot),
              id: id,
              oldValue: RMNode.toExternalValue(oldValue),
              newValue: RMNode.toExternalValue(newValue),
            }
          }
          // Go through the listeners, adding them to the new root
          for(const l of listeners) {
            newRoot.addFindByIdChangeListener(l.listener, l.id)
            // If the id mapping effectively changed, let the listener
            // know
            if (e != null) {
              l.listener(e)
            }
          }
        }
      }
      this.findByIdChangeListeners = null
    }
  }

  // FIXME - all of the above are only tested implicitly by testing computed properties

  //--------------------------------------------------

  // Handles the mechanics of referencing a value - determines if it
  // should be a primary or seconday reference should be added, and
  // handles recursively processing any children.  Returns an array of
  // the nodes that were added to the tree (using the passed-in added
  // array if one was supplied)
  referenceValue(value: any, property: string, added: Array<RMNode<any>> | null): Array<RMNode<any>> | null {
    if (value instanceof Object) {
      const newNode = RMNode.getOrCreateNodeForObject(value)
      // If we're referencing the root of this tree, just add it as
      // a secondary reference
      if (newNode === this.root) {
        newNode.addSecondaryReference(this, property)
      }
      // If there's no primary reference, (and it's not the root)
      // then set it and proceed recursively
      else if (newNode.primaryReference == null) {
        if (added == null) {
          added = []
        }
        newNode.setPrimaryReference(this, property, added)
        newNode.processChildren(added)
      }
      // There's already a primary reference - add as a secondary
      // reference, as long as it's coming from the same tree.
      else if (this.isSameTree(newNode.parent)) {
        newNode.addSecondaryReference(this, property)
      }
      // Otherwise, this is an attempt to reference a node that
      // belongs to a different tree
      else {
        // FIXME - better error
        throw new Error('Cannot set a property to point to an object belonging to a different tree')
      }
    }
    return added
  }
                 
  //--------------------------------------------------
  // Handling replacement and possibly removal of nodes

  // Called when the given value is being dereferenced by this node,
  // either from being replaced by a property set, or from a property
  // delete.  If removed is specified, then any nodes removed from the
  // tree are placed in that array.
  dereferenceValue(value: any, property: string, removed: Array<RMNode<any>> | null) {
    if (value instanceof Object) {
      const oldNode = RMNode.getNodeForObject(value)
      if (oldNode != null) {
        // If this was the primary reference for the node...
        if (oldNode.isPrimaryReference(this, property)) {
          oldNode.removePrimaryReference(removed)
        }
        // This must have been a secondary reference, so remove it
        else {
          oldNode.removeSecondaryReference(this, property)
        }
      }
    }
  }

  // Called to indicate that the primary reference for a node is being
  // removed, as a result of a property set or delete.  If removed is
  // specified, then any nodes removed from the tree as a result are
  // added to that array.
  removePrimaryReference(removed: Array<RMNode<any>> | null) {
    // First check if there's a secondary reference from a referrer
    // that's not a descendant of this node
    const secondaryRef = this.findReplacementSecondaryReference()
    if (secondaryRef != null) {
      this.assignPrimaryReference(secondaryRef)
    }
    else {
      this.assignPrimaryReference(null)
      this.dereferenced(removed)
    }
  }

  // Called when all references to this node from outside of its tree
  // have been removed.  This triggers a "mini garbage collection",
  // since there still might be secondary references to descendants of
  // this node, which could then include more references, etc.  Only
  // after following all of these references can we safely determine
  // which nodes should be removed from the tree, and we can also
  // reassign primary and secondary references.
  //
  // If removed is specified then any nodes removed from the tree as a
  // result are added to that array.
  dereferenced(removed: Array<RMNode<any>> | null) {
    // Get all of this node's descendants and clear their GC flags
    const nodes = this.thisAndDescendants
    for(const node of nodes) {
      node.isGCing = true
      node.isGCReferenced = false
      node.isGCPrimaryReferenced = false
    }

    // Find any nodes that still have a secondary reference from a
    // referrer that's not being considered for GC
    const referenced = []
    for(const node of nodes) {
      if (node.hasSecondaryReferenceNotGCing()) {
        referenced.push(node)
        node.isGCReferenced = true
      }
    }

    // Starting with that "root" set, find any additional references
    for(let i = 0; i < referenced.length; i++) {
      const node = referenced[i]
      for (const property in node.target) {
        const val = (node.target as any)[property]
        const propertyNode = RMNode.getNodeForValue(val)
        // Make sure the referenced object is one under consideration
        // for GC, but hasn't yet been marked as referenced
        if (propertyNode != null && propertyNode.isGCing && !propertyNode.isGCReferenced) {
          referenced.push(propertyNode)
          propertyNode.isGCReferenced = true
        }
      }
    }

    // For nodes that are marked as referenced, we need to make sure
    // each is assigned a valid primary reference.  Be sure to walk
    // through this in the order that references were found, as that
    // will make sure that new primary references will be successfully
    // found for each.
    for(const node of referenced) {
      node.assignPostGCPrimaryReference()
      node.isGCPrimaryReferenced = true
    }

    // Any nodes not marked as referenced at this point can be removed
    for(const node of nodes) {
      if (!node.isGCReferenced) {
        node.removeNode()
        if (removed != null) {
          removed.push(node)
        }
      }
    }

    // Clear out the GC flags
    for(const node of nodes) {
      node.isGCing = false
      node.isGCReferenced = false
      node.isGCPrimaryReferenced = false
    }
  }

  // Searches the secondary references of this node, most recent
  // first, for one that comes from a referrer that is not a
  // descendant of this node.  Returns null if no such reference is
  // found.  If one is found, then it is removed from the list of
  // secondary references and returned.
  findReplacementSecondaryReference(): RMReference | null {
    const refs = this.secondaryReferences
    if (refs == null) {
      return null
    }
    for (let i = refs.length - 1; i >= 0; i--) {
      const ref = refs[i]
      // Make sure the referrer doesn't come from this node or one
      // of its descendants
      if (!ref.referrer.isSameOrDescendantOf(this)) {
        refs.splice(i, 1)
        return ref
      }
    }
    return null
  }

  // Returns true if this node has a secondary reference whose
  // referrer is not currently involved in GC
  hasSecondaryReferenceNotGCing(): boolean {
    const refs = this.secondaryReferences
    if (refs == null) {
      return false
    }
    for(const ref of refs) {
      if (!ref.referrer.isGCing) {
        return true
      }
    }
    return false
  }

  // Searches through this node's references for one that will be a
  // suitable replacement as a primary reference after a "GC" - one
  // whose referrer isn't being considered for GC, or is referenced
  assignPostGCPrimaryReference() {
    // See if the primary reference already satisfies the conditions
    const primary = this.primaryReference
    if (primary != null && (!primary.referrer.isGCing || primary.referrer.isGCPrimaryReferenced)) {
      return
    }
    const refs = this.secondaryReferences
    if (refs != null) {
      for (let i = refs.length - 1; i >= 0; i--) {
        const ref = refs[i]
        if (!ref.referrer.isGCing || ref.referrer.isGCPrimaryReferenced) {
          refs.splice(i, 1)
          this.assignPrimaryReference(ref)
          return
        }
      }
    }
    // FIXME - this shouldn't happen
    throw new Error('Assertion failed: Node is left without a primary reference')
  }

  // Disconnects this node from its target object, effectively
  // removing it from the RModel system
  removeNode() {
    // If the node has an id, remove it from the root
    if (this.id) {
      this.root.setNodeById(this.id, null)
    }
    
    // Go through all of the node's references and remove them
    for (const property in this.target) {
      const val = (this.target as any)[property]
      const childNode = RMNode.getNodeForValue(val)
      if (childNode != null) {
        childNode.removeReference(this, property)
      }
    }
    
    if (this.target != null) {
      RMNode.deleteNode(this.target)
      this.disconnected = true
    }

    // FIXME - clear out all of the values in the node
    this.changeListeners = null

    // Disconnect and remove all computed properties
    const computedProperties = this.computedProperties
    if (computedProperties != null) {
      for(const computedProperty of computedProperties) {
        computedProperty.disconnect()
      }
    }
    this.computedProperties = null

    // Remove the immutable values
    this.immutableValue = null
    this.newImmutableValue = null
    this._immutableTracker = null
  }

  //--------------------------------------------------
  // Computed properties

  // Adds a computed property, which will set the given property using
  // the result of the given function, tracking dependencies so that
  // if any of those dependencies change, the function will be called
  // again and the property's value set again.
  //
  // By default, changes to dependencies will be "buffered" until the
  // end of the current "tick", at which point the property will be
  // recomputed.  This behavior can be changed by specifying the
  // "immediate" option, which will force the property to be
  // recomputed immediately every time any change is made to any
  // dependency.
  //
  // A property can only have one associated computed property at a
  // time, so calling this will remove any existing computed property
  // with the same property name.
  addComputedProperty<R>(property: string, f: (obj:T)=>R, options: ComputedPropertyOptions | null) {
    // Replace any existing property
    this.removeComputedProperty(property)

    // Add the property
    const targetObject = RMNode.toExternalValue<T>(this)
    const computedProperty = new RMComputedProperty<T,R>(this, targetObject, property, f, options)
    if (this.computedProperties == null) {
      this.computedProperties = [computedProperty]
    }
    else {
      this.computedProperties.push(computedProperty)
    }

    // Trigger it to compute and assign its value
    computedProperty.computeAndAssignValue()
  }

  // Removes any existing computed property for the given property
  // name.  Note that this will not delete or change the existing
  // value of the property.
  removeComputedProperty(property: string) {
    const computedProperties = this.computedProperties
    if (computedProperties != null) {
      for(let i = 0; i < computedProperties.length; i++) {
        const computedProperty = computedProperties[i]
        if (computedProperty.property == property) {
          computedProperties.splice(i, 1)
          computedProperty.disconnect()
          return
        }
      }
    }
  }

  // Shorthand for adding a computed property that computes its value
  // by calling findById with the given id
  addIdref(property: string, id: string) {
    this.addComputedProperty(property, v=>this.findById(id), null)
  }

  //--------------------------------------------------
  // Id's

  // Sets or changes the id of this object, registering the change
  // with the id-to-object mapping stored in the root
  setId(id: string) {
    const oldId = this.id
    if (oldId != id) {
      this.assignId(id)

      // Remove the old mapping (if any), then set the new value on
      // the root
      const r = this.root
      if (oldId != null) {
        r.setNodeById(oldId, null)
      }
      if (r.hasNodeWithId(id)) {
        throw new Error(`Attempt to set or add two objects with the same id '${id}' in the same tree`)
      }
      r.setNodeById(id, this)
    }
  }

  // Returns the id assigned to this object, null if no id has been
  // assigned
  getId(): string | null {
    RMDependencyTrackers.addIdDependency(this)
    return this.id
  }

  // Removes the id assigned to this object, registering the change
  // with the id-to-object mapping stored in the root
  deleteId() {
    const oldId = this.id
    if (oldId != null) {
      this.assignId(null)

      // Set the value on the mapping at the root
      this.root.setNodeById(oldId, null)
    }
  }

  assignId(id: string | null) {
    const oldId = this.id
    this.id = id
    const newId = this.id
    if (oldId !== newId) {
      this.notifyIdChangeListeners(oldId, newId)
    }
  }

  // Consults the id-to-object mapping stored in the root and returns
  // the object with the given id, or null if not found
  findById(id: string): object | null {
    RMDependencyTrackers.addFindByIdDependency(this, id)
    const node = this.findNodeById(id)
    if (node != null) {
      return RMNode.toExternalValue(node)
    }
    else {
      return null
    }
  }

  // Consults the id-to-object mapping stored in the root and returns
  // the object with the given id, or null if not found
  findNodeById(id: string): RMNode<any> | null {
    const nodesById = this.root.nodesById
    if (nodesById != null) {
      return nodesById[id]
    }
    else {
      return null
    }
  }

  // Takes any nodesById settings on the current node, and merges them
  // into the newRoot, removing them from the oldRoot
  mergeNodesById(newRoot: RMNode<any>) {
    const nodesById = this.nodesById
    if (nodesById != null) {
      // Go through all the mappings, transferring them to the new
      // root
      for(const id in nodesById) {
        const node = nodesById[id]
        if (node != null) {
          if (newRoot.hasNodeWithId(id)) {
            throw new Error(`Attempt to add on object with the same id '${id}' as an object already in the tree`)
          }
          else {
            newRoot.setNodeById(id, node)
          }
        }
      }
    }
  }

  // Handles the mechanics of updating the mapping from id to node
  setNodeById(id: string, value: RMNode<any> | null) {
    if (value == null) {
      if (this.nodesById != null && this.nodesById.hasOwnProperty(id)) {
        const oldValue = this.nodesById[id]
        delete this.nodesById[id]
        this.notifyFindByIdChangeListeners(id, oldValue, null)
      }
    }
    else {
      if (this.nodesById == null) {
        this.nodesById = {}
      }
      const oldValue = this.nodesById[id]
      this.nodesById[id] = value
      this.notifyFindByIdChangeListeners(id, oldValue, value)
    }
  }

  // Returns true if this has a mapping from id to node
  hasNodeWithId(id: string): boolean {
    return this.nodesById != null && this.nodesById.hasOwnProperty(id)
  }
  
  //--------------------------------------------------
  // Immutable
  //
  // An RMNode can maintain an immutable value equivalent to its
  // target value. If a change is made to the target value, then a new
  // shallow copy of the immutable value is created and the change is
  // applied to that copy.  Then, all of the referrers are similarly
  // modified so that they point to the new copy - they are also
  // modified by making a shallow copy that is modified.  This
  // continues until the "immutable root" is reached, which is the
  // node previously designated by calling followImmutable(), at which
  // point the ImmutableListener function is invoked.
  //
  // Because a single operation can modify multiple objects
  // (especially if computed properties are involved), the above
  // process does not immediately call the listener.  Instead, changes
  // are "buffered" until the next "tick".  If a change is made to an
  // object that was already changed in the current "tick", then that
  // change is applied to the current shallow copy in use, as opposed
  // to creating a new shallow copy.
  //
  // Each object, therefore, keeps its immutable value, and possibly
  // the shallow copy that is being modified during the current
  // "tick".  Once the "tick" is over, all of those temporary shallow
  // copies are moved over to become new immutable values, and the
  // listener is notified.  The RMImmutableTracker manages this
  // process.

  // Sets this node and all of its descendants to maintain an
  // immutable copy.  If the node or its descendants are modified,
  // then the listener will be notified of the new immutable copy
  // value.
  //
  // This returns the initial immutable copy of the object
  followImmutable(listener: ImmutableListener<T>): T {
    if (this.immutableTracker != null) {
      // FIXME test this
      throw new Error('followImmutable has already been called on this object or one of its ancestors')
    }

    // Create the RMImmutableTracker
    this._immutableTracker = new RMImmutableTracker(this, listener)
    // Create and return the immutable copy of this value
    this.getOrCreateImmutableValue()
    if(this.immutableValue == null) {
      throw new Error('Assertion failed: immutableValue is null')
    }
    return this.immutableValue
  }

  // Returns the RMImmutableTracker in effect for this node
  get immutableTracker(): RMImmutableTracker<T> | null {
    // FIXME - test this
    for (let n:RMNode<any>|null = this; n != null; n = n.parent) {
      const it = n._immutableTracker
      if (it != null) {
        return it
      }
    }
    return null
  }

  // Returns true if this node is in an area of the tree that is
  // maintaining an immutable copy
  get hasImmutableTracker(): boolean {
    return this.immutableTracker != null
  }

  // Creates and returns the immutable copy of this node's value
  getOrCreateImmutableValue(): object {
    if(this.immutableValue == null) {
      // Create a deep copy of the target
      const target = this.target
      const val = this.prepareImmutableCopy(target)
      for(const k in target) {
        const v = (target as any)[k]
        const n = RMNode.getNodeForValue(v)
        if (n != null && n.parent === this) {
          (val as any)[k] = n.getOrCreateImmutableValue()
        }
        else {
          (val as any)[k] = v
        }
      }

      this.immutableValue = val
    }
    return this.immutableValue
  }

  // Creates a new object that can be used as a copy of the given
  // object
  prepareImmutableCopy<R extends object>(obj: R): R {
    const ret: any = (Array.isArray(obj)) ? Array(obj.length) : {}

    // Set the immutable node to point back to this node, so that
    // calling RModel(...) on it will return the mutable proxy
    Object.defineProperty(ret, RMNODE_KEY, {value: this, enumerable: false, writable: true, configurable: true})

    return ret
  }

  // Called by the RMImmutableTracker at the end of the current 'tick'
  // to indicate that the node can now put the new immutable value
  // into use
  flushImmutableChanges() {
    this.immutableValue = this.newImmutableValue
    this.newImmutableValue = null
  }

  // Called when mutating the value of this object.  This creates a
  // shallow copy of the object's current immutable value.  It then
  // notifies all of the referrers to also prepareImmutableChange, and
  // changes their referring properties to point to the new shallow
  // copy.
  //
  // If a new immutable value is in place, then that is returned.
  //
  // This does nothing if this object is not maintaining an immutable
  // copy, or has already been prepared.  It returns null in that
  // case.
  prepareImmutableChange(): object | null {
    const immutableTracker = this.immutableTracker
    // Check that this is an immutable object that hasn't already been
    // prepared
    if (immutableTracker != null && this.newImmutableValue == null) {
      // Make a shallow copy of the immutable value
      const oldValue = this.immutableValue
      if(oldValue == null) {
        throw new Error(`Assertion failed: immutableValue should not be null: ${this.pathStr}`)
      }
      const newValue = this.prepareImmutableCopy(oldValue)
      Object.assign(newValue, oldValue)
      this.newImmutableValue = newValue

      // Notify the immutableTracker
      immutableTracker.addChangedNode(this)

      // Branch out to the referrers
      this.prepareImmutableChangeReferrers(newValue)
    }
    return this.newImmutableValue
  }

  // Prepares all referrers to point to the new immutable value
  prepareImmutableChangeReferrers(newValue: object) {
    if (this.primaryReference != null) {
      this.prepareImmutableChangeReferrer(this.primaryReference, newValue)
    }
    if (this.secondaryReferences != null) {
      for(const ref of this.secondaryReferences) {
        this.prepareImmutableChangeReferrer(ref, newValue)
      }
    }
  }

  // Prepares a referrer to point to the new immutable value
  prepareImmutableChangeReferrer(ref: RMReference, newValue: object) {
    // Set up the referrer to have a new immutable value
    const refObj = ref.referrer.prepareImmutableChange()
    // Change that immutable value to this object's new immutable
    // value
    if (refObj != null) {
      (refObj as any)[ref.property] = newValue
    }
  }

  // Called by proxySet to perform the corresponding change in the
  // immutable copy being maintained by the object
  immutableSetProperty(property: string, value: any) {
    const nvalue = this.prepareImmutableChange()
    if (nvalue != null) {
      const n = RMNode.getNodeForValue(value)
      if (n == null) {
        (nvalue as any)[property] = value
      }
      else {
        (nvalue as any)[property] = n.getOrCreateImmutableValue()
      }
    }
  }

  // Called by proxyDelete to perform the corresponding change in the
  // immutable copy being maintained by the object
  immutableDeleteProperty(property: string) {
    const nvalue = this.prepareImmutableChange()
    if (nvalue != null) {
      delete (nvalue as any)[property]
    }
  }

  // Used by the array proxy functions to perfom a corresponding
  // change in the immutable copy of an array
  immutableApplyFunction(func: any, args: Array<any>) {
    const nvalue = this.prepareImmutableChange()
    if (nvalue != null) {
      const nargs = []
      for (const arg of args) {
        const n = RMNode.getNodeForValue(arg)
        if (n == null) {
          nargs.push(arg)
        }
        else {
          nargs.push(n.getOrCreateImmutableValue())
        }
      }

      // Apply the function to the immutable value, using the new
      // arguments
      Reflect.apply(func, nvalue, nargs)
    }
  }
}

// The key on an underlying object that refers back to its RMNode
const RMNODE_KEY = Symbol('RMNODE_KEY')

// The key that, when set on a RModel value, sets the RModel's id
export const RMNODE_ID = Symbol('RMNODE_ID')
