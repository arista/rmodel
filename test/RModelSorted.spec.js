const RModel = require('../dist/rmodel.js')

// Tests "RModel.sorted" values

describe('rmodel sorted', ()=>{
  xit('should error if not called on an array', ()=>{
    expect(()=>RModel.sorted(RModel({}))).toThrow(new Error(`RModel.sorted can only be called on an array`))
    expect(()=>RModel.sorted(3)).toThrow(new Error(`RModel.sorted can only be called on an array`))
    expect(()=>RModel.sorted("abc")).toThrow(new Error(`RModel.sorted can only be called on an array`))
    expect(()=>RModel.sorted(true)).toThrow(new Error(`RModel.sorted can only be called on an array`))
  })
  describe('sorting an existing array', ()=>{
    describe('using a single key', ()=>{
      let o = null
      let r = null
      beforeEach(()=>{
        o = [
          {val: 20},
          {val: 15},
          {val: 40},
          {val: 35},
          {val: 5},
        ]
        r = RModel({arr: o})
      })
      xit('should sort the array by that key', ()=>{
        r.sorted = RModel.sorted(r.arr, e=>e.val)
        const expected = [r.arr[4], r.arr[1], r.arr[0], r.arr[3], r.arr[2]]
        expect(r.sorted).toEqual(expected)
      })
      describe('adding elements to the array should sort them in', ()=>{
        xit('push', ()=>{
          r.sorted = RModel.sorted(r.arr, e=>e.val)
          r.arr.push({val: 25})
          const expected = [r.arr[4], r.arr[1], r.arr[0], r.arr[5], r.arr[3], r.arr[2]]
          expect(r.sorted).toEqual(expected)
        })
        xit('push multiple', ()=>{
          r.sorted = RModel.sorted(r.arr, e=>e.val)
          r.arr.push({val: 25}, {val: 24})
          const expected = [r.arr[4], r.arr[1], r.arr[0], r.arr[6], r.arr[5], r.arr[3], r.arr[2]]
          expect(r.sorted).toEqual(expected)
        })
        xit('unshift', ()=>{
          r.sorted = RModel.sorted(r.arr, e=>e.val)
          r.arr.unshift({val: 25})
          const expected = [r.arr[5], r.arr[2], r.arr[1], r.arr[0], r.arr[4], r.arr[3]]
          expect(r.sorted).toEqual(expected)
        })
        xit('splice', ()=>{
          r.sorted = RModel.sorted(r.arr, e=>e.val)
          r.arr.splice(2, 0, {val: 25}, {val: 24})
          const expected = [r.arr[6], r.arr[1], r.arr[0], r.arr[3], r.arr[2], r.arr[5], r.arr[4]]
          expect(r.sorted).toEqual(expected)
        })
      })
      xit('removing an element from the array should remove it', ()=>{
        xit('pop', ()=>{
          r.sorted = RModel.sorted(r.arr, e=>e.val)
          r.arr.pop()
          const expected = [r.arr[1], r.arr[0], r.arr[3], r.arr[2]]
          expect(r.sorted).toEqual(expected)
        })
        xit('shift', ()=>{
          r.sorted = RModel.sorted(r.arr, e=>e.val)
          r.arr.shift()
          const expected = [r.arr[4], r.arr[1], r.arr[3], r.arr[2]]
          expect(r.sorted).toEqual(expected)
        })
        xit('splice', ()=>{
          r.sorted = RModel.sorted(r.arr, e=>e.val)
          r.arr.splice(2, 2)
          const expected = [r.arr[4], r.arr[1], r.arr[0]]
          expect(r.sorted).toEqual(expected)
        })
      })
      xit('changing the key should re-sort the array', ()=>{
        r.sorted = RModel.sorted(r.arr, e=>e.val)
        r.arr[1] = 38
        const expected = [r.arr[4], r.arr[0], r.arr[3], r.arr[1], r.arr[2]]
        expect(r.sorted).toEqual(expected)
      })
      xit('should work correctly even if keys are duplicated', ()=>{
        // FIXME - implement this
      })
    })
    describe('using multiple keys', ()=>{
      // FIXME - implement this
    })
  })
  describe('disconnecting', ()=>{
    // FIXME - implement this
  })
})
