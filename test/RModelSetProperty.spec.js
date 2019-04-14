const RModel = require('../dist/rmodel.js')

// Tests setting properties on rmodel values

describe('rmodel set property', ()=>{
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
  
  describe('Replace a non-existent value', ()=>{
    describe('with a non-object value', ()=>{
      it('should assign that value to the rmodel and the underlying object', ()=>{
        const r = RModel(o)
        r.x = 'abc'
        expect(r.x).toBe('abc')
        expect(o.x).toBe('abc')
      })
    })
    describe('with an empty object', ()=>{
      describe('that hasn\'t been rmodel-ized', ()=>{
        it('should rmodel-ize the object, set its primary reference, and assign it into the parent', ()=>{
          const r = RModel(o)
          const o2 = {}
          r.x = o2
          const r2 = RModel(o2)
          expect(o.x).toBe(o2)
          expect(r.x).toBe(r2)
          expect(RModel.root(r2)).toBe(r)
          expect(RModel.parent(o2)).toBe(r)
          expect(RModel.parent(r2)).toBe(r)
          expect(RModel.property(o2)).toBe('x')
          expect(RModel.property(r2)).toBe('x')
          expect(RModel.secondaryReferences(r2)).toEqual([])
        })
      })
      describe('that has been rmodel-ized but isn\'t in any tree', ()=>{
        it('should keep the same rmodel, but set its primary reference and assign it into the parent', ()=>{
          const r = RModel(o)
          const o2 = {}
          const r2 = RModel(o2)
          r.x = o2
          expect(RModel(o2)).toBe(r2)
          expect(o.x).toBe(o2)
          expect(r.x).toBe(r2)
          expect(RModel.root(r2)).toBe(r)
          expect(RModel.parent(o2)).toBe(r)
          expect(RModel.parent(r2)).toBe(r)
          expect(RModel.property(o2)).toBe('x')
          expect(RModel.property(r2)).toBe('x')
          expect(RModel.secondaryReferences(r2)).toEqual([])
        })
      })
      describe('that is already in the tree', ()=>{
        it('should retain the original parent, but add a secondary reference', ()=>{
          const r = RModel(o)
          re0 = r.c.e[0]
          r.x = re0
          expect(r.x).toBe(re0)
          expect(o.x).toBe(o.c.e[0])
          expect(RModel.root(re0)).toBe(r)
          expect(RModel.parent(re0)).toBe(r.c.e)
          expect(RModel.property(re0)).toBe('0')
          expect(RModel.secondaryReferences(re0)).toEqual([
            { referrer: r, property: 'x' }
          ])
        })
      })
      describe('that is already in another tree', ()=>{
        it('should throw an exception', ()=>{
          const r = RModel(o)
          const o2 = {
            q: {
            }
          }
          const r2 = RModel(o2)
          expect(()=>{r.x = o2.q}).toThrow(new Error('Cannot set a property to point to an object belonging to a different tree'))
        })
      })
    })
    describe('with an object with children', ()=>{
      let o2 = null
      beforeEach(()=>{
        o2 = {
          i: 100,
          j: 110,
          k: [
            {
              l: 120,
            },
            {
              m: 130,
            }
          ]
        }
      })

      describe('that hasn\'t been rmodel-ized', ()=>{
        describe('whose children haven\'t been rmodel-ized', ()=>{
          it('should rmodel-ize the entire tree', ()=>{
            const r = RModel(o)
            r.x = o2
            const r2 = RModel(o2)
            expect(r.x).toBe(r2)
            // Roots should be set
            expect(RModel.root(r2)).toBe(r)
            expect(RModel.root(r2.k)).toBe(r)
            expect(RModel.root(r2.k[0])).toBe(r)
            expect(RModel.root(r2.k[1])).toBe(r)
            // Parents should be set
            expect(RModel.parent(r2)).toBe(r)
            expect(RModel.parent(r2.k)).toBe(r2)
            expect(RModel.parent(r2.k[0])).toBe(r2.k)
            expect(RModel.parent(r2.k[1])).toBe(r2.k)
            // Properties should be set
            expect(RModel.property(r2)).toBe('x')
            expect(RModel.property(r2.k)).toBe('k')
            expect(RModel.property(r2.k[0])).toBe('0')
            expect(RModel.property(r2.k[1])).toBe('1')
          })
        })
        describe('that has a child already in the tree', ()=>{
          it('should add a secondary reference to that child, but its parent shouldn\'t change', ()=>{
            const r = RModel(o)
            o2.k.push(o.c)
            r.x = o2
            const r2 = RModel(o2)
            expect(r2.k[2]).toBe(r.c)
            expect(RModel.parent(r2.k[2])).toBe(r)
            expect(RModel.property(r2.k[2])).toBe('c')
            expect(RModel.secondaryReferences(r2.k[2])).toEqual([
              { referrer: r2.k, property: '2' }
            ])
          })
        })
        describe('that has a child that is the root of its own tree', ()=>{
          it('should bring in that tree and change its roots', ()=>{
            const r = RModel(o)
            const o3 = {
              q: {
              }
            }
            const r3 = RModel(o3)
            o2.k.push(o3)
            r.x = o2
            r2 = RModel(o2)
            expect(r2.k[2]).toBe(r3)
            expect(RModel.root(r3)).toBe(r)
            expect(RModel.root(r3.q)).toBe(r)
            expect(RModel.parent(r3)).toBe(r2.k)
            expect(RModel.property(r3)).toBe('2')
          })
        })
        describe('that has a child already in another tree', ()=>{
          it('should throw an exception', ()=>{
            const r = RModel(o)
            const o3 = {
              q: {
              }
            }
            const r3 = RModel(o3)
            o2.k.push(o3.q)
            expect(()=>{r.x = o2}).toThrow(new Error('Attempt to add child from another tree'))
          })
        })
      })
      describe('that has been rmodel-ized but isn\'t in any tree', ()=>{
        it('should set the parent and the root of all the new objects', ()=>{
          const r = RModel(o)
          const r2 = RModel(o2)
          r.x = r2
          expect(RModel.parent(r2)).toBe(r)
          expect(RModel.property(r2)).toBe('x')
          expect(RModel.root(r2)).toBe(r)
          expect(RModel.root(r2.k)).toBe(r)
          expect(RModel.root(r2.k[0])).toBe(r)
          expect(RModel.root(r2.k[1])).toBe(r)
        })
      })
      describe('that is already in the tree', ()=>{
        it('should add a secondary reference but not change anything else', ()=>{
          const r = RModel(o)
          r.x = r.c.e[0]
          expect(RModel.root(r.c.e[0])).toBe(r)
          expect(RModel.parent(r.c.e[0])).toBe(r.c.e)
          expect(RModel.property(r.c.e[0])).toBe("0")
          expect(RModel.secondaryReferences(r.c.e[0])).toEqual([
            { referrer: r, property: 'x' }
          ])
        })
      })
      describe('that is already in another tree', ()=>{
        it('should throw an exception', ()=>{
          const r = RModel(o)
          const r2 = RModel(o2)
          expect(()=>{r.x = r2.k}).toThrow(new Error('Cannot set a property to point to an object belonging to a different tree'))
        })
      })
    })
  })
  describe('Replace a non-object value', ()=>{
    describe('with an empty object', ()=>{
      it('should replace the value and set up the new object', ()=>{
        const r = RModel(o)
        const o2 = {}
        r.a = o2
        const r2 = RModel(o2)
        expect(r.a).toBe(r2)
        expect(RModel.parent(r2)).toBe(r)
        expect(RModel.property(r2)).toBe('a')
        expect(RModel.root(r2)).toBe(r)
      })
    })
    describe('with an object with children', ()=>{
      let o2 = null
      beforeEach(()=>{
        o2 = {
          i: 100,
          j: 110,
          k: [
            {
              l: 120,
            },
            {
              m: 130,
            }
          ]
        }
      })
      it('should set up all the objects', ()=>{
        const r = RModel(o)
        r.a = o2
        const r2 = RModel(o2)
        expect(r.a).toBe(r2)
        expect(RModel.parent(r2)).toBe(r)
        expect(RModel.property(r2)).toBe('a')
        expect(RModel.root(r2)).toBe(r)
        expect(RModel.parent(r2.k)).toBe(r2)
        expect(RModel.property(r2.k)).toBe('k')
        expect(RModel.root(r2.k)).toBe(r)
        expect(RModel.parent(r2.k[0])).toBe(r2.k)
        expect(RModel.property(r2.k[0])).toBe('0')
        expect(RModel.root(r2.k[0])).toBe(r)
      })
    })
  })
  describe('Replace an object value', ()=>{
    describe('that is a single object', ()=>{
      describe('with no secondary references', ()=>{
        it('should remove the object', ()=>{
          const r = RModel(o)
          const oo = o.c.e
          expect(RModel.hasRModel(oo)).toBe(true)
          expect(RModel.hasRModel(oo[0])).toBe(true)
          expect(RModel.hasRModel(oo[1])).toBe(true)
          r.c.e = 10
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
          // Replace the object
          const o2 = {}
          r.c.e = o2
          const r2 = RModel(o2)
          expect(r.c.e).toBe(r2)
          expect(RModel.parent(r2)).toBe(r.c)
          expect(RModel.property(r2)).toBe('e')
          expect(RModel.root(r2)).toBe(r)
          // The replaced object should still be in the tree, with the
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
          // Replace the object
          const o2 = {}
          r.c.e = o2
          const r2 = RModel(o2)
          expect(r.c.e).toBe(r2)
          // The replaced object should still be in the tree, with the
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
          // Replace the object
          r.c.e = 10
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
          // Replace the object
          r.c.e = 10
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
          // Replace the object
          const o2 = {}
          r.c.e = o2
          const r2 = RModel(o2)
          expect(r.c.e).toBe(r2)
          // The replaced object should still be in the tree, with the
          // latest secondary reference promoted to primary
          expect(RModel.parent(rr)).toBe(r)
          expect(RModel.property(rr)).toBe('x')
          expect(RModel.root(rr)).toBe(r)
          expect(RModel.secondaryReferences(rr)).toEqual([
            { referrer: rr, property: 'y' },
          ])
        })
      })
      describe('replaced by an object that references it', ()=>{
        it('should not remove the object from the tree, but should change its references', ()=>{
          const r = RModel(o)
          const rr = r.c.e
          const o2 = {
            ee: r.c.e
          }
          // Add some secondary references
          o2.ee2 = rr
          o2.ee3 = rr[0]
          // Replace the object
          r.c.e = o2
          r2 = RModel(o2)

          expect(RModel.parent(rr)).toBe(r2)
          expect(RModel.property(rr)).toBe('ee2')
          expect(RModel.root(rr)).toBe(r)
          expect(RModel.secondaryReferences(rr)).toEqual([
            { referrer: r2, property: 'ee' }
          ])
          expect(RModel.secondaryReferences(rr[0])).toEqual([
            { referrer: r2, property: 'ee3' }
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
          // Replace the value
          r.c.e = 10
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
          // Replace the value
          r.c.e = 10
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
          // Replace the value
          r.c.e = 10
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
            // Replace the value
            r.c.e = 10
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
            // Replace the value
            r.c.e = 10
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
            // Replace the value
            r.c.e = 10
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
            // Replace the value
            r.c.e = 10
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
            // Replace the value
            r.c.e = 10
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
          r.c.e[0] = 10
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
          r.c.e = 10
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
            r.c.e = 10
            expect(RModel.secondaryReferences(r.c)).toEqual([])
          })
        })
      })
      // FIXME - should remove all listeners
      // FIXME - should remove all computed properties
    })
  })

  describe('Adding a reference to the root', ()=>{
    it('should add it as a secondary reference', ()=>{
      const r = RModel(o)
      r.c.e[0].x = r
      expect(RModel.root(r)).toBe(r)
      expect(RModel.parent(r)).toBe(null)
      expect(RModel.property(r)).toBe(null)
      expect(RModel.secondaryReferences(r)).toEqual([
        { referrer: r.c.e[0], property: 'x' }
      ])
    })
  })
})


