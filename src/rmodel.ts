// The main entry point into the RModel API.  An application will
// typically include RModel something like this:
//
// import RModel from 'rmodel'
//
// RModel would then be avaliable as a function that can "RModel-ize"
// objects like this:
//
//   r = RModel({id: 10, title: "White Christmas"})
//
// RModel also exposes its api calls as functions:
//
//   path = RModel.path(r)

import RMGlobal from './RMGlobal'
import {ChangeListenerOptions} from './Types'
import {ChangeListener} from './Types'
import {Reference} from './Types'
import {Dependency} from './Types'
import {ComputedPropertyOptions} from './Types'
import {ImmutableListener} from './Types'
import {RMNODE_ID} from './RMNode'

// The main function used to enable a value for RModel use
const rmodelFunc = function<T> (value:T):T {
  return RMGlobal.toRModel(value)
}

// The API methods are attached to the main function
const rmodelApi = {
  id: RMNODE_ID,
  isRoot: function (value:any):boolean {
    return RMGlobal.isRoot(value)
  },
  root: function (value:any):object | null {
    return RMGlobal.getRoot(value)
  },
  parent: function (value:any):object | null {
    return RMGlobal.getParent(value)
  },
  property: function (value:any):string | null {
    return RMGlobal.getProperty(value)
  },
  primaryReference: function (value:any):Reference | null {
    return RMGlobal.getPrimaryReference(value)
  },
  secondaryReferences: function (value:any):Array<Reference> {
    return RMGlobal.getSecondaryReferences(value)
  },
  hasRModel: function (value:any):boolean {
    return RMGlobal.hasRModel(value)
  },
  managedValue: function (value:any):any {
    return RMGlobal.getManagedValue(value)
  },
  addChangeListener: function (value:any | null, listener:ChangeListener, options:ChangeListenerOptions | null = null) {
    return RMGlobal.addChangeListener(value, listener, options)
  },
  removeChangeListener: function (value:any | null, listener:ChangeListener, options:ChangeListenerOptions | null = null) {
    return RMGlobal.removeChangeListener(value, listener, options)
  },
  findDependencies: function (func:()=>void):Array<Dependency> {
    return RMGlobal.findDependencies(func)
  },
  bufferCall: function (key:any, f:()=>void) {
    RMGlobal.bufferCall(key, f)
  },
  flushBufferedCalls: function () {
    RMGlobal.flushBufferedCalls()
  },
  addComputedProperty: function<T,R>(value:T, property:string, f:(obj:T)=>R, options:ComputedPropertyOptions | null = null) {
    RMGlobal.addComputedProperty(value, property, f, options)
  },
  removeComputedProperty: function(value:any, property:string) {
    RMGlobal.removeComputedProperty(value, property)
  },
  setId: function(value:any, id:string) {
    RMGlobal.setId(value, id)
  },
  getId: function(value:any):string | null {
    return RMGlobal.getId(value)
  },
  deleteId: function(value:any) {
    return RMGlobal.deleteId(value)
  },
  findById: function(value:any, id:string):object | null {
    return RMGlobal.findById(value, id)
  },
  followImmutable: function (value:any, listener:ImmutableListener):object {
    return RMGlobal.followImmutable(value, listener)
  },
  computed: function<T,R> (f:(obj:T)=>R, options:ComputedPropertyOptions | null = null):object {
    return RMGlobal.computed(f, options)
  },
  idref: function (id: string):object {
    return RMGlobal.idref(id)
  },
}

// Combine the main function with the API
const rmodel = Object.assign(rmodelFunc, rmodelApi)

export default rmodel
