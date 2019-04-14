const RModel = require('../dist/rmodel.js')

// Tests the behavior of a node that has been "disconnected" because
// its object was removed from its tree

describe('An object with a disconnected node', ()=>{
  let o = null
  let r = null
  let oldTree = null
  beforeEach(()=>{
    o = {}
    r = RModel(o)
    // Add the node to a tree, then remove it
    oldTree = RModel({})
    oldTree.o = o
    delete oldTree.o
  })

  it('hasRModel should return false', ()=>{
    expect(RModel.hasRModel(o)).toBe(false)
    expect(RModel.hasRModel(r)).toBe(false)
  })
  it('managedValue should still return the value', ()=>{
    expect(RModel.managedValue(o)).toBe(o)
    expect(RModel.managedValue(r)).toBe(o)
  })

  describe('adding to a new tree', ()=>{
    describe('the object', ()=>{
      it('hasRModel should return true and managedValue should return the object', ()=>{
        const t = RModel({})
        t.o = o
        expect(RModel.hasRModel(o)).toBe(true)
        expect(RModel.hasRModel(r)).toBe(true)
        expect(RModel.hasRModel(t.o)).toBe(true)

        expect(RModel.managedValue(o)).toBe(o)
        expect(RModel.managedValue(r)).toBe(o)
        expect(RModel.managedValue(t.o)).toBe(o)
      })
    })
    describe('the object\'s old proxy', ()=>{
      it('hasRModel should return true and managedValue should return the object', ()=>{
        const t = RModel({})
        t.o = r
        expect(RModel.hasRModel(o)).toBe(true)
        expect(RModel.hasRModel(r)).toBe(true)
        expect(RModel.hasRModel(t.o)).toBe(true)

        expect(RModel.managedValue(o)).toBe(o)
        expect(RModel.managedValue(r)).toBe(o)
        expect(RModel.managedValue(t.o)).toBe(o)
      })
    })
  })
  describe('rmodel-izing a new tree containing', ()=>{
    describe('the object', ()=>{
      it('hasRModel should return true and managedValue should return the object', ()=>{
        const t = RModel({o: o})
        expect(RModel.hasRModel(o)).toBe(true)
        expect(RModel.hasRModel(r)).toBe(true)
        expect(RModel.hasRModel(t.o)).toBe(true)

        expect(RModel.managedValue(o)).toBe(o)
        expect(RModel.managedValue(r)).toBe(o)
        expect(RModel.managedValue(t.o)).toBe(o)
      })
    })
    describe('the object\'s old proxy', ()=>{
      it('hasRModel should return true and managedValue should return the object', ()=>{
        const t = RModel({o: r})
        expect(RModel.hasRModel(o)).toBe(true)
        expect(RModel.hasRModel(r)).toBe(true)
        expect(RModel.hasRModel(t.o)).toBe(true)

        expect(RModel.managedValue(o)).toBe(o)
        expect(RModel.managedValue(r)).toBe(o)
        expect(RModel.managedValue(t.o)).toBe(o)
      })
    })
  })
  describe('rmodel-izing', ()=>{
    describe('the object', ()=>{
      it('hasRModel should return true and managedValue should return the object', ()=>{
        const r2 = RModel(o)
        expect(RModel.hasRModel(o)).toBe(true)
        expect(RModel.hasRModel(r)).toBe(true)
        expect(RModel.hasRModel(r2)).toBe(true)

        expect(RModel.managedValue(o)).toBe(o)
        expect(RModel.managedValue(r)).toBe(o)
        expect(RModel.managedValue(r2)).toBe(o)
      })
    })
    describe('the object\'s old proxy', ()=>{
      it('hasRModel should return true and managedValue should return the object', ()=>{
        const r2 = RModel(r)
        expect(RModel.hasRModel(o)).toBe(true)
        expect(RModel.hasRModel(r)).toBe(true)
        expect(RModel.hasRModel(r2)).toBe(true)

        expect(RModel.managedValue(o)).toBe(o)
        expect(RModel.managedValue(r)).toBe(o)
        expect(RModel.managedValue(r2)).toBe(o)
      })
    })
  })
  describe('after getting a new proxy, calling proxied methods on the old proxy should be sent to the new node', ()=>{
    let r2 = null
    beforeEach(()=>{
      r2 = RModel(o)
    })
    it('get', ()=>{
      // FIXME - implement this - can't implement this until there's some kind of side effect to calling get (such as computed properties)
    })
    it('set', ()=>{
      const o2 = {}
      r.a = o2
      expect(RModel.hasRModel(o2)).toBe(true)
      expect(RModel.parent(o2)).toBe(r2)
      expect(RModel.property(o2)).toBe('a')
    })
    it('delete', ()=>{
      const o2 = {}
      r.a = o2
      delete r.a
      expect(RModel.hasRModel(o2)).toBe(false)
    })
  })

  // FIXME - test calling array methods on disconnected array nodes
})
