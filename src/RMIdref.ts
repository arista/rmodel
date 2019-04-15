// Intermediate representation of a computed property definition
// created by calling RModel.idref.  If an instance of this is
// assigned to an object property, that will be equivalent to calling
// addComputedProperty with a call to findById with the given id.
//
// This facility is provided as a convenience, allowing a kind of
// "shorthand" for defining RModel values:
//
// const r = RModel({
//   x: 10,
//   y: 20,
//   db: RModel.idref('db')
// })
//
// This is equivalent to calling RModel.addComputedProperty(r, 'db',
// v=>RModel.findById('db'))
export default class RMIdref {
  id: string

  constructor(id: string) {
    this.id = id
  }
}
