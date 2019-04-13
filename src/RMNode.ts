// FIXME - implement this
import RMReference from "./RMReference"
import RMDependencyTrackers from './RMDependencyTrackers'
import RMComputedProperty from './RMComputedProperty'
import RMRootChangeListener from './RMRootChangeListener'
import RMParentChangeListener from './RMParentChangeListener'
import RMPropertyNameChangeListener from './RMPropertyNameChangeListener'
import RMIdChangeListener from './RMIdChangeListener'
import RMFindByIdChangeListener from './RMFindByIdChangeListener'
import {ChangeListenerOptions} from './Types'
import {ChangeListener} from './Types'
import {Dependency} from './Types'
import {ComputedPropertyOptions} from './Types'
import {ImmutableListener} from './Types'
import {RootChangeListener} from './InternalTypes'
import {ParentChangeListener} from './InternalTypes'
import {PropertyNameChangeListener} from './InternalTypes'
import {IdChangeListener} from './InternalTypes'
import {FindByIdChangeListener} from './InternalTypes'

export default class RMNode {
  target: object = this
  primaryReference: RMReference | null = null
  secondaryReferences: Array<RMReference> | null = null
  proxy: object = this
  immutableValue: object | null = null
  
  proxyArrayPop(func: any, args:Array<any>):any {
    return null
  }
  proxyArrayPush(func: any, args:Array<any>):any {
    return null
  }
  proxyArrayShift(func: any, args:Array<any>):any {
    return null
  }
  proxyArraySplice(func: any, args:Array<any>):any {
    return null
  }
  proxyArrayUnshift(func: any, args:Array<any>):any {
    return null
  }
  get parent(): RMNode | null {
    return null
  }
  get root(): RMNode {
    return this
  }
  hasFindByIdChangeListener(listener: FindByIdChangeListener, id: string): boolean {
    return false
  }
  addFindByIdChangeListener(listener: FindByIdChangeListener, id: string) {
  }
  removeFindByIdChangeListener(listener: FindByIdChangeListener, id: string) {
  }
  hasIdChangeListener(listener: IdChangeListener): boolean {
    return false
  }
  addIdChangeListener(listener: IdChangeListener) {
  }
  removeIdChangeListener(listener: IdChangeListener) {
  }
  hasParentChangeListener(listener: ParentChangeListener): boolean {
    return false
  }
  addParentChangeListener(listener: ParentChangeListener) {
  }
  removeParentChangeListener(listener: ParentChangeListener) {
  }
  hasChangeListener(listener: ChangeListener, options: ChangeListenerOptions | null = null): boolean {
    return false
  }
  addChangeListener(listener: ChangeListener, options: ChangeListenerOptions | null = null) {
  }
  removeChangeListener(listener: ChangeListener, options: ChangeListenerOptions | null= null) {
  }
  hasPropertyNameChangeListener(listener: PropertyNameChangeListener): boolean {
    return false
  }
  addPropertyNameChangeListener(listener: PropertyNameChangeListener) {
  }
  removePropertyNameChangeListener(listener: PropertyNameChangeListener) {
  }
  hasRootChangeListener(listener: RootChangeListener): boolean {
    return false
  }
  addRootChangeListener(listener: RootChangeListener) {
  }
  removeRootChangeListener(listener: RootChangeListener) {
  }
  static valueToRModel(value: any): any {
    return value
  }
  isRoot(): boolean {
    return false
  }
  get property(): string | null {
    return null
  }
  static hasRModel(value: any): boolean {
    return false
  }
  static getManagedValue(value: any): any {
    return value
  }
  static toExternalValue(value: any): any {
    return value
  }
  addComputedProperty<T,R>(property: string, f: (obj:T)=>R, options: ComputedPropertyOptions | null) {
  }
  removeComputedProperty(property: string) {
  }
  setId(id: string) {
  }
  getId(): string | null {
    return null
  }
  deleteId() {
  }
  findById(id: string): object | null {
    return null
  }
  setImmutable(listener: ImmutableListener): object {
    return this
  }
  static getNodeForValue(value: any): RMNode | null {
    return null
  }
  static getConnectedOrDisconnectedNodeForObject(obj: object): RMNode | null {
    return null
  }
  flushImmutableChanges() {
  }
  proxyGet(property: (string|Symbol)): any | null {
    return null
  }
  proxySet(property: (string|Symbol), value: any | null): boolean {
    return false
  }
  proxyDelete(property: (string|Symbol)): boolean {
    return false
  }
}
