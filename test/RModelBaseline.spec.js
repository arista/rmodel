const RModel = require('../dist/rmodel.js')

// A "baseline" of tests for making sure that values still retain
// their Javascript behaviors after being "RModel-ized"

describe('rmodel', ()=>{
  describe('converting values to rmodels should not change their behavior', ()=>{
    describe('primitive values should end up as the same value', ()=>{
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
    describe('converted object values', ()=>{
      let val = null;
      beforeEach(()=>{
        val = RModel({a: 10, b: "abc", c: {d: true}, e: {}})
      })
      it('should expose the object\'s properties', ()=>{
        expect(val.a).toBe(10)
        expect(val.b).toBe("abc")
        expect(val.c.d).toBe(true)
        expect(val.e).toEqual({})
        expect(val.f).toBe(undefined)
      })
      it('should implement hasOwnProperty', ()=>{
        expect(val.hasOwnProperty('a')).toBe(true)
        expect(val.hasOwnProperty('f')).toBe(false)
        expect(val.hasOwnProperty(null)).toBe(false)
      })
      it('should implement keys', ()=>{
        expect(Object.keys(val).sort()).toEqual(['a', 'b', 'c', 'e'])
      })
      it('should implement getOwnPropertyNames', ()=>{
        expect(Object.getOwnPropertyNames(val).sort()).toEqual(['a', 'b', 'c', 'e'])
      })
      it('should handle delete', ()=>{
        delete val.b
        expect(val.hasOwnProperty('b')).toBe(false)
        expect(val.b).toBe(undefined)
      })
      it('should handle setting new properties', ()=>{
        val.g = -20
        expect(val.g).toBe(-20)
      })
      it('should handle replacing existing properties', ()=>{
        val.b = -20
        expect(val.b).toBe(-20)
      })
      it('should handle iterating through the properties', ()=>{
        const propertyNames = []
        for(propertyName in val) {
          propertyNames.push(propertyName)
        }
        const sortedPropertyNames = propertyNames.sort()
        expect(sortedPropertyNames).toEqual(['a', 'b', 'c', 'e'])
      })
      it('should handle the "in" operator', ()=>{
        expect('a' in val).toBe(true)
        expect('e' in val).toBe(true)
        expect('f' in val).toBe(false)
      })
      // FIXME - "defineProperty"?
      // FIXME - "getOwnPropertyDescriptor"?
      // FIXME - "symbol keys"?
    })
    describe('converted array values', ()=>{
      let val = null;
      beforeEach(()=>{
        val = RModel(['a', 'c', 2, {a: 12}, false])
      })
      it('should expose the array\'s elements', ()=>{
        expect(val.length).toBe(5)
        expect(val[0]).toBe('a')
        expect(val[1]).toBe('c')
        expect(val[2]).toBe(2)
        expect(val[3]).toEqual({a: 12})
        expect(val[4]).toBe(false)
        expect(val[5]).toBe(undefined)
        expect(val[-1]).toBe(undefined)
      })
      it('should handle changing elements', ()=>{
        val[2] = 10
        expect(val[2]).toBe(10)

        val[6] = 8
        expect(val[5]).toBe(undefined)
        expect(val[6]).toBe(8)
        expect(val.length).toBe(7)
      })
      it('should handle deleting elements', ()=>{
        delete val[2]
        expect(val[2]).toBe(undefined)
        expect(val[1]).toBe('c')
        expect(val.length).toBe(5)
      })
      it('should handle iterating over an array\'s indexes', ()=>{
        const indexes = []
        for(const index in val) {
          indexes.push(index)
        }
        expect(indexes).toEqual(['0', '1', '2', '3', '4'])
      })
      it('should handle iterating over an array\'s elements', ()=>{
        const elements = []
        for(const element of val) {
          elements.push(element)
        }
        expect(elements).toEqual(['a', 'c', 2, {a: 12}, false])
      })
      it('should allow strings to substitute for array indices', ()=>{
        expect(val['1']).toBe('c')
        val['1'] = 'abc'
        expect(val[1]).toBe('abc')
        val['7'] = 8
        expect(val.length).toBe(8)
        expect(val).toEqual(['a', 'abc', 2, {a: 12}, false, undefined, undefined, 8])
      })
      it('should allow non-integer properties to be used', ()=>{
        val['abc'] = 15
        val[-3.5] = 'negative'
        val['00'] = 'double zero'
        val['02'] = 'leading zero'
        const indexes = []
        for(const index in val) {
          indexes.push(index)
        }
        indexes.sort()
        expect(indexes).toEqual(['-3.5', '0', '00', '02', '1', '2', '3', '4', 'abc'])
      })
      it('should impelement isArray', ()=>{
        expect(Array.isArray(val)).toBe(true)
        expect(Array.isArray(val[3])).toBe(false)
        expect(Array.isArray('abc')).toBe(false)
      })
      describe('should implement the Array mutator methods', ()=>{
        it('copyWithin', ()=>{
          const val = RModel([1, 2, 3, 4])
          expect(val.copyWithin(2, 0, 2)).toBe(val)
          expect(val).toEqual([1, 2, 1, 2])
          expect(val.copyWithin(0, -3)).toBe(val)
          expect(val).toEqual([2, 1, 2, 2])
        })
        it('fill', ()=>{
          const val = RModel([1, 2, 3, 4])
          expect(val.fill(7, 1, 3)).toBe(val)
          expect(val).toEqual([1, 7, 7, 4])
          expect(val.fill(8, -4, 2)).toBe(val)
          expect(val).toEqual([8, 8, 7, 4])
        })
        it('pop', ()=>{
          expect(val.pop()).toBe(false)
          expect(val).toEqual(['a', 'c', 2, {a: 12}])
          const val2 = RModel([])
          expect(val2.pop()).toBe(undefined)
          expect(val2).toEqual([])
        })
        it('push', ()=>{
          expect(val.push('def')).toBe(6)
          expect(val).toEqual(['a', 'c', 2, {a: 12}, false, 'def'])
        })
        it('push multiple', ()=>{
          expect(val.push('def', 14)).toBe(7)
          expect(val).toEqual(['a', 'c', 2, {a: 12}, false, 'def', 14])
        })
        it('push none', ()=>{
          expect(val.push()).toBe(5)
          expect(val).toEqual(['a', 'c', 2, {a: 12}, false])
        })
        it('reverse', ()=>{
          expect(val.reverse()).toBe(val)
          expect(val).toEqual([false, {a: 12}, 2, 'c', 'a'])
        })
        it('shift', ()=>{
          expect(val.shift()).toBe('a')
          expect(val).toEqual(['c', 2, {a: 12}, false])
        })
        it('sort', ()=>{
          const val = RModel(['b', 'f', 'r', 'e', 'm'])
          expect(val.sort()).toBe(val)
          expect(val).toEqual(['b', 'e', 'f', 'm', 'r'])
        })
        it('splice', ()=>{
          expect(val.splice(2, 2)).toEqual([2, {a: 12}])
          expect(val).toEqual(['a', 'c', false])
          expect(val.splice(1, 1, {x: 12}, ['a', 'b', 'c'])).toEqual(['c'])
          expect(val).toEqual(['a', {x: 12}, ['a', 'b', 'c'], false])
          expect(val.splice(2)).toEqual([['a', 'b', 'c'], false])
          expect(val).toEqual(['a', {x: 12}])
        })
        it('unshift', ()=>{
          expect(val.unshift('def')).toBe(6)
          expect(val).toEqual(['def', 'a', 'c', 2, {a: 12}, false])
        })
        it('unshift multiple', ()=>{
          expect(val.unshift('def', 14)).toBe(7)
          expect(val).toEqual(['def', 14, 'a', 'c', 2, {a: 12}, false])
        })
        it('unshift none', ()=>{
          expect(val.unshift()).toBe(5)
          expect(val).toEqual(['a', 'c', 2, {a: 12}, false])
        })
      })
    })
  })
})
