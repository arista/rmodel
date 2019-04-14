const RModel = require('../dist/rmodel.js')

// Tests the setImmutable feature

describe('RModel immutable', ()=>{
  describe('with an initial structure', ()=>{
    let t
    let r
    beforeEach(()=>{
      t = {
        root: {
          products: [
            { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
            { id: 1036, name: 'knife', price: { amount: 1499, currency: 'usd' } },
            { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
          ]
        }
      }
      r = RModel(t)
    })
    describe('set up with an immutable root', ()=>{
      let events
      let i
      beforeEach(()=>{
        events = []
        i = RModel.setImmutable(r.root, e=>{events.push(e)})
      })
      it('should match the invariants', ()=>{
        const expected = {
          products: [
            { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
            { id: 1036, name: 'knife', price: { amount: 1499, currency: 'usd' } },
            { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
          ]
        }
        Helper.compare(r.root, t.root, i, expected)
      })
      describe('setting a simple property deep down', ()=>{
        it('should change the immutable values', ()=>{
          const f = ()=> {
            r.root.products[1].price.amount = 1699
          }
          const expected = {
            products: [
              { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
              { id: 1036, name: 'knife', price: { amount: 1699, currency: 'usd' } },
              { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
            ]
          }
          Helper.testChange(r.root, t.root, i, events, f, expected)
        })
      })
      describe('setting an object property', ()=>{
        it('should change the immutable values', ()=>{
          const f = ()=> {
            r.root.products[1].price = { amount: 1400, currency: 'eur' }
          }
          const expected = {
            products: [
              { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
              { id: 1036, name: 'knife', price: { amount: 1400, currency: 'eur' } },
              { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
            ]
          }
          Helper.testChange(r.root, t.root, i, events, f, expected)
        })
      })
      describe('setting an object property then setting another property', ()=>{
        it('should change the immutable values', ()=>{
          const f = ()=> {
            r.root.products[1].price = { amount: 1400, currency: 'eur' }
            r.root.products[1].price.amount = 1500
          }
          const expected = {
            products: [
              { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
              { id: 1036, name: 'knife', price: { amount: 1500, currency: 'eur' } },
              { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
            ]
          }
          Helper.testChange(r.root, t.root, i, events, f, expected)
        })
      })
      describe('deleting a property', ()=>{
        it('should change the immutable values', ()=>{
          const f = ()=> {
            delete r.root.products[1].price
          }
          const expected = {
            products: [
              { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
              { id: 1036, name: 'knife' },
              { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
            ]
          }
          Helper.testChange(r.root, t.root, i, events, f, expected)
        })
      })
      describe('deleting an array element', ()=>{
        it('should change the immutable values', ()=>{
          const f = ()=> {
            delete r.root.products[1]
          }
          const expected = {
            products: [
              { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
              'delete me',
              { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
            ]
          }
          // have to do this, since deleting is not quite the same as
          // just setting an element to undefined (it also removes the
          // property name '1')
          delete expected.products[1]
          Helper.testChange(r.root, t.root, i, events, f, expected)
        })
      })
      describe('array mutator methods', ()=>{
        describe('push', ()=>{
          it('should change the immutable values', ()=>{
            const f = ()=> {
              r.root.products.push('a', { id: 1038, name: "fork", price: { amount: 50, currency: 'usd'}})
            }
            const expected = {
              products: [
                { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
                { id: 1036, name: 'knife', price: { amount: 1499, currency: 'usd' } },
                { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } },
                'a',
                { id: 1038, name: "fork", price: { amount: 50, currency: 'usd'} }
              ]
            }
            Helper.testChange(r.root, t.root, i, events, f, expected)
          })
        })
        describe('unshift', ()=>{
          it('should change the immutable values', ()=>{
            const f = ()=> {
              r.root.products.unshift('a', { id: 1038, name: "fork", price: { amount: 50, currency: 'usd'}})
            }
            const expected = {
              products: [
                'a',
                { id: 1038, name: "fork", price: { amount: 50, currency: 'usd'} },
                { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
                { id: 1036, name: 'knife', price: { amount: 1499, currency: 'usd' } },
                { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
              ]
            }
            Helper.testChange(r.root, t.root, i, events, f, expected)
          })
        })
        describe('pop', ()=>{
          it('should change the immutable values', ()=>{
            const f = ()=> {
              r.root.products.pop()
            }
            const expected = {
              products: [
                { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
                { id: 1036, name: 'knife', price: { amount: 1499, currency: 'usd' } },
              ]
            }
            Helper.testChange(r.root, t.root, i, events, f, expected)
          })
        })
        describe('shift', ()=>{
          it('should change the immutable values', ()=>{
            const f = ()=> {
              r.root.products.shift()
            }
            const expected = {
              products: [
                { id: 1036, name: 'knife', price: { amount: 1499, currency: 'usd' } },
                { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
              ]
            }
            Helper.testChange(r.root, t.root, i, events, f, expected)
          })
        })
        describe('splice', ()=>{
          it('should change the immutable values', ()=>{
            const f = ()=> {
              r.root.products.splice(1, 1, 'a', { id: 1038, name: "fork", price: { amount: 50, currency: 'usd'}})
            }
            const expected = {
              products: [
                { id: 1035, name: 'spatula', price: { amount: 299, currency: 'usd' } },
                'a',
                { id: 1038, name: "fork", price: { amount: 50, currency: 'usd'} },
                { id: 1037, name: 'whisk', price: { amount: 799, currency: 'usd' } }
              ]
            }
            Helper.testChange(r.root, t.root, i, events, f, expected)
          })
        })
      })
    })
  })

  describe('An example with secondary references and object lookups', ()=>{
    let r = null
    let i = null
    let events = []
    beforeEach(()=>{
      r = RModel({
        objectById: {},
        lines: [
          { id: 'aa' },
          { id: 'bb' },
          { id: 'cc' },
        ]
      })
      i = RModel.setImmutable(r, e=>events.push(e))

      RModel.setId(r.objectById, 'objectById')
      const nameFunc = o => {
        const obj = RModel.findById(o, 'objectById')[o.id]
        return obj ? obj.name : null
      }
      for(const line of r.lines) {
        RModel.addComputedProperty(line, 'name', nameFunc)
      }
    })
    describe('adding an object by id', ()=>{
      let obj = null
      beforeEach(()=>{
        obj = RModel({
          id: 'bb',
          name: 'bbate'
        })
        r.objectById[obj.id] = obj
        RModel.flushBufferedCalls()
      })
      it('should trigger the computed values, and make immutable changes', ()=>{
        expect(r.lines[1].name).toEqual('bbate')
        expect(events.length).toEqual(1)
        const oldVal = events[0].oldValue
        const newVal = events[0].newValue

        // FIXME - it's actually producing two events - one for the
        // initial assignment of the object, and one for the computed
        // property
      })
    })
  });
})


//--------------------------------------------------

// Many of the above tests have the same form - apply a function to
// modify an RModel, see if the resulting value matches the expected
// result, and check that several invariants remain true:
//
// * A single immutable event is fired with the expected old and new roots of the immutable tree
// * The RModel, the underlying value, and the immutable value all appear equal, but are not the same objects, but do point back to the same RModel
// * All of the objects that were in the original immutable model are still there

class Helper {
  static testChange(rmodel, target, immutable, events, f, expected) {
    const iBefore = Helper.toExplodedObject(immutable)
    f()
    expect(events.length).toBe(0)
    RModel.flushBufferedCalls()
    expect(events.length).toBe(1)
    expect(events[0].oldValue).toBe(immutable)
    const newImmutable = events[0].newValue
    Helper.compare(rmodel, target, newImmutable, expected)
    const iAfter = Helper.toExplodedObject(immutable)
    Helper.compareExplodedObjects(iBefore, iAfter)
    return newImmutable
  }
  
  // Compares all the values to see that they're equal, then dives
  // deeper to make sure other invariants are checked
  static compare(rmodel, target, immutable, expected) {
    expect(rmodel).toEqual(expected)
    expect(target).toEqual(expected)
    expect(immutable).toEqual(expected)

    this.compareModels(rmodel, target, immutable, expected)
  }
  
  // Cehecks the invariants on the given rmodel, its target, and its
  // immutable version - making sure that they have the same values,
  // but not the same objects, and that the target and immutable all
  // have RModels that point to the appropriate rmodel value.  Also
  // checks that they match the expected value
  static compareModels(rmodel, target, immutable, expected) {
    // Make sure none are the same object
    expect(rmodel).not.toBe(target)
    expect(rmodel).not.toBe(immutable)
    expect(target).not.toBe(immutable)

    // Make sure the RModel for each is the same
    expect(RModel(rmodel)).toBe(rmodel)
    expect(RModel(target)).toBe(rmodel)
    expect(RModel(immutable)).toBe(rmodel)
    
    // Get the property names of each
    const rmodelPropertyNames = this.getPropertyNames(rmodel)
    const targetPropertyNames = this.getPropertyNames(target)
    const immutablePropertyNames = this.getPropertyNames(immutable)
    const expectedPropertyNames = this.getPropertyNames(expected)

    // Make sure they have the same list of properties
    expect(rmodelPropertyNames).toEqual(targetPropertyNames)
    expect(targetPropertyNames).toEqual(immutablePropertyNames)
    expect(immutablePropertyNames).toEqual(expectedPropertyNames)

    // Get the property values of each
    const rmodelPropertyValues = this.getPropertyValues(rmodel, rmodelPropertyNames)
    const targetPropertyValues = this.getPropertyValues(target, targetPropertyNames)
    const immutablePropertyValues = this.getPropertyValues(immutable, immutablePropertyNames)
    const expectedPropertyValues = this.getPropertyValues(expected, expectedPropertyNames)

    // Examine each property
    for(let i = 0; i < rmodelPropertyValues.length; i++) {
      const rmodelPropertyValue = rmodelPropertyValues[i]
      const targetPropertyValue = targetPropertyValues[i]
      const immutablePropertyValue = immutablePropertyValues[i]
      const expectedPropertyValue = expectedPropertyValues[i]
      this.compareValues(rmodelPropertyValue, targetPropertyValue, immutablePropertyValue, expectedPropertyValue)
    }
  }

  static compareValues(rmodelValue, targetValue, immutableValue, expectedValue) {
    const rmodelValueType = typeof(rmodelValue)
    const targetValueType = typeof(targetValue)
    const immutableValueType = typeof(immutableValue)
    const expectedValueType = typeof(expectedValue)

    // Make sure they have the same types
    expect(rmodelValueType).toBe(targetValueType)
    expect(targetValueType).toBe(immutableValueType)
    expect(immutableValueType).toBe(expectedValueType)

    // If they're type object, then check recursively
    if(rmodelValue instanceof Object) {
      this.compareModels(rmodelValue, targetValue, immutableValue, expectedValue)
    }
    // Otherwise make sure they're the same value
    else {
      expect(rmodelValue).toBe(targetValue)
      expect(targetValue).toBe(immutableValue)
      expect(immutableValue).toBe(expectedValue)
    }
  }

  static getPropertyNames(obj) {
    const ret = []
    for(const p in obj) {
      ret.push(p)
    }
    ret.sort()
    return ret
  }

  static getPropertyValues(obj, propertyNames) {
    const ret = []
    for(const p of propertyNames) {
      ret.push(obj[p])
    }
    return ret
  }

  // Returns a flattened array of all the property names, values and
  // objects reachable by the given object.  This is used to make sure
  // that the original objects from an immutable value's tree are
  // still the same objects and values - i.e., it has not mutated.
  static toExplodedObject(obj) {
    const ret = []
    this.addToExplodedObject(obj, ret)
    return ret
  }

  static addToExplodedObject(obj, exploded) {
    exploded.push(obj)
    const propertyNames = this.getPropertyNames(obj)
    for(const p of propertyNames) {
      exploded.push(p)
      const val = obj[p]
      if(val instanceof Object) {
        this.addToExplodedObject(val, exploded)
      }
      else {
        exploded.push(val)
      }
    }
  }

  static compareExplodedObjects(e1, e2) {
    expect(e1.length).toEqual(e2.length)
    for(let i = 0; i < e1.length; i++) {
      const ev1 = e1[i]
      const ev2 = e2[i]
      expect(ev1).toBe(ev2)
    }
  }
}
