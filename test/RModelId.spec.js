const RModel = require('../dist/rmodel.js')

// Tests the behavior of id's on RModels

describe('RModel id\'s', ()=>{
  let r = null
  let ra = null
  let rb = null
  beforeEach(()=>{
    r = RModel({ a: {}, b: {} })
    ra = r.a
    rb = r.b
  })
  describe('setId', ()=>{
    describe('on an object in a tree of objects', ()=>{
      describe('with no id', ()=>{
        beforeEach(()=>{
          RModel.setId(ra, 'a')
        })
        describe('getId on that object', ()=>{
          it('should return the assigned id', ()=>{
            expect(RModel.getId(ra)).toEqual('a')
          })
        })
        describe('findById with that id', ()=>{
          it('should return the object', ()=>{
            expect(RModel.findById(r, 'a')).toBe(ra)
          })
        })
      })
      describe('on an object with an id', ()=>{
        beforeEach(()=>{
          RModel.setId(ra, 'aold')
          RModel.setId(ra, 'a')
        })
        describe('getId', ()=>{
          it('should return the new id', ()=>{
            expect(RModel.getId(ra)).toEqual('a')
          })
        })
        describe('findById with the old id', ()=>{
          it('should return null', ()=>{
            expect(RModel.findById(r, 'aold')).toBe(null)
          })
        })
        describe('findById with the new id', ()=>{
          it('should return the object', ()=>{
            expect(RModel.findById(r, 'a')).toBe(ra)
          })
        })
      })
      describe('setId with a different id on a second object in the same tree', ()=>{
        beforeEach(()=>{
          RModel.setId(ra, 'a')
          RModel.setId(rb, 'b')
        })
        describe('findById with the first id', ()=>{
          it('should return the first object', ()=>{
            expect(RModel.findById(r, 'a')).toBe(ra)
          })
        })
        describe('findById with the second id', ()=>{
          it('should return the second object', ()=>{
            expect(RModel.findById(r, 'b')).toBe(rb)
          })
        })
      })
      describe('setId with the same id on a second object in the same tree', ()=>{
        it('should throw an exception', ()=>{
          RModel.setId(ra, 'a')
          expect(()=>{RModel.setId(rb, 'a')}).toThrow(new Error('Attempt to set or add two objects with the same id \'a\' in the same tree'))
        })
      })
      describe('setId with the same id on an object in a different tree', ()=>{
        it('should set the id without error', ()=>{
          const r2 = RModel({ a: {}, b: {} })
          RModel.setId(r.a, 'a')
          RModel.setId(r2.a, 'a')
        })
      })
    })
  })
  describe('getId', ()=>{
    describe('on an object with no id', ()=>{
      it('should return null', ()=>{
        expect(RModel.getId(ra)).toBe(null)
      })
    })
    describe('on an object with an id assigned', ()=>{
      beforeEach(()=>{
        RModel.setId(ra, 'a')
      })
      it('should return the assigned id', ()=>{
        expect(RModel.getId(ra)).toBe('a')
      })
      describe('on an object in the same tree with a different id assigned', ()=>{
        it('should return the assigned id', ()=>{
          RModel.setId(rb, 'b')
          expect(RModel.getId(ra)).toBe('a')
          expect(RModel.getId(rb)).toBe('b')
        })
      })
      describe('on an object in a different tree with the same id assigned', ()=>{
        it('should return the assigned id', ()=>{
          const r2 = RModel({a: {}, b: {}})
          RModel.setId(r2.a, 'a')
          expect(RModel.getId(ra)).toBe('a')
          expect(RModel.getId(r2.a)).toBe('a')
        })
      })
      describe('on an object in a different tree with a different id assigned', ()=>{
        it('should return the assigned id', ()=>{
          const r2 = RModel({a: {}, b: {}})
          RModel.setId(r2.b, 'b')
          expect(RModel.getId(ra)).toBe('a')
          expect(RModel.getId(r2.b)).toBe('b')
        })
      })
    })
  })
  describe('deleteId', ()=>{
    beforeEach(()=>{
      RModel.setId(ra, 'a')
    })
    describe('on an object with an id', ()=>{
      beforeEach(()=>{
        RModel.deleteId(ra)
      })
      describe('getId', ()=>{
        it('should return null', ()=>{
          expect(RModel.getId(ra)).toBe(null)
        })
      })
      describe('findById with the old id', ()=>{
        it('should return null', ()=>{
          expect(RModel.findById(r, 'a')).toBe(null)
        })
      })
      describe('setId with a new id', ()=>{
        beforeEach(()=>{
          RModel.setId(ra, 'a2')
        })
        describe('getId', ()=>{
          it('should return the new id', ()=>{
            expect(RModel.getId(ra)).toBe('a2')
          })
        })
        describe('findById with the old id', ()=>{
          it('should return null', ()=>{
            expect(RModel.findById(r, 'a')).toBe(null)
          })
        })
        describe('findById with the new id', ()=>{
          it('should return the object', ()=>{
            expect(RModel.findById(r, 'a2')).toBe(ra)
          })
        })
      })
      describe('setId on a different object in the tree with the old id', ()=>{
        beforeEach(()=>{
          RModel.setId(rb, 'a')
        })
        describe('getId', ()=>{
          it('should return the old id', ()=>{
            expect(RModel.getId(rb)).toBe('a')
          })
        })
        describe('findById with the old id', ()=>{
          it('should return the second object', ()=>{
            expect(RModel.findById(r, 'a')).toBe(rb)
          })
        })
      })
    })
    describe('on an object without an id', ()=>{
      beforeEach(()=>{
        RModel.deleteId(rb)
      })
      describe('getId', ()=>{
        it('should return null', ()=>{
          expect(RModel.getId(rb)).toBe(null)
        })
      })
    })
  })
  describe('findById', ()=>{
    beforeEach(()=>{
      RModel.setId(r, 'r')
      RModel.setId(ra, 'a')
      RModel.setId(rb, 'b')
    })
    describe('called on the root', ()=>{
      describe('for an id elsewhere in the tree', ()=>{
        it('should return that object', ()=>{
          expect(RModel.findById(r, 'a')).toBe(ra)
          expect(RModel.findById(r, 'b')).toBe(rb)
        })
      })
      describe('for an id on the root', ()=>{
        it('should return that object', ()=>{
          expect(RModel.findById(r, 'r')).toBe(r)
        })
      })
      describe('for an id not in the tree', ()=>{
        it('should return null', ()=>{
          expect(RModel.findById(r, 'c')).toBe(null)
        })
      })
    })
    describe('called on a non-root', ()=>{
      describe('for an id elsewhere in the tree', ()=>{
        it('should return that object', ()=>{
          expect(RModel.findById(ra, 'a')).toBe(ra)
          expect(RModel.findById(ra, 'b')).toBe(rb)
        })
      })
      describe('for an id on the root', ()=>{
        it('should return that object', ()=>{
          expect(RModel.findById(ra, 'r')).toBe(r)
        })
      })
      describe('for an id not in the tree', ()=>{
        it('should return null', ()=>{
          expect(RModel.findById(ra, 'c')).toBe(null)
        })
      })
    })
  })
  describe('removing objects from a tree', ()=>{
    let rc = null
    let rc0 = null
    let rc1 = null
    beforeEach(()=>{
      r.c = [{}, {}]
      rc = r.c
      rc0 = rc[0]
      rc1 = rc[1]
      RModel.setId(ra, 'a')
      RModel.setId(rb, 'b')
      RModel.setId(rc, 'c')
      RModel.setId(rc0, 'c0')
      RModel.setId(rc1, 'c1')
    })
    describe('before removing', ()=>{
      it('should find the objects by id', ()=>{
        expect(RModel.findById(r, 'a')).toBe(ra)
        expect(RModel.findById(r, 'b')).toBe(rb)
        expect(RModel.findById(r, 'c')).toBe(rc)
        expect(RModel.findById(r, 'c0')).toBe(rc[0])
        expect(RModel.findById(r, 'c1')).toBe(rc[1])
      })
    })
    describe('after removing', ()=>{
      beforeEach(()=>{
        r.c = {}
      })
      describe('findById on any removed id\'s', ()=>{
        it('should return null', ()=>{
          expect(RModel.findById(r, 'a')).toBe(ra)
          expect(RModel.findById(r, 'b')).toBe(rb)
          expect(RModel.findById(r, 'c')).toBe(null)
          expect(RModel.findById(r, 'c0')).toBe(null)
          expect(RModel.findById(r, 'c1')).toBe(null)
        })
      })
      describe('setId on objects remaining in the tree using any removed id\'s', ()=>{
        it('should set those id\'s without error', ()=>{
          RModel.setId(r.c, 'c')
          expect(RModel.findById(r, 'c')).toBe(r.c)
        })
      })
      describe('getId on the removed objects', ()=>{
        it('should return the old id\'s', ()=>{
          expect(RModel.getId(rc)).toBe('c')
          expect(RModel.getId(rc0)).toBe('c0')
          expect(RModel.getId(rc1)).toBe('c1')
        })
      })
      describe('findById on the removed objects', ()=>{
        it('should throw an exception', ()=>{
          expect(()=>{RModel.findById(rc, 'c')}).toThrow(new Error('InvalidArgument: Expected an RModel-enabled object value'))
        })
      })
      describe('adding the object to another tree', ()=>{
        let r2 = null
        beforeEach(()=>{
          r2 = RModel({c: rc})
        })
        it('should be a different object', ()=>{
          expect(rc).not.toBe(r2.c)
        })
        it('should effectively have no id', ()=>{
          expect(RModel.getId(rc)).toBe(null)
          expect(RModel.getId(r2.c)).toBe(null)
          expect(RModel.findById(r2, 'c')).toBe(null)
        })
        describe('then setting its id', ()=>{
          beforeEach(()=>{
            RModel.setId(r2.c, 'cc')
          })
          it('should effectively change the id on all nodes', ()=>{
            expect(RModel.getId(rc)).toBe('cc')
            expect(RModel.getId(r2.c)).toBe('cc')
            expect(RModel.findById(r2, 'cc')).toBe(r2.c)
          })
        })
      })
    })
  })
  describe('adding objects to a tree', ()=>{
    let r2 = null
    let ra2 = null
    let rb2 = null
    beforeEach(()=>{
      RModel.setId(r, 'r')
      RModel.setId(ra, 'ra')
      RModel.setId(rb, 'rb')

      r2 = RModel({a2: {}, b2: {}})
      ra2 = r2.a2
      rb2 = r2.b2
      RModel.setId(r2, 'r2')
      RModel.setId(ra2, 'ra2')
      RModel.setId(rb2, 'rb2')
    })
    describe('with objects in the new tree with id\'s', ()=>{
      describe('that do not overlap existing id\'s in the destination tree', ()=>{
        beforeEach(()=>{
          r.r2 = r2
        })
        describe('findById on the old tree', ()=>{
          it('should find objects from both the old tree and new tree', ()=>{
            expect(RModel.findById(r, 'r')).toBe(r)
            expect(RModel.findById(r, 'ra')).toBe(ra)
            expect(RModel.findById(r, 'rb')).toBe(rb)
            expect(RModel.findById(r, 'r2')).toBe(r2)
            expect(RModel.findById(r, 'ra2')).toBe(ra2)
            expect(RModel.findById(r, 'rb2')).toBe(rb2)
          })
        })
        describe('findById on the new tree', ()=>{
          it('should find objects from both the old tree and new tree', ()=>{
            expect(RModel.findById(r2, 'r')).toBe(r)
            expect(RModel.findById(r2, 'ra')).toBe(ra)
            expect(RModel.findById(r2, 'rb')).toBe(rb)
            expect(RModel.findById(r2, 'r2')).toBe(r2)
            expect(RModel.findById(r2, 'ra2')).toBe(ra2)
            expect(RModel.findById(r2, 'rb2')).toBe(rb2)
          })
        })
        describe('deleting an id from the new tree', ()=>{
          beforeEach(()=>{
            delete r.r2.a2
          })
          describe('findById on the old tree', ()=>{
            it('should return null', ()=>{
              expect(RModel.findById(r, 'ra2')).toBe(null)
            })
          })
          describe('findById on the new tree', ()=>{
            it('should return null', ()=>{
              expect(RModel.findById(r2, 'ra2')).toBe(null)
            })
          })
        })
      })
      describe('that overlap existing id\'s in the destination tree', ()=>{
        beforeEach(()=>{
          RModel.setId(ra2, 'ra')
        })
        it('should throw an exception', ()=>{
          expect(()=>{r.r2 = r2}).toThrow(new Error('Attempt to add on object with the same id \'ra\' as an object already in the tree'))
        })
      })
    })
  })
})
