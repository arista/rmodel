const RModel = require('../dist/rmodel.js')

// Tests "raw" values

describe('rmodel raw', ()=>{
  it('wrapping with an RModel should just return the value', ()=>{
    const o = {a: 13}
    expect(RModel.raw(o)).toBe(o)
    const o2 = "abc"
    expect(RModel.raw(o2)).toBe(o2)
  })
  it('adding it to an RModel should not wrap the value', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({})
    r.o1 = o1
    r.o2 = o2
    expect(r.o1).toBe(o1)
    expect(r.o2).not.toBe(o2)
  })
  it('constructing an RModel with it should not wrap the value', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    expect(r.o1).toBe(o1)
    expect(r.o2).not.toBe(o2)
  })
  it('should be allowed to be added to multiple RModel trees', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r1 = RModel({})
    const r2 = RModel({})

    r1.o1 = o1
    r1.o2 = o2

    expect(()=>r2.o1 = o1).not.toThrow()
    expect(()=>r2.o2 = o2).toThrow()
  })
  it('making changes to it should not result in change events', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    const events = []
    RModel.addChangeListener(r, e=>events.push(e), {source: "descendants"})
    r.o2.a = 12
    expect(events.length).toEqual(1)
    r.o1.a = 14
    expect(events.length).toEqual(1)
  })
  it('overwriting it with a new value should not report it in the removed array', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    const events = []
    RModel.addChangeListener(r, e=>events.push(e), {source: "descendants"})
    r.o2 = "a"
    expect(events[0]).toEqual({
      type: 'PropertyChange',
      target: r,
      property: 'o2',
      oldValue: RModel(o2),
      newValue: 'a',
      hadOwnProperty: true,
      hasOwnProperty: true,
      added: null,
      removed: [RModel(o2)],
    })
    r.o1 = "a"
    expect(events[1]).toEqual({
      type: 'PropertyChange',
      target: r,
      property: 'o1',
      oldValue: o1,
      newValue: 'a',
      hadOwnProperty: true,
      hasOwnProperty: true,
      added: null,
      removed: null,
    })
  })
  it('setting it on a property should not report it in the added array', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({})
    const events = []
    RModel.addChangeListener(r, e=>events.push(e), {source: "descendants"})
    r.o1 = o1
    expect(events[0]).toEqual({
      type: 'PropertyChange',
      target: r,
      property: 'o1',
      oldValue: undefined,
      newValue: o1,
      hadOwnProperty: false,
      hasOwnProperty: true,
      added: null,
      removed: null,
    })
    r.o2 = o2
    expect(events[1]).toEqual({
      type: 'PropertyChange',
      target: r,
      property: 'o2',
      oldValue: undefined,
      newValue: RModel(o2),
      hadOwnProperty: false,
      hasOwnProperty: true,
      added: [RModel(o2)],
      removed: null,
    })
  })
  it('deleting it as a property value not report it in the removed array', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    const events = []
    RModel.addChangeListener(r, e=>events.push(e), {source: "descendants"})
    delete r.o1
    expect(events[0]).toEqual({
      type: 'PropertyChange',
      target: r,
      property: 'o1',
      oldValue: o1,
      newValue: undefined,
      hadOwnProperty: true,
      hasOwnProperty: false,
      added: null,
      removed: null,
    })
    delete r.o2
    expect(events[1]).toEqual({
      type: 'PropertyChange',
      target: r,
      property: 'o2',
      oldValue: RModel(o2),
      newValue: undefined,
      hadOwnProperty: true,
      hasOwnProperty: false,
      added: null,
      removed: [RModel(o2)],
    })
  })
  it('immutable values should just return a reference to the value, not an immutable copy', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    const values = []
    values.push(RModel.followImmutable(r, e=>values.push(e.newValue)))

    let i = values[0]
    expect(i).toEqual({o1: {a: 13}, o2: {a: 14}})
    expect(i.o1).toBe(o1)
    expect(i.o2).not.toBe(o2)

    r.o1.a = 8
    r.o2.a = 16
    RModel.flushBufferedCalls()
    i = values[1]
    expect(i).toEqual({o1: {a: 8}, o2: {a: 16}})
    expect(i.o1).toBe(o1)
    expect(i.o2).not.toBe(o2)
  })
  it('should not be reported in a children array', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    expect(RModel.children(r)).toEqual([RModel(o2)])
  })
  it('should not be reported in a descendants array', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    expect(RModel.descendants(r)).toEqual([RModel(o2)])
  })
  it('a reference from it should not be reported as a reference', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const o3 = {x: 7}
    const r = RModel({o1, o2, o3})

    expect(RModel.primaryReference(RModel(o2))).toEqual({referrer: r, property: "o2"})
    expect(RModel.secondaryReferences(RModel(o2))).toEqual([])
    r.o3.o2 = r.o2
    expect(RModel.secondaryReferences(RModel(o2))).toEqual([{referrer: r.o3, property: "o2"}])
    r.o1.o2 = r.o2
    expect(RModel.secondaryReferences(RModel(o2))).toEqual([{referrer: r.o3, property: "o2"}])
  })
  it('hasRModel should return false', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    expect(RModel.hasRModel(r.o1)).toBe(false)
    expect(RModel.hasRModel(r.o2)).toBe(true)
  })
  it('should not be reported as added or removed by array changes', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel([])
    const events = []
    RModel.addChangeListener(r, e=>events.push(e), {source: "descendants"})
    r.push(o1, o2)
    expect(events[0]).toEqual({
      type: 'ArrayChange',
      target: r,
      index: 0,
      deleteCount: 0,
      insertCount: 2,
      deleted: null,
      inserted: [o1, RModel(o2)],
      oldLength: 0,
      newLength: 2,
      added: [RModel(o2)],
      removed: null
    })
  })
  it('should throw an exception if called on a value already RModel-enabled', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    expect(()=>RModel.raw(o1)).not.toThrow()
    expect(()=>RModel.raw(o2)).toThrow(new Error('Cannot mark value as raw if it is already RModel-enabled'))
  })
  it('should throw an exception if called on a Proxy', ()=>{
    const o1 = RModel.raw({a: 13})
    const o2 = {a: 14}
    const r = RModel({o1, o2})
    expect(()=>RModel.raw(r.o1)).not.toThrow()
    expect(()=>RModel.raw(r.o2)).toThrow(new Error('Cannot mark value as raw if it is already RModel-enabled'))
  })
})
