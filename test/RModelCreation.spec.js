const RModel = require('../dist/rmodel.js')

// Tests converting objects to RModels, ensuring that references and
// relationships are set up correctly

describe('RModel()', ()=>{
  describe('on primitive values', ()=>{
    it('should not change a string value', ()=>{
      const val = "abcd"
      expect(RModel(val) === val).toBe(true)
    })
    it('should not change a number value', ()=>{
      const val = 13
      expect(RModel(val) === val).toBe(true)
    })
    it('should not change a boolean value', ()=>{
      const val = true
      expect(RModel(val) === val).toBe(true)
    })
    it('should not change a symbol value', ()=>{
      const val = Symbol('testsym')
      expect(RModel(val) === val).toBe(true)
    })
    it('should not change a null value', ()=>{
      const val = null
      expect(RModel(val) === val).toBe(true)
    })
    it('should not change an undefined value', ()=>{
      const val = undefined
      expect(RModel(val) === val).toBe(true)
    })
  })
  describe('on an object with no object children', ()=>{
    it('should return a root object that is different but has the same children', ()=>{
      const o = {a: 10, b: 'abc'}
      const r = RModel(o)
      expect(r).not.toBeNull
      expect(r).not.toBe(o)
      expect(RModel.isRoot(r)).toBe(true)
      expect(RModel.root(r)).toBe(r)
      expect(r.a).toBe(10)
      expect(r.b).toBe('abc')
    })
  })
  describe('on an object already rmodel-enabled', ()=>{
    it('should just return the existing rmodel object', ()=>{
      const o = {a: 10, b: 'abc'}
      const r = RModel(o)
      const r2 = RModel(o)
      expect(r).toBe(r2)
    })
  })
  describe('on an object with object children', ()=>{
    it('should assign the child references and roots', ()=>{
      const o1o1 = {d: 30}
      const o1 = {a: 10, o1o1: o1o1}
      const o2 = {b: 'abc'}
      const o = {c: 20, o1: o1, o2: o2}
      const r = RModel(o)

      expect(RModel.root(r.o1)).toBe(r)
      expect(RModel.parent(r.o1)).toBe(r)
      expect(RModel.property(r.o1)).toBe('o1')

      expect(RModel.root(r.o2)).toBe(r)
      expect(RModel.parent(r.o2)).toBe(r)
      expect(RModel.property(r.o2)).toBe('o2')

      expect(RModel.root(r.o1.o1o1)).toBe(r)
      expect(RModel.parent(r.o1.o1o1)).toBe(r.o1)
      expect(RModel.property(r.o1.o1o1)).toBe('o1o1')
    })
  })
  describe('enabling an object referencing an already-enabled object', ()=>{
    it('should adjust the roots and references accordingly', ()=>{
      const o = {
        o1: {
          a: 10,
          o1a: {
            o1b: {
              d: 12
            }
          }
        },
        o2: {
          o2a: {
            e: 14
          }
        }
      }

      // Include some cross-references
      o.o2.second_o1b = o.o1.o1a.o1b
      o.o2.root = o
      
      const r1a = RModel(o.o1.o1a)
      // The subtree is enabled
      expect(RModel.root(r1a)).toBe(r1a)
      expect(RModel.root(r1a.o1b)).toBe(r1a)
      expect(RModel.parent(r1a)).toBe(null)
      expect(RModel.parent(r1a.o1b)).toBe(r1a)
      // Enable the whole tree
      const r = RModel(o)
      expect(r).not.toBe(r1a)
      expect(RModel.root(r1a)).toBe(r)
      expect(RModel.root(r1a.o1b)).toBe(r)
      expect(RModel.parent(r1a)).toBe(r.o1)
      expect(RModel.parent(r1a.o1b)).toBe(r1a)
      // Check the secondary reference
      expect(r.o2.second_o1b).toBe(r.o1.o1a.o1b)
      expect(RModel.secondaryReferences(r.o1.o1a.o1b)).toEqual([
        {
          referrer: r.o2,
          property: "second_o1b"
        }
      ])
      // Check the secondary reference to the root
      expect(r.o2.root).toBe(r)
      expect(RModel.secondaryReferences(r)).toEqual([
        {
          referrer: r.o2,
          property: "root"
        }
      ])
    })
  })
  describe('enabling an object referencing an already-enabled object', ()=>{
    it('should throw an exception', ()=>{
      const o1 = {
        o1a: {
          o1b: {
          }
        }
      }
      const o2 = {
        o2a: {
          o2b: {
          }
        }
      }
      r1 = RModel(o1)
      // Create the cross-reference
      o2.o2a.o2b.external_o1b = o1.o1a.o1b
      expect(()=>{RModel(o2)}).toThrow(new Error('Attempt to add child from another tree'))
    })
  })

  describe('hasRModel', ()=>{
    it('should return false for non-objects', ()=>{
      expect(RModel.hasRModel(5)).toBe(false)
    })
    it('should return false for a value that hasn\'t been remodel-ized', ()=>{
      const o = {}
      expect(RModel.hasRModel(o)).toBe(false)
    })
    it('should return true for a value that has been remodel-ized', ()=>{
      const o = {}
      const r = RModel(o)
      expect(RModel.hasRModel(o)).toBe(true)
      expect(RModel.hasRModel(r)).toBe(true)
    })
    it('should return false for a value that has been remodel-ized, then removed from its tree', ()=>{
      const o = {}
      const o2 = {a: o}
      expect(RModel.hasRModel(o)).toBe(false)
      const r2 = RModel(o2)
      const r = RModel(o)
      expect(RModel.hasRModel(o)).toBe(true)
      expect(RModel.hasRModel(r)).toBe(true)
      r2.a = 10
      expect(RModel.hasRModel(o)).toBe(false)
      expect(RModel.hasRModel(r)).toBe(false)
    })
  })

  describe('managedValue', ()=>{
    it('should return the same value for non-objects', ()=>{
      expect(RModel.managedValue(5)).toBe(5)
    })
    it('should return the same value for a value that hasn\'t been rmodel-ized', ()=>{
      const o = {}
      expect(RModel.managedValue(o)).toBe(o)
    })
    it('should return the underlying value for a value that has been rmodel-ized', ()=>{
      const o = {}
      const r = RModel(o)
      expect(RModel.managedValue(o)).toBe(o)
      expect(RModel.managedValue(r)).toBe(o)
    })
    it('should return the underlying value for a value that has been rmodel-ized, then removed from its tree', ()=>{
      const o = {}
      const o2 = {a: o}
      const r2 = RModel(o2)
      const r = RModel(o)
      r2.a = 10
      expect(RModel.managedValue(o)).toBe(o)
      expect(RModel.managedValue(r)).toBe(o)
    })
  })
  
  // FIXME - test adding either rmodel, proxy, or internal value
})
