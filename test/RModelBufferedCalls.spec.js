const rmodelInternals = require('../dist/rmodelInternals.js')
const RModel = rmodelInternals.RModel
const RMBufferedCalls = rmodelInternals.RMBufferedCalls
const RMBufferedCall = rmodelInternals.RMBufferedCall

describe('RModel buffered calls', ()=>{
  describe('bufferCall', ()=>{
    it('should not make the call until flushBufferedCalls is called', ()=>{
      let callCount = 0
      const key1 = {}
      RModel.bufferCall(key1, ()=>{callCount++})
      expect(callCount).toBe(0)
      RModel.flushBufferedCalls()
      expect(callCount).toBe(1)
    })
    it('should ignore subsequent calls for the same key', ()=>{
      let callCount = 0
      const key1 = {}
      RModel.bufferCall(key1, ()=>{callCount++})
      RModel.bufferCall(key1, ()=>{callCount += 2})
      expect(callCount).toBe(0)
      RModel.flushBufferedCalls()
      expect(callCount).toBe(1)
    })
    it('should register subsequent calls with different keys', ()=>{
      let callCount = 0
      const key1 = {}
      let callCount2 = 0
      const key2 = {}
      RModel.bufferCall(key1, ()=>{callCount++})
      RModel.bufferCall(key2, ()=>{callCount2 += 2})
      expect(callCount).toBe(0)
      expect(callCount2).toBe(0)
      RModel.flushBufferedCalls()
      expect(callCount).toBe(1)
      expect(callCount2).toBe(2)
    })
    it('should ignore multiple calls to flushBufferedCalls', ()=>{
      let callCount = 0
      const key1 = {}
      RModel.bufferCall(key1, ()=>{callCount++})
      expect(callCount).toBe(0)
      RModel.flushBufferedCalls()
      expect(callCount).toBe(1)
      RModel.flushBufferedCalls()
      expect(callCount).toBe(1)
    })
    it('should allow calls to be registered after a call to flushBufferedCalls', ()=>{
      let callCount = 0
      const key1 = {}
      RModel.bufferCall(key1, ()=>{callCount++})
      expect(callCount).toBe(0)
      RModel.flushBufferedCalls()
      expect(callCount).toBe(1)
      RModel.bufferCall(key1, ()=>{callCount++})
      RModel.flushBufferedCalls()
      expect(callCount).toBe(2)
    })
    it('should keep flushing calls buffered while flushing', ()=>{
      let callCount = 0
      const key1 = {}
      RModel.bufferCall(key1, ()=>{
        callCount++
        RModel.bufferCall(key1, ()=>{
          callCount++
          RModel.bufferCall(key1, ()=>{
            callCount++
          })
        })
      })
      expect(callCount).toBe(0)
      RModel.flushBufferedCalls()
      expect(callCount).toBe(3)
    })
    it('should keep flushing calls buffered while flushing, even if someone calls flush while flushing', ()=>{
      let callCount = 0
      const key1 = {}
      const key2 = {}
      let callCount2 = 0
      RModel.bufferCall(key1, ()=>{
        callCount++
        RModel.bufferCall(key1, ()=>{
          callCount++
          RModel.bufferCall(key1, ()=>{
            callCount++
          })
        })
        RModel.flushBufferedCalls()
        callCount2 = callCount
      })
      RModel.bufferCall(key2, ()=>{
        callCount++
      })
      expect(callCount).toBe(0)
      RModel.flushBufferedCalls()
      expect(callCount).toBe(4)
      expect(callCount2).toBe(4)
    })
    it('should call higher-priority calls before lower ones', ()=>{
      let callCount = 0
      let callCount1 = 0
      let callCount2 = 0
      RMBufferedCalls.bufferCall({}, ()=>{
        callCount1 = callCount++
      })
      RMBufferedCalls.bufferCall({}, ()=>{
        callCount2 = callCount++
      }, 10)
      RModel.flushBufferedCalls()
      expect(callCount1).toEqual(1)
      expect(callCount2).toEqual(0)
    })
    it('should call higher-priority calls before lower ones, even when they\'re being added during flushing', ()=>{
      let callCount = 0
      let callCount1 = 0
      let callCount2 = 0
      let callCount3 = 0
      RMBufferedCalls.bufferCall({}, ()=>{
        callCount1 = callCount++
      })
      RMBufferedCalls.bufferCall({}, ()=>{
        callCount2 = callCount++
        RMBufferedCalls.bufferCall({}, ()=>{
          callCount3 = callCount++
        }, 10)
      }, 10)
      RModel.flushBufferedCalls()
      expect(callCount1).toEqual(2)
      expect(callCount2).toEqual(0)
      expect(callCount3).toEqual(1)
    })
    it('should automatically flush buffered calls after the next tick', (done)=>{
      let callCount = 0
      const key1 = {}
      RModel.bufferCall(key1, ()=>{callCount++})
      expect(callCount).toBe(0)
      setTimeout(()=>{
        expect(callCount).toBe(1)
        done()
      }, 1)
      expect(callCount).toBe(0)
    })
  })

  describe('getInsertionPoint', ()=>{
    function testInsertionPoint(priorities, newPriority, expected) {
      const arr = []
      for(const priority of priorities) {
        const call = new RMBufferedCall('a', ()=>{}, priority)
        arr.push(call)
      }
      const entry = new RMBufferedCall('a', ()=>{}, newPriority)
      const result = RMBufferedCalls.getInsertionPoint(arr, entry)
      expect(result).toEqual(expected)
    }
    it('should insert into an empty array', ()=>{
      testInsertionPoint([], 10, 0)
    })
    it('should insert into an array with one element', ()=>{
      testInsertionPoint([5], 10, 0)
      testInsertionPoint([5], 4, 1)
    })
    it('should insert into an array with two elements', ()=>{
      testInsertionPoint([20, 10], 30, 0)
      testInsertionPoint([20, 10], 20, 1)
      testInsertionPoint([20, 10], 15, 1)
      testInsertionPoint([20, 10], 10, 2)
      testInsertionPoint([20, 10], 5, 2)
    })
    it('should insert into an array with repeats of the same priority', ()=>{
      const arr = [30, 30, 30, 10, 10, 10, 10, 10, 0]
      testInsertionPoint(arr, 40, 0)
      testInsertionPoint(arr, 30, 3)
      testInsertionPoint(arr, 20, 3)
      testInsertionPoint(arr, 10, 8)
      testInsertionPoint(arr, 5, 8)
      testInsertionPoint(arr, -10, 9)
    })
  })
})
