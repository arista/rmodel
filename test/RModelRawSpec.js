const RModel = require('../dist/rmodel.js')

// Tests "raw" values

describe('rmodel raw', ()=>{
  it('wrapping with an RModel should just return the value', ()=>{
    const o = {a: 13}
    expect(RModel.raw(o)).toBe(o)
    const o2 = "abc"
    expect(RModel.raw(o2)).toBe(o2)
  })
  xit('adding it to an RModel should not wrap the value', ()=>{
    // FIXME - implement this
  })
  xit('making changes to it should not result in change events', ()=>{
    // FIXME - implement this
  })
  xit('overwriting it with a new value should not report it in the removed array', ()=>{
    // FIXME - implement this
  })
  xit('setting it on a property should not report it in the added array', ()=>{
    // FIXME - implement this
  })
  xit('deleting it as a property value not report it in the removed array', ()=>{
    // FIXME - implement this
  })
  xit('immutable values should just return a reference to the value, not an immutable copy', ()=>{
    // FIXME - implement this
  })
  xit('should not be reported in a children array', ()=>{
    // FIXME - implement this
  })
  xit('should not be reported in a descendants array', ()=>{
    // FIXME - implement this
  })
  xit('a reference from it should not be reported as a reference', ()=>{
    // FIXME - implement this
  })
  xit('hasRModel should return false', ()=>{
    // FIXME - implement this
  })
  xit('should not be reported as added or removed by splice', ()=>{
    // FIXME - implement this
  })
  xit('should throw an exception if called on a value already RModel-enabled', ()=>{
    // FIXME - implement this
  })
  xit('should throw an exception if called on a Proxy', ()=>{
    // FIXME - implement this
  })
})
