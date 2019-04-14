const RModel = require('../dist/rmodel.js')

// Tests events being fired for array changes

describe('rmodel array change events', ()=>{
  describe('methods that turn into splice calls', ()=>{
    let o = null
    let r = null
    let event = null
    beforeEach(()=>{
      o = [{a:10}, 3, 'hello']
      r = RModel(o)
      event = null
      RModel.addChangeListener(r, e=>{event = e})
    })
    describe('push', ()=>{
      describe('push no values', ()=>{
        it('should fire no events', ()=>{
          const ret = r.push()
          expect(ret).toEqual(3)
          expect(r).toEqual([{a:10}, 3, 'hello'])
          expect(event).toBe(null)
          expect(RModel.parent(r[0])).toEqual(r)
          expect(RModel.property(r[0])).toEqual('0')
        })
      })
      describe('push one value', ()=>{
        it('should fire an event', ()=>{
          const o2 = {b:20}
          const ret = r.push(o2)
          const r2 = RModel(o2)
          expect(ret).toEqual(4)
          expect(r).toEqual([{a:10}, 3, 'hello', {b:20}])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 3,
            deleteCount: 0,
            insertCount: 1,
            deleted: null,
            inserted: [{b:20}],
            oldLength: 3,
            newLength: 4,
            added: [{b:20}],
            removed: null
          })
          expect(event.inserted[0]).toBe(r2)
          expect(event.added[0]).toBe(r2)
          expect(RModel.parent(r[0])).toEqual(r)
          expect(RModel.property(r[0])).toEqual('0')
          expect(RModel.parent(r[3])).toEqual(r)
          expect(RModel.property(r[3])).toEqual('3')
        })
      })
      describe('push two values', ()=>{
        it('should fire an event', ()=>{
          const o2 = {b:20}
          const ret = r.push('abc', o2)
          const r2 = RModel(o2)
          expect(ret).toEqual(5)
          expect(r).toEqual([{a:10}, 3, 'hello', 'abc', {b:20}])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 3,
            deleteCount: 0,
            insertCount: 2,
            deleted: null,
            inserted: ['abc', {b:20}],
            oldLength: 3,
            newLength: 5,
            added: [{b:20}],
            removed: null
          })
          expect(event.inserted[1]).toBe(r2)
          expect(event.added[0]).toBe(r2)
          expect(RModel.parent(r[0])).toEqual(r)
          expect(RModel.property(r[0])).toEqual('0')
          expect(RModel.parent(r[4])).toEqual(r)
          expect(RModel.property(r[4])).toEqual('4')
        })
      })
    })
    describe('pop', ()=>{
      describe('on an empty array', ()=>{
        it('should not fire an event', ()=>{
          o = []
          r = RModel(o)
          RModel.addChangeListener(r, e=>{event = e})
          const ret = r.pop()
          expect(ret).toBe(undefined)
          expect(r).toEqual([])
          expect(event).toBe(null)
        })
      })
      describe('on an array with elements', ()=>{
        it('should fire an event', ()=>{
          const ret = r.pop()
          expect(ret).toEqual('hello')
          expect(r).toEqual([{a:10}, 3])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 1,
            insertCount: 0,
            deleted: ['hello'],
            inserted: null,
            oldLength: 3,
            newLength: 2,
            added: null,
            removed: null
          })
        })
      })
    })
    describe('unshift', ()=>{
      describe('unshift no values', ()=>{
        it('should fire no events', ()=>{
          const ret = r.unshift()
          expect(ret).toEqual(3)
          expect(r).toEqual([{a:10}, 3, 'hello'])
          expect(event).toBe(null)
          expect(RModel.parent(r[0])).toEqual(r)
          expect(RModel.property(r[0])).toEqual('0')
        })
      })
      describe('unshift one value', ()=>{
        it('should fire an event', ()=>{
          const o2 = {b:20}
          const ret = r.unshift(o2)
          const r2 = RModel(o2)
          expect(ret).toEqual(4)
          expect(r).toEqual([{b:20}, {a:10}, 3, 'hello'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 0,
            deleteCount: 0,
            insertCount: 1,
            deleted: null,
            inserted: [{b:20}],
            oldLength: 3,
            newLength: 4,
            added: [{b:20}],
            removed: null
          })
          expect(event.inserted[0]).toBe(r2)
          expect(event.added[0]).toBe(r2)
          expect(RModel.parent(r[0])).toEqual(r)
          expect(RModel.property(r[0])).toEqual('0')
          expect(RModel.parent(r[1])).toEqual(r)
          expect(RModel.property(r[1])).toEqual('1')
        })
      })
      describe('unshift two values', ()=>{
        it('should fire an event', ()=>{
          const o2 = {b:20}
          const ret = r.unshift('abc', o2)
          const r2 = RModel(o2)
          expect(ret).toEqual(5)
          expect(r).toEqual(['abc', {b:20}, {a:10}, 3, 'hello'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 0,
            deleteCount: 0,
            insertCount: 2,
            deleted: null,
            inserted: ['abc', {b:20}],
            oldLength: 3,
            newLength: 5,
            added: [{b:20}],
            removed: null
          })
          expect(event.inserted[1]).toBe(r2)
          expect(event.added[0]).toBe(r2)
          expect(RModel.parent(r[1])).toEqual(r)
          expect(RModel.property(r[1])).toEqual('1')
          expect(RModel.parent(r[2])).toEqual(r)
          expect(RModel.property(r[2])).toEqual('2')
        })
      })
    })
    describe('shift', ()=>{
      describe('on an empty array', ()=>{
        it('should not fire an event', ()=>{
          o = []
          r = RModel(o)
          RModel.addChangeListener(r, e=>{event = e})
          const ret = r.shift()
          expect(ret).toBe(undefined)
          expect(r).toEqual([])
          expect(event).toBe(null)
        })
      })
      describe('on an array with elements', ()=>{
        it('should fire an event', ()=>{
          const r0 = r[0]
          const ret = r.shift()
          expect(ret).toEqual({a:10})
          expect(r).toEqual([3, 'hello'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 0,
            deleteCount: 1,
            insertCount: 0,
            deleted: [{a:10}],
            inserted: null,
            oldLength: 3,
            newLength: 2,
            added: null,
            removed: [{a:10}]
          })
          expect(event.deleted[0]).toBe(r0)
          expect(event.removed[0]).toBe(r0)
          expect(RModel.hasRModel(r0)).toBe(false)
        })
      })
    })
  })
  describe('splice', ()=>{
    let o = null
    let r = null
    let event = null
    beforeEach(()=>{
      o = [{a:10}, 4, {b:20}, {c:30}, 'abc']
      r = RModel(o)
      event = null
      RModel.addChangeListener(r, e=>{event = e})
    })
    describe('without removing or adding any elements', ()=>{
      it('should leave the array unchanged and fire no event', ()=>{
        r.splice(3, 0)
        expect(r).toEqual([{a:10}, 4, {b:20}, {c:30}, 'abc'])
        expect(event).toBe(null)
      })
    })
    describe('just adding elements', ()=>{
      describe('inserting no elements', ()=>{
        it('should fire no events', ()=>{
          const ret = r.splice(3, 0)
          expect(ret).toEqual([])
          expect(r).toEqual([{a:10}, 4, {b:20}, {c:30}, 'abc'])
          expect(event).toBe(null)
        })
      })
      describe('appending one non-object element', ()=>{
        it('should fire the expected event', ()=>{
          const ret = r.splice(5, 0, 'def')
          expect(ret).toEqual([])
          expect(r).toEqual([{a:10}, 4, {b:20}, {c:30}, 'abc', 'def'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 5,
            deleteCount: 0,
            insertCount: 1,
            deleted: null,
            inserted: ['def'],
            oldLength: 5,
            newLength: 6,
            added: null,
            removed: null
          })
        })
      })
      describe('appending two non-object elements', ()=>{
        it('should fire the expected event', ()=>{
          const ret = r.splice(5, 0, 'def', 6)
          expect(ret).toEqual([])
          expect(r).toEqual([{a:10}, 4, {b:20}, {c:30}, 'abc', 'def', 6])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 5,
            deleteCount: 0,
            insertCount: 2,
            deleted: null,
            inserted: ['def', 6],
            oldLength: 5,
            newLength: 7,
            added: null,
            removed: null
          })
        })
      })
      describe('inserting one non-object element', ()=>{
        it('should fire the expected event', ()=>{
          const ret = r.splice(2, 0, 'def')
          expect(ret).toEqual([])
          expect(r).toEqual([{a:10}, 4, 'def', {b:20}, {c:30}, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 0,
            insertCount: 1,
            deleted: null,
            inserted: ['def'],
            oldLength: 5,
            newLength: 6,
            added: null,
            removed: null
          })
        })
      })
      describe('inserting two non-object elements', ()=>{
        it('should fire the expected event', ()=>{
          const ret = r.splice(2, 0, 'def', 6)
          expect(ret).toEqual([])
          expect(r).toEqual([{a:10}, 4, 'def', 6, {b:20}, {c:30}, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 0,
            insertCount: 2,
            deleted: null,
            inserted: ['def', 6],
            oldLength: 5,
            newLength: 7,
            added: null,
            removed: null
          })
        })
      })
      describe('inserting one object element', ()=>{
        describe('that isn\'t yet in the tree', ()=>{
          it('should fire the expected event with the object added', ()=>{
            const o2 = {e: {f: 20}}
            const ret = r.splice(2, 0, o2)
            const r2 = RModel(o2)
            expect(o[2]).toBe(o2)
            expect(r[2]).toBe(r2)
            expect(ret).toEqual([])
            expect(r).toEqual([{a:10}, 4, {e:{f:20}}, {b:20}, {c:30}, 'abc'])
            expect(event).toEqual({
              type: 'ArrayChange',
              target: r,
              index: 2,
              deleteCount: 0,
              insertCount: 1,
              deleted: null,
              inserted: [r2],
              oldLength: 5,
              newLength: 6,
              added: [r2, r2.e],
              removed: null
            })
            expect(event.inserted[0]).toBe(r2)
            expect(event.added[0]).toBe(r2)
            expect(event.added[1]).toBe(r2.e)
            expect(RModel.parent(r2)).toBe(r)
            expect(RModel.property(r2)).toBe('2')
            expect(RModel.root(r2)).toBe(r)
            expect(RModel.secondaryReferences(r2)).toEqual([])
            expect(RModel.parent(r2.e)).toBe(r2)
            expect(RModel.property(r2.e)).toBe('e')
            expect(RModel.root(r2.e)).toBe(r)
            expect(RModel.secondaryReferences(r2.e)).toEqual([])
          })
        })
        describe('that is already in the tree', ()=>{
          it('should fire the expected event without the object added', ()=>{
            const o2 = o[3]
            const r2 = r[3]
            const ret = r.splice(2, 0, r2)
            expect(o[2]).toBe(o2)
            expect(r[2]).toBe(r2)
            expect(ret).toEqual([])
            expect(r).toEqual([{a:10}, 4, {c:30}, {b:20}, {c:30}, 'abc'])
            expect(event).toEqual({
              type: 'ArrayChange',
              target: r,
              index: 2,
              deleteCount: 0,
              insertCount: 1,
              deleted: null,
              inserted: [r2],
              oldLength: 5,
              newLength: 6,
              added: null,
              removed: null
            })
            expect(event.inserted[0]).toBe(r2)
            expect(RModel.parent(r2)).toBe(r)
            expect(RModel.property(r2)).toBe('4')
            expect(RModel.root(r2)).toBe(r)
            expect(RModel.secondaryReferences(r2)).toEqual([
              { referrer: r, property: '2'}
            ])
          })
        })
        describe('that is part of another tree', ()=>{
          it('should throw an exception', ()=>{
            const ro = RModel({e: {f: 60}})
            expect(()=>{r.splice(2, 0, ro.e)}).toThrow(new Error('Cannot set a property to point to an object belonging to a different tree'))
          })
        })
      })
      describe('inserting two object elements', ()=>{
        describe('that are separate trees', ()=>{
          it('should fire the expected event with the objects from the trees aded', ()=>{
            const oo1 = {e:50, e1:{ee1:501}}
            const oo2 = {f:60, f1:{ff1:601}}
            const ret = r.splice(2, 0, oo1, oo2)
            const ro1 = RModel(oo1)
            const ro2 = RModel(oo2)
            expect(ret).toEqual([])
            expect(r).toEqual([{a:10}, 4, {e:50, e1:{ee1:501}}, {f:60, f1:{ff1:601}}, {b:20}, {c:30}, 'abc'])
            expect(event).toEqual({
              type: 'ArrayChange',
              target: r,
              index: 2,
              deleteCount: 0,
              insertCount: 2,
              deleted: null,
              inserted: [ro1, ro2],
              oldLength: 5,
              newLength: 7,
              added: [ro1, ro1.e1, ro2, ro2.f1],
              removed: null
            })
            expect(event.inserted[0]).toBe(ro1)
            expect(RModel.parent(ro1)).toBe(r)
            expect(RModel.property(ro1)).toBe('2')
            expect(event.inserted[1]).toBe(ro2)
            expect(RModel.parent(ro2)).toBe(r)
            expect(RModel.property(ro2)).toBe('3')
          })
        })
        describe('where one already belongs to another tree', ()=>{
          it('should throw an exception', ()=>{
            const oo1 = {e:50, e1:{ee1:501}}
            const oo2 = {f:60, f1:{ff1:601}}
            const ro1 = RModel(oo1)
            const ro2 = RModel(oo2)
            expect(()=>{r.splice(2, 0, ro1, ro2.f1)}).toThrow(new Error('Cannot set a property to point to an object belonging to a different tree'))
          })
        })
        describe('where the second is a descendant of the first, not already rmodelized', ()=>{
          it('should fire the expected event with the objects from the trees aded', ()=>{
            const oo = {e:50, e1:{ee1:501}}
            const ret = r.splice(2, 0, oo, oo.e1)
            const ro = RModel(oo)
            expect(ret).toEqual([])
            expect(r).toEqual([{a:10}, 4, {e:50, e1:{ee1:501}}, {ee1:501}, {b:20}, {c:30}, 'abc'])
            expect(event).toEqual({
              type: 'ArrayChange',
              target: r,
              index: 2,
              deleteCount: 0,
              insertCount: 2,
              deleted: null,
              inserted: [ro, ro.e1],
              oldLength: 5,
              newLength: 7,
              added: [ro, ro.e1],
              removed: null
            })
            expect(event.inserted[0]).toBe(ro)
            expect(event.inserted[1]).toBe(ro.e1)
            expect(event.added[0]).toBe(ro)
            expect(event.added[1]).toBe(ro.e1)
            expect(RModel.parent(ro)).toBe(r)
            expect(RModel.property(ro)).toBe('2')
            expect(RModel.root(ro)).toBe(r)
            expect(RModel.parent(ro.e1)).toBe(ro)
            expect(RModel.property(ro.e1)).toBe('e1')
            expect(RModel.root(ro.e1)).toBe(r)
            expect(RModel.secondaryReferences(ro.e1)).toEqual([
              { referrer: r, property: '3' }
            ])
          })
        })
        describe('where the first is a descendant of the second, not already rmodelized', ()=>{
          it('should fire the expected event with the objects from the trees aded', ()=>{
            const oo = {e:50, e1:{ee1:501}}
            const ret = r.splice(2, 0, oo.e1, oo)
            const ro = RModel(oo)
            expect(ret).toEqual([])
            expect(r).toEqual([{a:10}, 4, {ee1:501}, {e:50, e1:{ee1:501}}, {b:20}, {c:30}, 'abc'])
            expect(event).toEqual({
              type: 'ArrayChange',
              target: r,
              index: 2,
              deleteCount: 0,
              insertCount: 2,
              deleted: null,
              inserted: [ro.e1, ro],
              oldLength: 5,
              newLength: 7,
              added: [ro.e1, ro],
              removed: null
            })
            expect(event.inserted[0]).toBe(ro.e1)
            expect(event.inserted[1]).toBe(ro)
            expect(event.added[0]).toBe(ro.e1)
            expect(event.added[1]).toBe(ro)
            expect(RModel.parent(ro)).toBe(r)
            expect(RModel.property(ro)).toBe('3')
            expect(RModel.root(ro)).toBe(r)
            expect(RModel.parent(ro.e1)).toBe(r)
            expect(RModel.property(ro.e1)).toBe('2')
            expect(RModel.root(ro.e1)).toBe(r)
            expect(RModel.secondaryReferences(ro.e1)).toEqual([
              { referrer: ro, property: 'e1' }
            ])
          })
        })
        describe('where the second is a descendant of the first, already rmodelized', ()=>{
          it('should fire the expected event with the objects from the trees aded', ()=>{
            const oo = {e:50, e1:{ee1:501}}
            const ro = RModel(oo)
            const ret = r.splice(2, 0, ro, ro.e1)
            expect(ret).toEqual([])
            expect(r).toEqual([{a:10}, 4, {e:50, e1:{ee1:501}}, {ee1:501}, {b:20}, {c:30}, 'abc'])
            expect(event).toEqual({
              type: 'ArrayChange',
              target: r,
              index: 2,
              deleteCount: 0,
              insertCount: 2,
              deleted: null,
              inserted: [ro, ro.e1],
              oldLength: 5,
              newLength: 7,
              added: [ro, ro.e1],
              removed: null
            })
            expect(event.inserted[0]).toBe(ro)
            expect(event.inserted[1]).toBe(ro.e1)
            expect(event.added[0]).toBe(ro)
            expect(event.added[1]).toBe(ro.e1)
            expect(RModel.parent(ro)).toBe(r)
            expect(RModel.property(ro)).toBe('2')
            expect(RModel.root(ro)).toBe(r)
            expect(RModel.parent(ro.e1)).toBe(ro)
            expect(RModel.property(ro.e1)).toBe('e1')
            expect(RModel.root(ro.e1)).toBe(r)
            expect(RModel.secondaryReferences(ro.e1)).toEqual([
              { referrer: r, property: '3' }
            ])
          })
        })
        describe('where the first is a descendant of the second, already rmodelized', ()=>{
          it('should fire the expected event with the objects from the trees aded', ()=>{
            const oo = {e:50, e1:{ee1:501}}
            const ro = RModel(oo)
            const ret = r.splice(2, 0, oo.e1, oo)
            expect(ret).toEqual([])
            expect(r).toEqual([{a:10}, 4, {ee1:501}, {e:50, e1:{ee1:501}}, {b:20}, {c:30}, 'abc'])
            expect(event).toEqual({
              type: 'ArrayChange',
              target: r,
              index: 2,
              deleteCount: 0,
              insertCount: 2,
              deleted: null,
              inserted: [ro.e1, ro],
              oldLength: 5,
              newLength: 7,
              added: [ro, ro.e1],
              removed: null
            })
            expect(event.inserted[0]).toBe(ro.e1)
            expect(event.inserted[1]).toBe(ro)
            expect(event.added[0]).toBe(ro)
            expect(event.added[1]).toBe(ro.e1)
            expect(RModel.parent(ro)).toBe(r)
            expect(RModel.property(ro)).toBe('3')
            expect(RModel.root(ro)).toBe(r)
            expect(RModel.parent(ro.e1)).toBe(ro)
            expect(RModel.property(ro.e1)).toBe('e1')
            expect(RModel.root(ro.e1)).toBe(r)
            expect(RModel.secondaryReferences(ro.e1)).toEqual([
              { referrer: r, property: '2' }
            ])
          })
        })
        describe('where one is already in the tree', ()=>{
          it('should fire the expected event with only one object added', ()=>{
            const oo1 = {e:50, e1:{ee1:501}}
            const oo2 = {f:60, f1:{ff1:601}}
            const rr = RModel({r: r, ro2: oo2})
            const ret = r.splice(2, 0, oo1, oo2)
            const ro1 = RModel(oo1)
            const ro2 = RModel(oo2)
            expect(ret).toEqual([])
            expect(r).toEqual([{a:10}, 4, {e:50, e1:{ee1:501}}, {f:60, f1:{ff1:601}}, {b:20}, {c:30}, 'abc'])
            expect(event).toEqual({
              type: 'ArrayChange',
              target: r,
              index: 2,
              deleteCount: 0,
              insertCount: 2,
              deleted: null,
              inserted: [ro1, ro2],
              oldLength: 5,
              newLength: 7,
              added: [ro1, ro1.e1],
              removed: null
            })
            expect(event.inserted[0]).toBe(ro1)
            expect(RModel.parent(ro1)).toBe(r)
            expect(RModel.property(ro1)).toBe('2')
          })
        })
        describe('where both are already in the tree', ()=>{
          it('should fire the expected event with no objects added', ()=>{
            const oo1 = {e:50, e1:{ee1:501}}
            const oo2 = {f:60, f1:{ff1:601}}
            const rr = RModel({r: r, ro1: oo1, ro2: oo2})
            const ret = r.splice(2, 0, oo1, oo2)
            const ro1 = RModel(oo1)
            const ro2 = RModel(oo2)
            expect(ret).toEqual([])
            expect(r).toEqual([{a:10}, 4, {e:50, e1:{ee1:501}}, {f:60, f1:{ff1:601}}, {b:20}, {c:30}, 'abc'])
            expect(event).toEqual({
              type: 'ArrayChange',
              target: r,
              index: 2,
              deleteCount: 0,
              insertCount: 2,
              deleted: null,
              inserted: [ro1, ro2],
              oldLength: 5,
              newLength: 7,
              added: null,
              removed: null
            })
          })
        })
      })
    })
    describe('just removing elements', ()=>{
      describe('removing no elements', ()=>{
        it('should fire no events', ()=>{
          const ret = r.splice(3, 0)
          expect(ret).toEqual([])
          expect(r).toEqual([{a:10}, 4, {b:20}, {c:30}, 'abc'])
          expect(event).toBe(null)
        })
      })
      describe('removing a single non-object element', ()=>{
        it('should fire the expected event', ()=>{
          const ret = r.splice(1, 1)
          expect(ret).toEqual([4])
          expect(r).toEqual([{a:10}, {b:20}, {c:30}, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 1,
            deleteCount: 1,
            insertCount: 0,
            deleted: [4],
            inserted: null,
            oldLength: 5,
            newLength: 4,
            added: null,
            removed: null
          })
        })
      })
      describe('removing one object element', ()=>{
        it('should fire the expected event', ()=>{
          const r2 = r[2]
          expect(RModel.hasRModel(r2)).toBe(true)
          const ret = r.splice(2, 1)
          expect(ret).toEqual([{b:20}])
          expect(ret[0]).toBe(r2)
          expect(r).toEqual([{a:10}, 4, {c:30}, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 1,
            insertCount: 0,
            deleted: [{b:20}],
            inserted: null,
            oldLength: 5,
            newLength: 4,
            added: null,
            removed: [{b:20}]
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.removed[0]).toBe(r2)
          expect(RModel.hasRModel(r2)).toBe(false)
        })
      })
      describe('removing two independent object elements that are not otherwise referenced', ()=>{
        it('should fire the expected event with both removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          expect(RModel.hasRModel(r2)).toBe(true)
          expect(RModel.hasRModel(r3)).toBe(true)
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20}, {c:30}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20}, {c:30}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: [{b:20}, {c:30}]
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.removed[0]).toBe(r2)
          expect(RModel.hasRModel(r2)).toBe(false)
          expect(event.deleted[1]).toBe(r3)
          expect(event.removed[1]).toBe(r3)
          expect(RModel.hasRModel(r3)).toBe(false)
        })
      })
      describe('removing two independent object elements where the first is still referenced by the tree', ()=>{
        it('should fire the expected event with only the second removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          const rr = RModel({a: r, r2: r2})
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20}, {c:30}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20}, {c:30}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: [{c:30}]
          })
          expect(RModel.hasRModel(r2)).toBe(true)
          expect(event.deleted[0]).toBe(r2)
          expect(event.deleted[1]).toBe(r3)
          expect(event.removed[0]).toBe(r3)
          expect(RModel.hasRModel(r3)).toBe(false)
        })
      })
      describe('removing two independent object elements where the second is still referenced by the tree', ()=>{
        it('should fire the expected event with only the first removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          const rr = RModel({a: r, r3: r3})
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20}, {c:30}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20}, {c:30}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: [{b:20}]
          })
          expect(RModel.hasRModel(r3)).toBe(true)
          expect(event.deleted[0]).toBe(r2)
          expect(event.deleted[1]).toBe(r3)
          expect(event.removed[0]).toBe(r2)
          expect(RModel.hasRModel(r2)).toBe(false)
        })
      })
      describe('removing two independent object elements where both are still referenced by the tree', ()=>{
        it('should fire the expected event with neither object removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          const rr = RModel({a: r, r2: r2, r3: r3})
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20}, {c:30}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20}, {c:30}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: null,
          })
          expect(RModel.hasRModel(r2)).toBe(true)
          expect(RModel.hasRModel(r3)).toBe(true)
        })
      })
      describe('removing two object elements where the first is referenced by the second, and the second is still referenced by the tree', ()=>{
        it('should fire the expected event with neither object removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          const rr = RModel({a: r, r3: r3})
          r3.r2 = r2
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20}, {c:30, r2:r2}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20}, {c:30, r2:r2}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: null,
          })
          expect(RModel.hasRModel(r2)).toBe(true)
          expect(RModel.hasRModel(r3)).toBe(true)
        })
      })
      describe('removing two object elements where the first is referenced by the second, and the second is not referenced by the tree', ()=>{
        it('should fire the expected event with both removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          r3.r2 = r2
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20}, {c:30, r2:r2}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20}, {c:30, r2:r2}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: [{c:30, r2:r2}, {b:20}]
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.deleted[1]).toBe(r3)
          expect(event.removed[0]).toBe(r3)
          expect(event.removed[1]).toBe(r2)
          expect(RModel.hasRModel(r2)).toBe(false)
          expect(RModel.hasRModel(r3)).toBe(false)
        })
      })
      describe('removing two object elements where the second is referenced by the first, and the first is still referenced by the tree', ()=>{
        it('should fire the expected event with neither object removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          const rr = RModel({a: r, r2: r2})
          r2.r3 = r3
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20, r3:r3}, {c:30}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20, r3:r3}, {c:30}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: null
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.deleted[1]).toBe(r3)
          expect(RModel.hasRModel(r2)).toBe(true)
          expect(RModel.hasRModel(r3)).toBe(true)
        })
      })
      describe('removing two object elements where the second is referenced by the first, and the first is not referenced by the tree', ()=>{
        it('should fire the expected event with both removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          r2.r3 = r3
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20, r3:r3}, {c:30}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20, r3:r3}, {c:30}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: [{b:20, r3:r3}, {c:30}]
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.deleted[1]).toBe(r3)
          expect(event.removed[0]).toBe(r2)
          expect(event.removed[1]).toBe(r3)
          expect(RModel.hasRModel(r2)).toBe(false)
          expect(RModel.hasRModel(r3)).toBe(false)
        })
      })
      describe('removing two object elements that reference each other, and neither is referenced by the tree', ()=>{
        it('should fire the expected event with the objects removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          r2.r3 = r3
          r3.r2 = r2
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20, r3:r3}, {c:30, r2:r2}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20, r3:r3}, {c:30, r2:r2}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: [{c:30, r2:r2}, {b:20, r3:r3}]
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.deleted[1]).toBe(r3)
          expect(event.removed[0]).toBe(r3)
          expect(event.removed[1]).toBe(r2)
          expect(RModel.hasRModel(r2)).toBe(false)
          expect(RModel.hasRModel(r3)).toBe(false)
        })
      })
      describe('removing two object elements that reference the same object that will also be removed', ()=>{
        it('should fire the expected event with all the objects removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          const oo = {e:50}
          const ro = RModel(oo)
          r2.oo = oo
          r3.oo = oo
          const ret = r.splice(2, 2)
          expect(ret).toEqual([{b:20, oo:ro}, {c:30, oo:ro}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 0,
            deleted: [{b:20, oo:ro}, {c:30, oo:ro}],
            inserted: null,
            oldLength: 5,
            newLength: 3,
            added: null,
            removed: [{b:20, oo:ro}, {c:30, oo:ro}, {e:50}]
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.deleted[1]).toBe(r3)
          expect(event.removed[0]).toBe(r2)
          expect(event.removed[1]).toBe(r3)
          expect(event.removed[2]).toBe(ro)
          expect(RModel.hasRModel(r2)).toBe(false)
          expect(RModel.hasRModel(r3)).toBe(false)
          expect(RModel.hasRModel(ro)).toBe(false)
        })
      })
    })
    describe('both adding and removing elements', ()=>{
      describe('adding and removing the same object', ()=>{
        it('should fire the expected event with no objects removed', ()=>{
          const r2 = r[2]
          const ret = r.splice(2, 1, r2)
          expect(ret).toEqual([{b:20}])
          expect(ret[0]).toBe(r2)
          expect(r).toEqual([{a:10}, 4, {b:20}, {c:30}, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 1,
            insertCount: 1,
            deleted: [{b:20}],
            inserted: [{b:20}],
            oldLength: 5,
            newLength: 5,
            added: null,
            removed: null
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.inserted[0]).toBe(r2)
          expect(RModel.hasRModel(r2)).toBe(true)
        })
      })
      describe('adding and removing two objects, swapping their places', ()=>{
        it('should fire the expected event with no objects removed', ()=>{
          const r2 = r[2]
          const r3 = r[3]
          const ret = r.splice(2, 2, r3, r2)
          expect(ret).toEqual([{b:20}, {c:30}])
          expect(ret[0]).toBe(r2)
          expect(ret[1]).toBe(r3)
          expect(r).toEqual([{a:10}, 4, {c:30}, {b:20}, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 2,
            insertCount: 2,
            deleted: [{b:20}, {c:30}],
            inserted: [{c:30}, {b:20}],
            oldLength: 5,
            newLength: 5,
            added: null,
            removed: null
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.deleted[1]).toBe(r3)
          expect(event.inserted[0]).toBe(r3)
          expect(event.inserted[1]).toBe(r2)
          expect(RModel.hasRModel(r2)).toBe(true)
        })
      })
      describe('adding an object that references the object being removed', ()=>{
        it('should fire the expected event with no objects removed', ()=>{
          const r2 = r[2]
          const oo = {r2:r2}
          const ret = r.splice(2, 1, oo)
          const ro = RModel(oo)
          expect(ret).toEqual([{b:20}])
          expect(ret[0]).toBe(r2)
          expect(r).toEqual([{a:10}, 4, {r2: {b:20}}, {c:30}, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 1,
            insertCount: 1,
            deleted: [{b:20}],
            inserted: [{r2: {b:20}}],
            oldLength: 5,
            newLength: 5,
            added: [{r2: {b:20}}],
            removed: null
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.inserted[0]).toBe(ro)
          expect(event.added[0]).toBe(ro)
          expect(RModel.hasRModel(r2)).toBe(true)
        })
      })
      describe('removing an object that references the object being added', ()=>{
        it('should fire the expected event with the object removed', ()=>{
          const r2 = r[2]
          const oo = {e:50}
          r2.oo = oo
          const ret = r.splice(2, 1, oo)
          const ro = RModel(oo)
          expect(ret).toEqual([{b:20, oo:{e:50}}])
          expect(ret[0]).toBe(r2)
          expect(r).toEqual([{a:10}, 4, {e: 50}, {c:30}, 'abc'])
          expect(event).toEqual({
            type: 'ArrayChange',
            target: r,
            index: 2,
            deleteCount: 1,
            insertCount: 1,
            deleted: [{b:20, oo: {e:50}}],
            inserted: [{e:50}],
            oldLength: 5,
            newLength: 5,
            added: null,
            removed: [{b:20, oo: {e:50}}]
          })
          expect(event.deleted[0]).toBe(r2)
          expect(event.inserted[0]).toBe(ro)
          expect(event.removed[0]).toBe(r2)
          expect(RModel.hasRModel(r2)).toBe(false)
        })
      })
    })
    describe('changing element references', ()=>{
      describe('an array of object elements for which this is the primary reference', ()=>{
        let o2 = null
        let r2 = null
        beforeEach(()=>{
          o2 = [{a:10}, {b:20}, {c:30}, {d:40}]
          r2 = RModel(o2)
        })
        describe('inserting a value', ()=>{
          it('should update all the references', ()=>{
            r2.splice(2, 0, {e:50})
            expect(r2).toEqual([{a:10}, {b:20}, {e:50}, {c:30}, {d:40}])
            expect(RModel.property(r2[0])).toBe('0')
            expect(RModel.property(r2[1])).toBe('1')
            expect(RModel.property(r2[2])).toBe('2')
            expect(RModel.property(r2[3])).toBe('3')
            expect(RModel.property(r2[4])).toBe('4')
          })
        })
        describe('removing a value', ()=>{
          it('should update all the references', ()=>{
            r2.splice(2, 1)
            expect(r2).toEqual([{a:10}, {b:20}, {d:40}])
            expect(RModel.property(r2[0])).toBe('0')
            expect(RModel.property(r2[1])).toBe('1')
            expect(RModel.property(r2[2])).toBe('2')
          })
        })
        describe('inserting and removing values', ()=>{
          it('should update all the references', ()=>{
            r2.splice(1, 2, {e:50})
            expect(r2).toEqual([{a:10}, {e:50}, {d:40}])
            expect(RModel.property(r2[0])).toBe('0')
            expect(RModel.property(r2[1])).toBe('1')
            expect(RModel.property(r2[2])).toBe('2')
          })
        })
      })
      describe('an array of object elements for which this is the secondary reference', ()=>{
        let o2 = null
        let r2 = null
        let op = null
        let os = null
        let rp = null
        let rs = null
        beforeEach(()=>{
          op = [{a:10}, {b:20}, {c:30}, {d:40}]
          os = op.slice()
          o2 = {
            p: op
          }
          r2 = RModel(o2)

          r2.s = os
          rp = RModel(op)
          rs = RModel(os)
        })
        describe('inserting a value', ()=>{
          it('should update all the references', ()=>{
            rs.splice(2, 0, {e:50})
            expect(r2).toEqual({
              p: [{a:10}, {b:20}, {c:30}, {d:40}],
              s: [{a:10}, {b:20}, {e:50}, {c:30}, {d:40}],
            })
            expect(RModel.parent(rp[0])).toBe(rp)
            expect(RModel.property(rp[0])).toBe('0')
            expect(RModel.parent(rp[1])).toBe(rp)
            expect(RModel.property(rp[1])).toBe('1')
            expect(RModel.parent(rp[2])).toBe(rp)
            expect(RModel.property(rp[2])).toBe('2')
            expect(RModel.parent(rp[3])).toBe(rp)
            expect(RModel.property(rp[3])).toBe('3')

            expect(RModel.parent(rs[0])).toBe(rp)
            expect(RModel.property(rs[0])).toBe('0')
            expect(RModel.secondaryReferences(rs[0])).toEqual([
              { referrer: rs, property: '0' }
            ])
            expect(RModel.parent(rs[1])).toBe(rp)
            expect(RModel.property(rs[1])).toBe('1')
            expect(RModel.secondaryReferences(rs[1])).toEqual([
              { referrer: rs, property: '1' }
            ])
            expect(RModel.parent(rs[2])).toBe(rs)
            expect(RModel.property(rs[2])).toBe('2')
            expect(RModel.secondaryReferences(rs[2])).toEqual([])
            expect(RModel.parent(rs[3])).toBe(rp)
            expect(RModel.property(rs[3])).toBe('2')
            expect(RModel.secondaryReferences(rs[3])).toEqual([
              { referrer: rs, property: '3' }
            ])
            expect(RModel.parent(rs[4])).toBe(rp)
            expect(RModel.property(rs[4])).toBe('3')
            expect(RModel.secondaryReferences(rs[4])).toEqual([
              { referrer: rs, property: '4' }
            ])
          })
        })
        describe('removing a value', ()=>{
          it('should update all the references', ()=>{
            rs.splice(1, 1)
            expect(r2).toEqual({
              p: [{a:10}, {b:20}, {c:30}, {d:40}],
              s: [{a:10}, {c:30}, {d:40}],
            })
            expect(RModel.parent(rp[0])).toBe(rp)
            expect(RModel.property(rp[0])).toBe('0')
            expect(RModel.parent(rp[1])).toBe(rp)
            expect(RModel.property(rp[1])).toBe('1')
            expect(RModel.parent(rp[2])).toBe(rp)
            expect(RModel.property(rp[2])).toBe('2')
            expect(RModel.parent(rp[3])).toBe(rp)
            expect(RModel.property(rp[3])).toBe('3')

            expect(RModel.parent(rs[0])).toBe(rp)
            expect(RModel.property(rs[0])).toBe('0')
            expect(RModel.secondaryReferences(rs[0])).toEqual([
              { referrer: rs, property: '0' }
            ])
            expect(RModel.parent(rs[1])).toBe(rp)
            expect(RModel.property(rs[1])).toBe('2')
            expect(RModel.secondaryReferences(rs[1])).toEqual([
              { referrer: rs, property: '1' }
            ])
            expect(RModel.parent(rs[2])).toBe(rp)
            expect(RModel.property(rs[2])).toBe('3')
            expect(RModel.secondaryReferences(rs[2])).toEqual([
              { referrer: rs, property: '2' }
            ])
          })
        })
      })
      describe('an array of the same object element added multiple times', ()=>{
        let o3 = null
        let o2 = null
        let r2 = null
        beforeEach(()=>{
          o3 = {a:10}
          o2 = [o3, o3, o3, o3]
          r2 = RModel(o2)
        })
        it('should have the expected references', ()=>{
          expect(r2[1]).toBe(r2[0])
          expect(r2[2]).toBe(r2[0])
          expect(r2[3]).toBe(r2[0])
          expect(RModel.parent(r2[0])).toBe(r2)
          expect(RModel.property(r2[0])).toBe('0')
          expect(RModel.secondaryReferences(r2[0])).toEqual([
            { referrer: r2, property: '1' },
            { referrer: r2, property: '2' },
            { referrer: r2, property: '3' },
          ])
        })
        describe('inserting a value', ()=>{
          it('should update all the references', ()=>{
            r2.splice(2, 0, o3)
            expect(r2[1]).toBe(r2[0])
            expect(r2[2]).toBe(r2[0])
            expect(r2[3]).toBe(r2[0])
            expect(r2[4]).toBe(r2[0])
            expect(RModel.parent(r2[0])).toBe(r2)
            expect(RModel.property(r2[0])).toBe('0')
            expect(RModel.secondaryReferences(r2[0])).toEqual([
              { referrer: r2, property: '1' },
              { referrer: r2, property: '3' },
              { referrer: r2, property: '4' },
              { referrer: r2, property: '2' },
            ])
          })
        })
        describe('removing a value', ()=>{
          it('should update all the references', ()=>{
            r2.splice(2, 1)
            expect(r2[1]).toBe(r2[0])
            expect(r2[2]).toBe(r2[0])
            expect(RModel.parent(r2[0])).toBe(r2)
            expect(RModel.property(r2[0])).toBe('0')
            expect(RModel.secondaryReferences(r2[0])).toEqual([
              { referrer: r2, property: '1' },
              { referrer: r2, property: '2' },
            ])
          })
        })
        describe('removing 1 value and inserting 2 values', ()=>{
          it('should update all the references', ()=>{
            r2.splice(2, 1, o3, o3)
            expect(r2[1]).toBe(r2[0])
            expect(r2[2]).toBe(r2[0])
            expect(r2[3]).toBe(r2[0])
            expect(r2[4]).toBe(r2[0])
            expect(RModel.parent(r2[0])).toBe(r2)
            expect(RModel.property(r2[0])).toBe('0')
            expect(RModel.secondaryReferences(r2[0])).toEqual([
              { referrer: r2, property: '1' },
              { referrer: r2, property: '4' },
              { referrer: r2, property: '2' },
              { referrer: r2, property: '3' },
            ])
          })
        })
        describe('removing 2 values and inserting 1 value', ()=>{
          it('should update all the references', ()=>{
            r2.splice(1, 2, o3)
            expect(r2[1]).toBe(r2[0])
            expect(r2[2]).toBe(r2[0])
            expect(RModel.parent(r2[0])).toBe(r2)
            expect(RModel.property(r2[0])).toBe('0')
            expect(RModel.secondaryReferences(r2[0])).toEqual([
              { referrer: r2, property: '2' },
              { referrer: r2, property: '1' },
            ])
          })
        })
      })
    })
  })
  describe('normalizing splice arguments', ()=>{
    let o = null
    let r = null
    let event = null
    beforeEach(()=>{
      o = [0, 1, 2, 3, 4, 5]
      r = RModel(o)
      event = null
      RModel.addChangeListener(r, e=>{event = e})
    })
    describe('start', ()=>{
      describe('with start within range', ()=>{
        it('should use that start value', ()=>{
          r.splice(2, 0, 'a')
          expect(r).toEqual([0, 1, 'a', 2, 3, 4, 5])
          expect(event.index).toBe(2)
        })
      })
      describe('with start greater than array length', ()=>{
        it('should set start to the array length', ()=>{
          r.splice(8, 0, 'a')
          expect(r).toEqual([0, 1, 2, 3, 4, 5, 'a'])
          expect(event.index).toBe(6)
        })
      })
      describe('with start negative', ()=>{
        describe('with -start less than the array length', ()=>{
          it('should set start to array length + start', ()=>{
            r.splice(-2, 0, 'a')
            expect(r).toEqual([0, 1, 2, 3, 'a', 4, 5])
            expect(event.index).toBe(4)
          })
        })
        describe('with -start greater than the array length', ()=>{
          it('should set start to 0', ()=>{
            r.splice(-8, 0, 'a')
            expect(r).toEqual(['a', 0, 1, 2, 3, 4, 5])
            expect(event.index).toBe(0)
          })
        })
      })
    })
    describe('deleteCount', ()=>{
      describe('not supplied', ()=>{
        it('should delete to the end of the array', ()=>{
          r.splice(2)
          expect(r).toEqual([0, 1])
          expect(event.deleteCount).toBe(4)
        })
      })
      describe('0', ()=>{
        it('should set to 0', ()=>{
          r.splice(2, 0, 'a')
          expect(r).toEqual([0, 1, 'a', 2, 3, 4, 5])
          expect(event.deleteCount).toBe(0)
        })
      })
      describe('negative', ()=>{
        it('should set to 0', ()=>{
          r.splice(2, -1, 'a')
          expect(r).toEqual([0, 1, 'a', 2, 3, 4, 5])
          expect(event.deleteCount).toBe(0)
        })
      })
      describe('greater than length - start', ()=>{
        it('should set to the remainder of the array', ()=>{
          r.splice(2, 8)
          expect(r).toEqual([0, 1])
          expect(event.deleteCount).toBe(4)
        })
      })
    })
  })
})
