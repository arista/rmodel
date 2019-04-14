const RModel = require('../dist/rmodel.js')

// Tests deleting properties from rmodel values

describe('rmodel delete property', ()=>{
  let o = null;
  beforeEach(()=>{
    o = {
      a: 10,
      b: 20,
      c: {
        d: 30,
        e: [
          {
            f: 40,
          },
          {
            g: 50,
          },
        ]
      },
    }
  })
  
  describe('Delete a non-existent value', ()=>{
    it('should delete the value from the underlying object', ()=>{
      const r = RModel(o)
      delete r.x
      expect(r.hasOwnProperty('x')).toBe(false)
      expect(o.hasOwnProperty('x')).toBe(false)
    })
  })
  describe('Delete a non-object value', ()=>{
    it('should delete the value from the underlying object', ()=>{
      const r = RModel(o)
      delete r.a
      expect(r.hasOwnProperty('a')).toBe(false)
      expect(o.hasOwnProperty('a')).toBe(false)
    })
  })
  describe('Delete an object value', ()=>{
    describe('that is a single object', ()=>{
      describe('with no secondary references', ()=>{
        it('should remove the object', ()=>{
          const r = RModel(o)
          const oo = o.c.e
          expect(RModel.hasRModel(oo)).toBe(true)
          expect(RModel.hasRModel(oo[0])).toBe(true)
          expect(RModel.hasRModel(oo[1])).toBe(true)
          delete r.c.e
          expect(RModel.hasRModel(oo)).toBe(false)
          expect(RModel.hasRModel(oo[0])).toBe(false)
          expect(RModel.hasRModel(oo[1])).toBe(false)
        })
      })
      describe('with one secondary reference from outside the object', ()=>{
        it('should promote the secondary reference to be the primary', ()=>{
          const r = RModel(o)
          const rr = r.c.e
          expect(RModel.parent(rr)).toBe(r.c)
          expect(RModel.property(rr)).toBe('e')
          expect(RModel.root(rr)).toBe(r)
          expect(RModel.secondaryReferences(rr)).toEqual([])
          // Set up the secondary reference
          r.x = rr
          expect(RModel.secondaryReferences(rr)).toEqual([
            { referrer: r, property: 'x' }
          ])
          // delete the object
          delete r.c.e
          // The removed object should still be in the tree, with the
          // secondary reference promoted to primary
          expect(RModel.parent(rr)).toBe(r)
          expect(RModel.property(rr)).toBe('x')
          expect(RModel.root(rr)).toBe(r)
          expect(RModel.secondaryReferences(rr)).toEqual([])
        })
      })
      describe('with multiple secondary references from outside the object', ()=>{
        it('should promote the most recent reference to primary', ()=>{
          const r = RModel(o)
          const rr = r.c.e
          // Set up the secondary references
          r.y = rr
          r.x = rr
          expect(RModel.secondaryReferences(rr)).toEqual([
            { referrer: r, property: 'y' },
            { referrer: r, property: 'x' }
          ])
          // Delete the object
          delete r.c.e
          // The removed object should still be in the tree, with the
          // latest secondary reference promoted to primary
          expect(RModel.parent(rr)).toBe(r)
          expect(RModel.property(rr)).toBe('x')
          expect(RModel.root(rr)).toBe(r)
          expect(RModel.secondaryReferences(rr)).toEqual([
            { referrer: r, property: 'y' }
          ])
        })
      })
      describe('with one secondary reference from within the object', ()=>{
        it('should remove the object from RModel', ()=>{
          const r = RModel(o)
          const rr = r.c.e
          const oo = o.c.e
          expect(RModel.hasRModel(rr)).toBe(true)
          expect(RModel.hasRModel(oo)).toBe(true)
          // Create the secondary reference
          r.c.e[0].x = rr
          // Delete the object
          delete r.c.e
          // The object should no longer be managed by RModel
          expect(RModel.hasRModel(rr)).toBe(false)
          expect(RModel.hasRModel(oo)).toBe(false)
          // But it still should have the old values
          expect(oo[0].f).toBe(40)
          expect(oo[0].x).toBe(oo)
          expect(oo[1].g).toBe(50)
        })
      })
      describe('with multiple secondary references from within the object', ()=>{
        it('should remove the object from RModel', ()=>{
          const r = RModel(o)
          const rr = r.c.e
          const oo = o.c.e
          expect(RModel.hasRModel(rr)).toBe(true)
          expect(RModel.hasRModel(oo)).toBe(true)
          // Create the secondary references
          r.c.e[0].x = rr
          r.c.e[0].y = rr
          // Delete the object
          delete r.c.e
          // The object should no longer be managed by RModel
          expect(RModel.hasRModel(rr)).toBe(false)
          expect(RModel.hasRModel(oo)).toBe(false)
          // But it still should have the old values
          expect(oo[0].f).toBe(40)
          expect(oo[0].x).toBe(oo)
          expect(oo[1].g).toBe(50)
        })
      })
      describe('with a mixture of secondary references from within and without the object', ()=>{
        it('promote the secondary reference from outside the object', ()=>{
          const r = RModel(o)
          const rr = r.c.e
          // Set up the secondary references
          r.x = rr
          rr.y = rr
          expect(RModel.secondaryReferences(rr)).toEqual([
            { referrer: r, property: 'x' },
            { referrer: rr, property: 'y' }
          ])
          // Delete the object
          delete r.c.e
          // The removed object should still be in the tree, with the
          // latest secondary reference promoted to primary
          expect(RModel.parent(rr)).toBe(r)
          expect(RModel.property(rr)).toBe('x')
          expect(RModel.root(rr)).toBe(r)
          expect(RModel.secondaryReferences(rr)).toEqual([
            { referrer: rr, property: 'y' },
          ])
        })
      })
    })
    describe('that is a tree of objects', ()=>{
      describe('none of which have any secondary references', ()=>{
        it('should remove all of the objects', ()=>{
          const r = RModel(o)
          const rr = r.c.e
          const oo = o.c.e
          expect(RModel.hasRModel(oo)).toBe(true)
          expect(RModel.hasRModel(oo[0])).toBe(true)
          expect(RModel.hasRModel(oo[1])).toBe(true)
          // Delete the value
          delete r.c.e
          expect(RModel.hasRModel(oo)).toBe(false)
          expect(RModel.hasRModel(oo[0])).toBe(false)
          expect(RModel.hasRModel(oo[1])).toBe(false)
        })
      })
      describe('one of which has a secondary reference from within that object tree', ()=>{
        it('should remove all of the objects', ()=>{
          const r = RModel(o)
          const rr = r.c.e
          const oo = o.c.e
          // Add the secondary reference
          rr[1].x = rr[0]

          expect(RModel.secondaryReferences(rr[0])).toEqual([
            { referrer: rr[1], property: 'x' }
          ])
          // Delete the value
          delete r.c.e
          expect(RModel.hasRModel(oo)).toBe(false)
          expect(RModel.hasRModel(oo[0])).toBe(false)
          expect(RModel.hasRModel(oo[1])).toBe(false)
        })
      })
      describe('one of which has a secondary reference from outside that object tree', ()=>{
        it('should keep that object in the tree', ()=>{
          const r = RModel(o)
          const rr = r.c.e
          const oo = o.c.e
          // Add the secondary reference
          r.x = rr[0]
          // Delete the value
          delete r.c.e
          expect(RModel.hasRModel(oo)).toBe(false)
          expect(RModel.hasRModel(oo[1])).toBe(false)
          expect(RModel.hasRModel(oo[0])).toBe(true)
          // oo[0] is still in the tree
          expect(RModel.parent(oo[0])).toBe(r)
          expect(RModel.property(oo[0])).toBe('x')
          expect(RModel.root(oo[0])).toBe(r)
          expect(RModel.secondaryReferences(oo[0])).toEqual([])
        })
        describe('and another secondary reference from outside that object tree', ()=>{
          it('should keep that object in the tree', ()=>{
            const r = RModel(o)
            const rr = r.c.e
            const oo = o.c.e
            // Add the secondary references
            r.x = rr[0]
            r.y = rr[0]
            // Delete the value
            delete r.c.e
            expect(RModel.hasRModel(oo)).toBe(false)
            expect(RModel.hasRModel(oo[1])).toBe(false)
            expect(RModel.hasRModel(oo[0])).toBe(true)
            // oo[0] is still in the tree
            expect(RModel.parent(oo[0])).toBe(r)
            expect(RModel.property(oo[0])).toBe('y')
            expect(RModel.root(oo[0])).toBe(r)
            expect(RModel.secondaryReferences(oo[0])).toEqual([
              { referrer: r, property: 'x' }
            ])
          })
        })
        describe('and another secondary reference from within the tree from a node being removed', ()=>{
          it('should keep that object in the tree, but remove that secondary reference', ()=>{
            const r = RModel(o)
            const rr = r.c.e
            const oo = o.c.e
            // Add the secondary references
            r.x = rr[0]
            rr[1].y = rr[0]
            // Delete the value
            delete r.c.e
            expect(RModel.hasRModel(oo)).toBe(false)
            expect(RModel.hasRModel(oo[1])).toBe(false)
            expect(RModel.hasRModel(oo[0])).toBe(true)
            // oo[0] is still in the tree
            expect(RModel.parent(oo[0])).toBe(r)
            expect(RModel.property(oo[0])).toBe('x')
            expect(RModel.root(oo[0])).toBe(r)
            expect(RModel.secondaryReferences(oo[0])).toEqual([])
          })
        })
        describe('and references another object in that tree with a secondary reference', ()=>{
          it('should keep both objects in the tree', ()=>{
            const r = RModel(o)
            const rr = r.c.e
            const rr0 = rr[0]
            const oo = o.c.e
            // Add the secondary references
            r.x = rr[0]
            rr[0].y = rr[1]
            // Delete the value
            delete r.c.e
            expect(RModel.hasRModel(oo)).toBe(false)
            expect(RModel.hasRModel(oo[1])).toBe(true)
            expect(RModel.hasRModel(oo[0])).toBe(true)
            // oo[0] and oo[1] are still in the tree
            expect(RModel.parent(oo[0])).toBe(r)
            expect(RModel.property(oo[0])).toBe('x')
            expect(RModel.root(oo[0])).toBe(r)
            expect(RModel.secondaryReferences(oo[0])).toEqual([])
            // oo[0] becomes the parent of oo[1]
            expect(RModel.parent(oo[1])).toBe(rr0)
            expect(RModel.property(oo[1])).toBe('y')
            expect(RModel.root(oo[1])).toBe(r)
            expect(RModel.secondaryReferences(oo[1])).toEqual([])
          })
        })
        describe('and references another object in that tree with a primary reference', ()=>{
          it('should keep both objects in the tree', ()=>{
            const r = RModel(o)
            const rr = r.c.e
            const rr0 = rr[0]
            const oo = o.c.e
            // Add the primary and secondary references
            const o2 = {
              h: 'abc'
            }
            r.x = rr[0]
            rr[0].y = o2
            // Delete the value
            delete r.c.e
            expect(RModel.hasRModel(oo)).toBe(false)
            expect(RModel.hasRModel(oo[1])).toBe(false)
            expect(RModel.hasRModel(oo[0])).toBe(true)
            expect(RModel.hasRModel(o2)).toBe(true)
            // oo[0] and o2 are still in the tree
            expect(RModel.parent(oo[0])).toBe(r)
            expect(RModel.property(oo[0])).toBe('x')
            expect(RModel.root(oo[0])).toBe(r)
            expect(RModel.secondaryReferences(oo[0])).toEqual([])
            // oo[0] is still the parent of o2
            expect(RModel.parent(o2)).toBe(rr0)
            expect(RModel.property(o2)).toBe('y')
            expect(RModel.root(o2)).toBe(r)
            expect(RModel.secondaryReferences(o2)).toEqual([])
          })
        })
        describe('and references the root of that tree with a secondary reference', ()=>{
          it('should keep all objects in the tree', ()=>{
            const r = RModel(o)
            const rr = r.c.e
            const oo = o.c.e
            // Add the references
            r.x = rr[0]
            rr[0].y = rr
            // Delete the value
            delete r.c.e
            expect(RModel.hasRModel(oo)).toBe(true)
            expect(RModel.hasRModel(oo[1])).toBe(true)
            expect(RModel.hasRModel(oo[0])).toBe(true)
            // All objects are still in the tree, but the topology
            // will be changed - oo[0] will now become the root
            expect(RModel.parent(oo[0])).toBe(r)
            expect(RModel.property(oo[0])).toBe('x')
            expect(RModel.root(oo[0])).toBe(r)
            expect(RModel.secondaryReferences(oo[0])).toEqual([])

            expect(RModel.parent(oo)).toBe(rr[0])
            expect(RModel.property(oo)).toBe('y')
            expect(RModel.root(oo)).toBe(r)
            expect(RModel.secondaryReferences(oo)).toEqual([])

            expect(RModel.parent(oo[1])).toBe(rr)
            expect(RModel.property(oo[1])).toBe('1')
            expect(RModel.root(oo[1])).toBe(r)
            expect(RModel.secondaryReferences(oo[0])).toEqual([])
          })
        })
      })
    })
    describe('resulting in removing the object', ()=>{
      describe('that has secondary references to objects still in the tree', ()=>{
        it('should remove all of its secondary references', ()=>{
          const r = RModel(o)
          r.c.e[0].x = r.c
          expect(RModel.secondaryReferences(r.c)).toEqual([
            { referrer: r.c.e[0], property: 'x' }
          ])
          delete r.c.e[0]
          expect(RModel.secondaryReferences(r.c)).toEqual([])
        })
      })
      describe('that has descendants also being removed', ()=>{
        it('should remove the descendants no longer referenced', ()=>{
          const r = RModel(o)
          const oo = o.c.e
          expect(RModel.hasRModel(oo)).toBe(true)
          expect(RModel.hasRModel(oo[0])).toBe(true)
          expect(RModel.hasRModel(oo[1])).toBe(true)
          delete r.c.e
          expect(RModel.hasRModel(oo)).toBe(false)
          expect(RModel.hasRModel(oo[0])).toBe(false)
          expect(RModel.hasRModel(oo[1])).toBe(false)
        })
        describe('with secondary references to objects still in the tree', ()=>{
          it('should remove those secondary references', ()=>{
            const r = RModel(o)
            const oo = o.c.e
            r.c.e[0].x = r.c
            expect(RModel.secondaryReferences(r.c)).toEqual([
              { referrer: r.c.e[0], property: 'x' }
            ])
            delete r.c.e
            expect(RModel.secondaryReferences(r.c)).toEqual([])
          })
        })
      })
      // FIXME - should remove all computed properties
    })
  })
  describe('Delete an object value that results in the object being removed from the tree', ()=>{
    it('should no longer trigger change listeners', ()=>{
      const r = RModel(o)
      const rce0 = r.c.e[0]
      let changeEvent = null
      const changeListener = (e)=>{changeEvent = e}
      RModel.addChangeListener(rce0, changeListener)
      rce0.f = 30
      expect(changeEvent).not.toBe(null)
      changeEvent = null
      delete r.c

      // After delete, the listeners no longer get triggered
      rce0.f = 20
      expect(changeEvent).toBe(null)

      // Even after becoming a new RModel, the listeners no longer get triggered
      const rr2 = RModel(rce0)
      rr2.f = 10
      expect(changeEvent).toBe(null)
    })
    // FIXME - if in the future we add other kinds of listeners
  })
})
