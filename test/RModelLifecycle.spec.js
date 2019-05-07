const RModel = require('../dist/rmodel.js')

// Tests the followImmutable feature

describe('RModel lifecycle calls', ()=>{
  let addedCalled = null
  let removedCalled = null
  let o = null
  beforeEach(()=>{
    addedCalled = false
    removedCalled = false
    o = {
      [RModel.added]: ()=>{addedCalled = true},
      [RModel.removed]: ()=>{removedCalled = true},
    }
  })
  describe('adding an object with a lifecycle call', ()=>{
    it('should not be called if the object is just RModel-enabled itself', ()=>{
      const r = RModel(o)
      expect(addedCalled).toBe(false)
    })
    it('should be called if the object is added as a property', ()=>{
      const r = RModel({})
      expect(addedCalled).toBe(false)
      r.a = o
      expect(addedCalled).toBe(true)
    })
    it('should be called if the object is added to an array', ()=>{
      const r = RModel([])
      expect(addedCalled).toBe(false)
      r.push(o)
      expect(addedCalled).toBe(true)
    })
    it('should be called if the object is added as a property of a property', ()=>{
      const o2 = {o2: o}
      const r = RModel({})
      expect(addedCalled).toBe(false)
      r.a = o2
      expect(addedCalled).toBe(true)
    })
  })
  describe('removing an object with a lifecycle call', ()=>{
    it('should be called if the object is replaced as a property', ()=>{
      const r = RModel({o: o})
      expect(removedCalled).toBe(false)
      r.o = 3
      expect(removedCalled).toBe(true)
    })
    it('should be called if the object is deleted as a property', ()=>{
      const r = RModel({o: o})
      expect(removedCalled).toBe(false)
      delete r.o
      expect(removedCalled).toBe(true)
    })
    describe('should be called if the object is removed from an array', ()=>{
      it('using pop', ()=>{
        const r = RModel([o])
        expect(removedCalled).toBe(false)
        r.pop()
        expect(removedCalled).toBe(true)
      })
      it('using shift', ()=>{
        const r = RModel([o])
        expect(removedCalled).toBe(false)
        r.shift()
        expect(removedCalled).toBe(true)
      })
      it('using splice', ()=>{
        const r = RModel([o])
        expect(removedCalled).toBe(false)
        r.splice(0, 1)
        expect(removedCalled).toBe(true)
      })
    })
    it('should be called if the object is nested under another object that is removed', ()=>{
      const r = RModel({x: {y: [o]}})
      expect(removedCalled).toBe(false)
      r.x = "a"
      expect(removedCalled).toBe(true)
    })
  })
})
