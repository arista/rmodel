const RModel = require('../dist/rmodel.js')

describe('RModel computed properties', ()=>{
  let values = null
  let rmodels = null
  let events = null
  beforeEach(()=>{
    values = {}
    values.obj1 = { w: 5, x: 10, y: 20 }
    values.objs = { obj: values.obj1 }
    rmodels = {}
    events = []
    for (key in values) {
      rmodels[key] = RModel(values[key])
    }
    RModel.addChangeListener(rmodels.objs, e=>events.push(e), { source: 'descendants' })
  })
  describe('with a simple computed property', ()=>{
    let computedCount = null
    beforeEach(()=>{
      computedCount = 0
      RModel.addComputedProperty(rmodels.obj1, 'sum', o=>{
        computedCount++
        return o.x + o.y
      })
    })
    it('should immediately compute the property', ()=>{
      expect(computedCount).toBe(1)
      expect(rmodels.obj1.sum).toBe(30)
    })
    it('should set the property on the underlying value', ()=>{
      expect(computedCount).toBe(1)
      expect(rmodels.obj1.sum).toBe(30)
    })
    it('should fire a property change event', ()=>{
      expect(events).toEqual([
        {type: 'PropertyChange', target: rmodels.obj1, property: 'sum', oldValue: undefined, newValue: 30, added: null, removed: null, hadOwnProperty: false, hasOwnProperty: true}
      ])
    })
    describe('changing values', ()=>{
      beforeEach(()=>{
        events = []
      })
      it('setting a dependent property without flushing should not call the computed property', ()=>{
        rmodels.obj1.x = 40
        expect(computedCount).toBe(1)
        expect(events).toEqual([
          {type: 'PropertyChange', target: rmodels.obj1, property: 'x', oldValue: 10, newValue: 40, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
        ])
        expect(rmodels.obj1.sum).toBe(30)
      })
      it('setting a dependent property without flushing then waiting should call the computed property', (done)=>{
        rmodels.obj1.x = 40
        setTimeout(()=>{
          expect(computedCount).toBe(2)
          expect(events).toEqual([
            {type: 'PropertyChange', target: rmodels.obj1, property: 'x', oldValue: 10, newValue: 40, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
            {type: 'PropertyChange', target: rmodels.obj1, property: 'sum', oldValue: 30, newValue: 60, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
          ])
          expect(rmodels.obj1.sum).toBe(60)
          done()
        }, 1)
      })
      it('setting a dependent property then flushing should change the computed property', ()=>{
        rmodels.obj1.x = 40
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(2)
        expect(events).toEqual([
          {type: 'PropertyChange', target: rmodels.obj1, property: 'x', oldValue: 10, newValue: 40, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
          {type: 'PropertyChange', target: rmodels.obj1, property: 'sum', oldValue: 30, newValue: 60, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
        ])
        expect(rmodels.obj1.sum).toBe(60)
      })
      it('setting an irrelevant property should not change the computed property', ()=>{
        rmodels.obj1.z = 40
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(1)
        expect(events).toEqual([
          {type: 'PropertyChange', target: rmodels.obj1, property: 'z', oldValue: undefined, newValue: 40, added: null, removed: null, hadOwnProperty: false, hasOwnProperty: true}
        ])
        expect(rmodels.obj1.sum).toBe(30)
      })
      it('setting multiple dependent properties should only fire once', ()=>{
        rmodels.obj1.x = 40
        rmodels.obj1.y = 50
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(2)
        expect(events).toEqual([
          {type: 'PropertyChange', target: rmodels.obj1, property: 'x', oldValue: 10, newValue: 40, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
          {type: 'PropertyChange', target: rmodels.obj1, property: 'y', oldValue: 20, newValue: 50, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
          {type: 'PropertyChange', target: rmodels.obj1, property: 'sum', oldValue: 30, newValue: 90, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
        ])
        expect(rmodels.obj1.sum).toBe(90)
      })
      describe('with a second computed property depending on the same values', ()=>{
        let computedCount2
        beforeEach(()=>{
          computedCount2 = 0
          RModel.addComputedProperty(rmodels.obj1, 'double', o=>{
            computedCount2++
            return o.x  * 2
          })
        })
        it('should have computed both properties', ()=>{
          expect(computedCount).toBe(1)
          expect(computedCount2).toBe(1)
          expect(rmodels.obj1.sum).toBe(30)
          expect(rmodels.obj1.double).toBe(20)
        })
        it('should change both values when a common dependent property is changed', ()=>{
          rmodels.obj1.x = 30
          RModel.flushBufferedCalls()
          expect(computedCount).toBe(2)
          expect(computedCount2).toBe(2)
          expect(rmodels.obj1.sum).toBe(50)
          expect(rmodels.obj1.double).toBe(60)
        })
        it('should change only one value when a non-common dependent property is changed', ()=>{
          rmodels.obj1.y = 30
          RModel.flushBufferedCalls()
          expect(computedCount).toBe(2)
          expect(computedCount2).toBe(1)
          expect(rmodels.obj1.sum).toBe(40)
          expect(rmodels.obj1.double).toBe(20)
        })
      })
    })
    describe('with a chain of computed properties that depend on each other', ()=>{
      let computedCount2
      beforeEach(()=>{
        computedCount2 = 0
        RModel.addComputedProperty(rmodels.obj1, 'doubleSum', o=>{
          computedCount2++
          return o.sum * 2
        })
      })
      it('should cause all the properties to change', ()=>{
        expect(computedCount).toBe(1)
        expect(computedCount2).toBe(1)
        expect(rmodels.obj1.sum).toBe(30)
        expect(rmodels.obj1.doubleSum).toBe(60)

        rmodels.obj1.x = 30
        RModel.flushBufferedCalls()

        expect(computedCount).toBe(2)
        expect(computedCount2).toBe(2)
        expect(rmodels.obj1.sum).toBe(50)
        expect(rmodels.obj1.doubleSum).toBe(100)
      })
    })

    describe('replacing that property', ()=>{
      beforeEach(()=>{
        RModel.addComputedProperty(rmodels.obj1, 'sum', o=>{
          computedCount++
          return o.w + o.x
        })
      })
      it('should use the value from the second property definition', ()=>{
        expect(computedCount).toBe(2)
        expect(rmodels.obj1.sum).toBe(15)
      })
      it('should no longer call the old computed property', ()=>{
        rmodels.obj1.x = 20
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(3)
        expect(rmodels.obj1.sum).toBe(25)
      })
    })
  })

  describe('dependencies that change on computing', ()=>{
    describe('changing to a completely different set of dependencies', ()=>{
      it('should respond to the dependencies appropriately', ()=>{
        let computedCount = 0
        const obj = RModel({})
        obj.a1 = 10
        obj.a2 = 20
        obj.a3 = 30
        obj.b1 = 30
        obj.b2 = 40
        RModel.addComputedProperty(obj, "sum", (o)=>{
          computedCount++
          switch(computedCount) {
          case 1:
            return o.a1 + o.a2
          case 2:
            return o.a1 + o.a2 + o.a3
          default:
            return o.b1 + o.b2
          }
        })

        expect(computedCount).toBe(1)
        expect(obj.sum).toBe(30)

        // a3 should have no effect
        obj.a3 = 40
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(1)
        expect(obj.sum).toBe(30)

        obj.a1 = 15
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(2)
        expect(obj.sum).toBe(75)

        // now a3 should have an effect
        obj.a3 = 50
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(3)
        expect(obj.sum).toBe(70)

        // now a1, a2, and a3 should have no effect
        obj.a1 = 1
        obj.a2 = 2
        obj.a3 = 3
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(3)
        expect(obj.sum).toBe(70)

        // b1 and b2 should, though
        obj.b1 = 1
        obj.b2 = 2
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(4)
        expect(obj.sum).toBe(3)

        obj.b1 = 3
        obj.b2 = 4
        RModel.flushBufferedCalls()
        expect(computedCount).toBe(5)
        expect(obj.sum).toBe(7)
      })
    })
  })

  describe('a property with immediate option set', ()=>{
    let computedCount = null
    beforeEach(()=>{
      computedCount = 0
      RModel.addComputedProperty(rmodels.obj1, 'difference', o=>{
        computedCount++
        return o.x - o.y
      }, {immediate: true})
      events = []
    })
    it('should recompute properties immediately', ()=>{
      expect(computedCount).toBe(1)
      expect(rmodels.obj1.difference).toBe(-10)
      rmodels.obj1.x = 40
      expect(computedCount).toBe(2)
      expect(events).toEqual([
        {type: 'PropertyChange', target: rmodels.obj1, property: 'difference', oldValue: -10, newValue: 20, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
        {type: 'PropertyChange', target: rmodels.obj1, property: 'x', oldValue: 10, newValue: 40, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
      ])
      expect(rmodels.obj1.difference).toBe(20)
    })
    it('should recompute properties each time a dependent is changed', ()=>{
      expect(computedCount).toBe(1)
      expect(rmodels.obj1.difference).toBe(-10)
      rmodels.obj1.x = 40
      rmodels.obj1.y = 60
      expect(computedCount).toBe(3)
      expect(events).toEqual([
        {type: 'PropertyChange', target: rmodels.obj1, property: 'difference', oldValue: -10, newValue: 20, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
        {type: 'PropertyChange', target: rmodels.obj1, property: 'x', oldValue: 10, newValue: 40, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
        {type: 'PropertyChange', target: rmodels.obj1, property: 'difference', oldValue: 20, newValue: -20, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
        {type: 'PropertyChange', target: rmodels.obj1, property: 'y', oldValue: 20, newValue: 60, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
      ])
      expect(rmodels.obj1.difference).toBe(-20)
    })
  })

  describe('a property dependent on an array', ()=>{
    let computedCount = null
    beforeEach(()=>{
      rmodels.obj1.arr1 = [10, 20, 30]
      RModel.addComputedProperty(rmodels.obj1, 'double1', o=>{
        computedCount++
        return rmodels.obj1.arr1[1] * 2
      })
      events = []
      computedCount = 0
    })

    it('should have the expected starting value', ()=>{
      expect(rmodels.obj1.double1).toBe(40)
    })

    it('should fire on change to the array element', ()=>{
      rmodels.obj1.arr1[1] = 30
      RModel.flushBufferedCalls()
      
      expect(events).toEqual([
        {type: 'PropertyChange', target: rmodels.obj1.arr1, property: '1', oldValue: 20, newValue: 30, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
        {type: 'PropertyChange', target: rmodels.obj1, property: 'double1', oldValue: 40, newValue: 60, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
      ])
      expect(computedCount).toBe(1)
      expect(rmodels.obj1.double1).toBe(60)
    })

    it('should fire on change to the array structure', ()=>{
      rmodels.obj1.arr1.unshift(5)
      RModel.flushBufferedCalls()
      
      expect(events).toEqual([
        {type: 'ArrayChange', target: rmodels.obj1.arr1, index: 0, deleteCount: 0, insertCount: 1, deleted: null, inserted: [5], oldLength: 3, newLength: 4, added: null, removed: null},
        {type: 'PropertyChange', target: rmodels.obj1, property: 'double1', oldValue: 40, newValue: 20, added: null, removed: null, hadOwnProperty: true, hasOwnProperty: true},
      ])
      expect(computedCount).toBe(1)
      expect(rmodels.obj1.double1).toBe(20)
    })

    // FIXME - this optimization isn't implemented yet
    /*
    it('should fire on change to the array structure that does not affect the property', ()=>{
      rmodels.obj1.arr1.push(40)
      RModel.flushBufferedCalls()
      
      expect(events).toEqual([
        {type: 'ArrayChange', target: rmodels.obj1.arr1, index: 0, deleteCount: 0, insertCount: 1, deleted: null, inserted: [5], oldLength: 3, newLength: 4, added: null, removed: null},
      ])
      expect(computedCount).toBe(0)
      expect(rmodels.obj1.double1).toBe(40)
    })
    */
  })

  describe('computed properties that depend on RModel function results', ()=>{
    describe('RModel.root()', ()=>{
      it('should recompute when the root changes', ()=>{
        // Set up the computed property
        let v = null
        const r1 = RModel({v: 'abc', a: {}})
        const f = o=>{
          v = RModel.root(o).v
          return v
        }
        RModel.addComputedProperty(r1.a, 'vv', f)
        expect(r1.a.vv).toEqual('abc')
        expect(v).toEqual('abc')

        // Change the root
        const r2 = RModel({v: 'def'})
        r2.r1 = r1
        RModel.flushBufferedCalls()
        expect(r1.a.vv).toEqual('def')
        expect(v).toEqual('def')
      })
    })
    describe('RModel.parent()', ()=>{
      it('should recompute when the root changes', ()=>{
        // Set up the computed property
        let v = null
        const r1 = RModel({v: 'abc', a: {}, b: {v: 'def'}})
        const r1a = r1.a
        const f = o=>{
          v = RModel.parent(o).v
          return v
        }
        RModel.addComputedProperty(r1a, 'vv', f)
        expect(r1a.vv).toEqual('abc')
        expect(v).toEqual('abc')

        // Change the parent
        r1.b.a = r1a
        delete r1.a
        RModel.flushBufferedCalls()
        expect(r1a.vv).toEqual('def')
        expect(v).toEqual('def')
      })
    })
    describe('RModel.property()', ()=>{
      it('should recompute when the property changes', ()=>{
        // Set up the computed property
        let v = null
        const r1 = RModel({v: 'abc', a: {}})
        const r1a = r1.a
        const f = o=>{
          v = RModel.property(o)
          return v
        }
        RModel.addComputedProperty(r1a, 'vv', f)
        expect(r1a.vv).toEqual('a')
        expect(v).toEqual('a')

        // Change the parent
        r1.b = r1a
        delete r1.a
        RModel.flushBufferedCalls()
        expect(r1a.vv).toEqual('b')
        expect(v).toEqual('b')
      })
    })
    describe('RModel.getId()', ()=>{
      it('should recompute when the id changes', ()=>{
        // Set up the computed property
        let v = null
        const r1 = RModel({v: 'abc', a: {}})
        const r1a = r1.a
        RModel.setId(r1a, 'id1')
        const f = o=>{
          v = RModel.getId(o)
          return v
        }
        RModel.addComputedProperty(r1a, 'vv', f)
        expect(r1a.vv).toEqual('id1')
        expect(v).toEqual('id1')

        // Change the parent
        RModel.setId(r1a, 'id2')
        RModel.flushBufferedCalls()
        expect(r1a.vv).toEqual('id2')
        expect(v).toEqual('id2')
      })
    })
    describe('RModel.findById()', ()=>{
      let r = null
      beforeEach(()=>{
        r = RModel({a: {v: 'abc'}, b: {v: 'def'}})
        RModel.setId(r.a, 'a')
        RModel.setId(r.b, 'b')
      })
      describe('with an object in the tree referencing an existing id', ()=>{
        let val = null
        let r2 = null
        beforeEach(()=>{
          r2 = RModel({})
          r.r2 = r2
          const f = o=>{
            const obj = RModel.findById(o, 'a')
            val = obj ? obj.v : null
            return val
          }
          RModel.addComputedProperty(r2, 'vv', f)
        })
        it('should have the expected value', ()=>{
          expect(val).toEqual('abc')
          expect(r2.vv).toEqual('abc')
        })
        it('deleting the object with that id should change the computed property', ()=>{
          delete r.a
          RModel.flushBufferedCalls()
          expect(val).toEqual(null)
          expect(r2.vv).toEqual(null)
        })
        it('changing the object\'s id should change the computed property', ()=>{
          RModel.setId(r.a, 'a2')
          RModel.flushBufferedCalls()
          expect(val).toEqual(null)
          expect(r2.vv).toEqual(null)
        })
        it('setting an existing object to that id should change the computed property', ()=>{
          RModel.setId(r.a, 'a2')
          RModel.setId(r.b, 'a')
          RModel.flushBufferedCalls()
          expect(val).toEqual('def')
          expect(r2.vv).toEqual('def')
        })
        it('replacing the object with that id should change the computed property', ()=>{
          RModel.setId(r.a, 'a2')
          r.aa = {v: 'ghi'}
          RModel.setId(r.aa, 'a')
          RModel.flushBufferedCalls()
          expect(val).toEqual('ghi')
          expect(r2.vv).toEqual('ghi')
        })
      })
      describe('with an object in the tree referencing a non-existing id', ()=>{
        let val = null
        let r2 = null
        beforeEach(()=>{
          r2 = {}
          r.r2 = r2
          const f = o=>{
            const obj = RModel.findById(o, 'c')
            val = obj ? obj.v : null
            return val
          }
          RModel.addComputedProperty(r2, 'vv', f)
        })
        it('should have the expected value', ()=>{
          expect(val).toEqual(null)
          expect(r2.vv).toEqual(null)
        })
        it('adding an object with that id should change the computed property', ()=>{
          rc = RModel({v: 'ghi'})
          RModel.setId(rc, 'c')
          r.c = rc
          RModel.flushBufferedCalls()
          expect(val).toEqual('ghi')
          expect(r2.vv).toEqual('ghi')
        })
      })
      describe('with an object not yet in the tree referencing an existing id', ()=>{
        let val = null
        let r2 = null
        beforeEach(()=>{
          r2 = RModel({})
          const f = o=>{
            const obj = RModel.findById(o, 'a')
            val = obj ? obj.v : null
            return val
          }
          RModel.addComputedProperty(r2, 'vv', f)
        })
        it('should have the expected value', ()=>{
          expect(val).toEqual(null)
          expect(r2.vv).toEqual(null)
        })
        it('adding the object should change the computed property', ()=>{
          r.c = r2
          RModel.flushBufferedCalls()
          expect(val).toEqual('abc')
          expect(r2.vv).toEqual('abc')
        })
      })
      describe('with an object not yet in the tree referencing a non-existing id', ()=>{
        let val = null
        let r2 = null
        beforeEach(()=>{
          r2 = RModel({})
          const f = o=>{
            const obj = RModel.findById(o, 'd')
            val = obj ? obj.v : null
            return val
          }
          RModel.addComputedProperty(r2, 'vv', f)
        })
        it('should have the expected value', ()=>{
          expect(val).toEqual(null)
          expect(r2.vv).toEqual(null)
        })
        it('adding the object should not change the computed property', ()=>{
          r.c = r2
          RModel.flushBufferedCalls()
          expect(val).toEqual(null)
          expect(r2.vv).toEqual(null)
        })
        it('adding the object then adding an object with that id should change the computed property', ()=>{
          r.c = r2
          r3 = RModel({v: 'ghi'})
          RModel.setId(r3, 'd')
          r.d = r3
          RModel.flushBufferedCalls()
          expect(val).toEqual('ghi')
          expect(r2.vv).toEqual('ghi')
        })
      })
    })
  })

  describe('RModel.computed', ()=>{
    it('setting should be equivalent to adding computed property', ()=>{
      rmodels.obj1.sum = RModel.computed(v=>v.w + v.x + v.y)
      expect(rmodels.obj1.sum).toBe(35)
      rmodels.obj1.x = 20
      expect(rmodels.obj1.sum).toBe(35)
      RModel.flushBufferedCalls()
      expect(rmodels.obj1.sum).toBe(45)
    })
    it('assigning as part of object initializer should be equivalent to adding computed property', ()=>{
      const r = RModel({
        x: 10,
        y: 20,
        sum: RModel.computed(v=>v.x + v.y)
      })
      expect(r.sum).toBe(30)
      r.x = 5
      expect(r.sum).toBe(30)
      RModel.flushBufferedCalls()
      expect(r.sum).toBe(25)
    })
    it('should respect the immediate option', ()=>{
      const r = RModel({
        x: 10,
        y: 20,
        sum: RModel.computed(v=>v.x + v.y, {immediate: true})
      })
      expect(r.sum).toBe(30)
      r.x = 5
      expect(r.sum).toBe(25)
      RModel.flushBufferedCalls()
      expect(r.sum).toBe(25)
    })
  })
  
  // removing an object should remove its computed properties and listeners

  // FIXME - test that a removed object is disconnected
})
