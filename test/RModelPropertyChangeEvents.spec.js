const RModel = require('../dist/rmodel.js')

// Tests events being fired for property changes

describe('rmodel property change events', ()=>{
  let r = null
  let event = null
  beforeEach(()=>{
    r = RModel({})
    event = null
    const listener = (e)=>{event = e}
    RModel.addChangeListener(r, listener)
  })
  describe('setting a property that doesn\'t yet exist', ()=>{
    describe('deleting the proerty', ()=>{
      it('should fire no event', ()=>{
        delete r.x
        expect(event).toEqual(null)
      })
    })
    describe('with undefined', ()=>{
      it('should fire the expected event', ()=>{
        r.x = undefined
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: undefined,
          hadOwnProperty: false,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with null', ()=>{
      it('should fire the expected event', ()=>{
        r.x = null
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: null,
          hadOwnProperty: false,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with a non-object', ()=>{
      it('should fire the expected event', ()=>{
        r.x = 'abc'
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: 'abc',
          hadOwnProperty: false,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with an object not yet in the tree', ()=>{
      it('should fire the expected event, with the object added', ()=>{
        r.x = {}
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: r.x,
          hadOwnProperty: false,
          hasOwnProperty: true,
          added: [r.x],
          removed: null
        })
      })
    })
    describe('with an object in the tree', ()=>{
      it('should fire the expected event, without the object added', ()=>{
        r.y = {}
        r.x = r.y
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: r.y,
          hadOwnProperty: false,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
  })
  describe('setting a property whose value is undefined', ()=>{
    beforeEach(()=>{
      r.x = undefined
      event = null
    })
    describe('deleting the proerty', ()=>{
      it('should fire the expected event', ()=>{
        delete r.x
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: undefined,
          hadOwnProperty: true,
          hasOwnProperty: false,
          added: null,
          removed: null
        })
      })
    })
    describe('with undefined', ()=>{
      it('should fire no event', ()=>{
        r.x = undefined
        expect(event).toEqual(null)
      })
    })
    describe('with null', ()=>{
      it('should fire the expected event', ()=>{
        r.x = null
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: null,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with a non-object', ()=>{
      it('should fire the expected event', ()=>{
        r.x = 'abc'
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: 'abc',
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with an object not yet in the tree', ()=>{
      it('should fire the expected event, with the object added', ()=>{
        r.x = {}
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: r.x,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: [r.x],
          removed: null
        })
      })
    })
    describe('with an object in the tree', ()=>{
      it('should fire the expected event, without the object added', ()=>{
        r.y = {}
        r.x = r.y
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: undefined,
          newValue: r.y,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
  })
  describe('setting a property whose value is null', ()=>{
    beforeEach(()=>{
      r.x = null
      event = null
    })
    describe('deleting the proerty', ()=>{
      it('should fire the expected event', ()=>{
        delete r.x
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: null,
          newValue: undefined,
          hadOwnProperty: true,
          hasOwnProperty: false,
          added: null,
          removed: null
        })
      })
    })
    describe('with undefined', ()=>{
      it('should fire the expected event', ()=>{
        r.x = undefined
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: null,
          newValue: undefined,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with null', ()=>{
      it('should fire no event', ()=>{
        r.x = null
        expect(event).toEqual(null)
      })
    })
    describe('with a non-object', ()=>{
      it('should fire the expected event', ()=>{
        r.x = 'abc'
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: null,
          newValue: 'abc',
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with an object not yet in the tree', ()=>{
      it('should fire the expected event, with the object added', ()=>{
        r.x = {}
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: null,
          newValue: r.x,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: [r.x],
          removed: null
        })
      })
    })
    describe('with an object in the tree', ()=>{
      it('should fire the expected event, without the object added', ()=>{
        r.y = {}
        r.x = r.y
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: null,
          newValue: r.y,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
  })
  describe('setting a property whose value is a non-object', ()=>{
    beforeEach(()=>{
      r.x = 'abc'
      event = null
    })
    describe('deleting the proerty', ()=>{
      it('should fire the expected event', ()=>{
        delete r.x
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: 'abc',
          newValue: undefined,
          hadOwnProperty: true,
          hasOwnProperty: false,
          added: null,
          removed: null
        })
      })
    })
    describe('with undefined', ()=>{
      it('should fire the expected event', ()=>{
        r.x = undefined
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: 'abc',
          newValue: undefined,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with null', ()=>{
      it('should fire the expected event', ()=>{
        r.x = null
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: 'abc',
          newValue: null,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with a non-object of the same value', ()=>{
      it('should fire no event', ()=>{
        r.x = 'abc'
        expect(event).toEqual(null)
      })
    })
    describe('with a non-object of a different value', ()=>{
      it('should fire the expected event, with the object added', ()=>{
        r.x = 13
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: 'abc',
          newValue: 13,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
    describe('with an object not yet in the tree', ()=>{
      it('should fire the expected event, with the object added', ()=>{
        r.x = {}
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: 'abc',
          newValue: r.x,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: [r.x],
          removed: null
        })
      })
    })
    describe('with an object in the tree', ()=>{
      it('should fire the expected event, without the object added', ()=>{
        r.y = {}
        r.x = r.y
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: 'abc',
          newValue: r.y,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: null
        })
      })
    })
  })
  describe('setting a property whose value is an object with no secondary references', ()=>{
    let rx = null
    beforeEach(()=>{
      r.x = {}
      rx = r.x
      event = null
    })
    describe('deleting the proerty', ()=>{
      it('should fire the expected event with the object removed', ()=>{
        delete r.x
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: undefined,
          hadOwnProperty: true,
          hasOwnProperty: false,
          added: null,
          removed: [rx]
        })
      })
    })
    describe('with undefined', ()=>{
      it('should fire the expected event with the object removed', ()=>{
        r.x = undefined
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: undefined,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: [rx]
        })
      })
    })
    describe('with null', ()=>{
      it('should fire the expected event with the object removed', ()=>{
        r.x = null
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: null,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: [rx]
        })
      })
    })
    describe('with a non-object', ()=>{
      it('should fire the expected event with the object removed', ()=>{
        r.x = 'abc'
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: 'abc',
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: [rx]
        })
      })
    })
    describe('with the same object', ()=>{
      it('should fire no event', ()=>{
        r.x = rx
        expect(event).toEqual(null)
      })
    })
    describe('with a different object of equivalent value', ()=>{
      it('should fire the expected event with objects removed and added', ()=>{
        r.x = {}
        const rx2 = r.x
        expect(rx).not.toBe(rx2)
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: rx2,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: [rx2],
          removed: [rx]
        })
      })
    })
    describe('with a object with different value', ()=>{
      it('should fire the expected event with objects removed and added', ()=>{
        r.x = { a: 12 }
        const rx2 = r.x
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: rx2,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: [rx2],
          removed: [rx]
        })
      })
    })
    describe('with an object that references the old value', ()=>{
      it('should fire the expected event with objects added but not removed', ()=>{
        r.x = { a: rx }
        const rx2 = r.x
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: rx2,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: [rx2],
          removed: null
        })
      })
    })
    describe('with an object referenced by the old value', ()=>{
      it('should fire the expected event with objects removed', ()=>{
        rx.a = {}
        const rxa = rx.a
        r.x = rxa
        const rx2 = r.x
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: rx2,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: null,
          removed: [rx]
        })
      })
    })
    describe('with an object referencing an object referenced by the old value', ()=>{
      it('should fire the expected event with objects added and removed', ()=>{
        rx.a = {}
        const rxa = rx.a
        const o2 = { b: rxa }
        r.x = o2
        const rx2 = r.x
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: rx2,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: [rx2],
          removed: [rx]
        })
      })
    })
    describe('with an object referencing another object', ()=>{
      it('should fire the expected event with objects added and removed', ()=>{
        r.x = {b: { c: {}}}
        const rx2 = r.x
        const rx2b = r.x.b
        const rx2bc = r.x.b.c
        expect(event).toEqual({
          type: 'PropertyChange',
          target: r,
          property: 'x',
          oldValue: rx,
          newValue: rx2,
          hadOwnProperty: true,
          hasOwnProperty: true,
          added: [rx2, rx2b, rx2bc],
          removed: [rx]
        })
      })
    })
  })
})
