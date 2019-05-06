const RModel = require('../dist/rmodel.js')

// Tests creating RModels around class instances

class TestClass {
  constructor() {
    this.sampleData = "abc"
    this.manager = new TestClass2()
  }
  add() {
    this.sampleData += "!"
  }
}

class TestClass2 {
  constructor() {
    this.sampleData = "abc"
    this.boards = null
  }
}

describe('rmodel with a class', ()=>{
  it('should create the class and set the sample data correctly', ()=>{
    const o = new TestClass()
    const r = RModel(o)
    expect(r.sampleData).toEqual("abc")
    r.add()
    expect(r.sampleData).toEqual("abc!")
    r.add()
    expect(r.sampleData).toEqual("abc!!")
  })
  it('should still work correctly when going through immutable values', ()=>{
    const o = new TestClass()
    const r = RModel(o)
    let i = RModel.followImmutable(r, e=>{
      i = e.newValue
    })
    expect(i.sampleData).toEqual("abc")
    RModel(i).add()
    RModel.flushBufferedCalls()
    expect(i.sampleData).toEqual("abc!")
    RModel(i).add()
    RModel.flushBufferedCalls()
    expect(i.sampleData).toEqual("abc!!")
  })
})
