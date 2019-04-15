// Intermediate representation of a computed property definition
// created by calling RModel.computed.  If an instance of this is
// assigned to an object property, that will be equivalent to calling
// addComputedProperty with the values specified here.
//
// This facility is provided as a convenience, allowing a kind of
// "shorthand" for defining RModel values:
//
// const r = RModel({
//   x: 10,
//   y: 20,
//   sum: RModel.computed(v=>v.x + v.y)
// })
import {ComputedPropertyOptions} from './Types'

export default class RMComputed<T,R> {
  f: (obj:T)=>R
  options: ComputedPropertyOptions | null

  constructor(f: (obj:T)=>R, options: ComputedPropertyOptions | null) {
    this.f = f
    this.options = options
  }
}
