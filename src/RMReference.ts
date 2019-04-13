// A reference from one object to another in the same tree,
// represented as a referrer, and the property on the referrer.

import RMNode from './RMNode'

export default class RMReference {
  referrer: RMNode
  property: string

  constructor(referrer: RMNode, property: string) {
    this.referrer = referrer
    this.property = property
  }

  // Returns true if the given ref equals this reference
  equals(ref: RMReference | null): boolean {
    return ref != null && this.matches(ref.referrer, ref.property)
  }

  // Returns true if the given ref has the same values as this
  // reference
  matches(referrer: RMNode, property: string) {
    return this.referrer == referrer && this.property == property
  }

  // "Disconnects" this reference by setting the referrer's property
  // to null
  disconnect() {
    // to satisfy TypeScript
    const p: any = this.referrer.proxy
    p[this.property] = null
  }
}
