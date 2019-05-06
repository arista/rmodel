const RModel = require('../dist/rmodel.js')

// Tests the "path" function on RModels

describe('path and pathStr', ()=>{
  it('should return the correct values', ()=>{
    const o = {a: 10, b: [{x:10}, {x:20}, {x:30}, {y: {z: 10}}], c: {d: {e: {f: 20}}}}
    const r = RModel(o)

    expect(RModel.path(r)).toEqual([])
    expect(RModel.path(r.b)).toEqual(["b"])
    expect(RModel.path(r.b[2])).toEqual(["b", "2"])
    expect(RModel.path(r.b[3].y)).toEqual(["b", "3", "y"])
    expect(RModel.path(r.c.d.e)).toEqual(["c", "d", "e"])

    expect(RModel.pathStr(r)).toEqual("<root>")
    expect(RModel.pathStr(r.b)).toEqual("<root>.b")
    expect(RModel.pathStr(r.b[2])).toEqual("<root>.b[2]")
    expect(RModel.pathStr(r.b[3].y)).toEqual("<root>.b[3].y")
    expect(RModel.pathStr(r.c.d.e)).toEqual("<root>.c.d.e")

    // It should only go through primary references
    r.b.push(r.c)
    expect(RModel.path(r.b[4].d.e)).toEqual(["c", "d", "e"])
    expect(RModel.pathStr(r.b[4].d.e)).toEqual("<root>.c.d.e")
  })

  it('should allow a different root to be specified for pathStr', ()=>{
    const o = {a: 10, b: [{x:10}, {x:20}, {x:30}, {y: {z: 10}}], c: {d: {e: {f: 20}}}}
    const r = RModel(o)

    expect(RModel.pathStr(r, "r")).toEqual("r")
    expect(RModel.pathStr(r.b, "r")).toEqual("r.b")
    expect(RModel.pathStr(r.b[2], "r")).toEqual("r.b[2]")
  })

  it('should handle non-JS identifiers in pathStr', ()=>{
    const o = {a: 10, b: [{x:10}, {x:20}, {x:30}, {y: {z: 10}}], c: {d: {e: {f: 20}}}}
    const r = RModel(o)
    const rr = RModel({x:20})
    r["abc def \n\r\t\v\b\u0232"] = rr

    expect(RModel.pathStr(rr)).toEqual("<root>[\"abc def \\n\\r\\t\\v\\b\\u0232\"]")
  })
})
