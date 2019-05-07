const RModel = require('../dist/rmodel.js')

// Tests "children" and "descendnats"

describe('rmodel', ()=>{
  describe('children', ()=>{
    it('should list just the child values', ()=>{
      const o = [{v: 1}, {v: 2}, {v: 3, x: {v: 4}}, "a", "b", true, false]
      const r = RModel(o)
      const result = RModel.children(r)
      const expected = [r[0], r[1], r[2]]
      // Sort the array to get it in a predictable order
      result.sort((v1,v2)=>(v1.v < v2.v) ? -1 : ((v2.v > v2.v) ? 1 : 0))
      expect(result).toEqual(expected)
    })
    it('should work on objects', ()=>{
      const o = {v1: {v: 1}, v2: {v: 2}, v3: {v: 3, x: {v: 4}}, v4: "a", v5: "b", v6: true, v7: false}
      const r = RModel(o)
      const result = RModel.children(r)
      const expected = [r.v1, r.v2, r.v3]
      // Sort the array to get it in a predictable order
      result.sort((v1,v2)=>(v1.v < v2.v) ? -1 : ((v2.v > v2.v) ? 1 : 0))
      expect(result).toEqual(expected)
    })
    it('should not include objects that do not have a primary reference from the specified object', ()=>{
      const o = {v1: {v: 1}, v2: {v: 2}, v3: {v: 3, x: {v: 4}}, v4: "a", v5: "b", v6: true, v7: false}
      const r = RModel(o)
      r.v8 = r
      const result = RModel.children(r)
      const expected = [r.v1, r.v2, r.v3]
      // Sort the array to get it in a predictable order
      result.sort((v1,v2)=>(v1.v < v2.v) ? -1 : ((v2.v > v2.v) ? 1 : 0))
      expect(result).toEqual(expected)
    })
  })
  describe('descendants', ()=>{
    it('should list all the descendants', ()=>{
      const o = [{v: 1}, {v: 2}, {v: 3, x: {v: 4}}, "a", "b", true, false]
      const r = RModel(o)
      const result = RModel.descendants(r)
      const expected = [r[0], r[1], r[2], r[2].x]
      // Sort the array to get it in a predictable order
      result.sort((v1,v2)=>(v1.v < v2.v) ? -1 : ((v2.v > v2.v) ? 1 : 0))
      expect(result).toEqual(expected)
    })
    it('should work on objects', ()=>{
      const o = {v1: {v: 1}, v2: {v: 2}, v3: {v: 3, x: {v: 4}}, v4: "a", v5: "b", v6: true, v7: false}
      const r = RModel(o)
      const result = RModel.descendants(r)
      const expected = [r.v1, r.v2, r.v3, r.v3.x]
      // Sort the array to get it in a predictable order
      result.sort((v1,v2)=>(v1.v < v2.v) ? -1 : ((v2.v > v2.v) ? 1 : 0))
      expect(result).toEqual(expected)
    })
    it('should not follow non-primary references', ()=>{
      const o = {v1: {v: 1}, v2: {v: 2}, v3: {v: 3, x: {v: 4}}, v4: "a", v5: "b", v6: true, v7: false}
      const r = RModel(o)
      r.v3.r = r
      r.v3.rr = r.v1
      const result = RModel.descendants(r)
      const expected = [r.v1, r.v2, r.v3, r.v3.x]
      // Sort the array to get it in a predictable order
      result.sort((v1,v2)=>(v1.v < v2.v) ? -1 : ((v2.v > v2.v) ? 1 : 0))
      expect(result).toEqual(expected)
    })
  })
})
