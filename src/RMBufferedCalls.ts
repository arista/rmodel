// Manages a list of "buffered" calls - that is, function calls that
// are waiting to be called either at the end of the current "tick",
// or when flushBufferedCalls is called (whichever comes first).
//
// Each call is buffered with a specific key.  Subsequent attempts to
// buffer calls using the same key are ignored.
//
// Calls can also be buffered with a priority, such that calls with
// higher priority will be called first, and calls with the same
// priority will be called in the order they were added.  This is used
// to make sure that computed properties finish their work before
// immutable callbacks are triggered.  The default priority (used by
// api calls from the application) is 0.

import RMBufferedCall from './RMBufferedCall'

export default class RMBufferedCalls {
  calls: Array<RMBufferedCall>
  callsByKey: Map<any, RMBufferedCall>
  flushing: boolean
  flushCall: ()=>void
  constructor() {
    this.calls = []
    this.callsByKey = new Map()
    this.flushing = false
    this.flushCall = ()=>this.flush()
  }

  // Registers the given function to be buffered for calling later.
  // If a function has already been registered with the given key,
  // this call is ignored
  add(key: any, f: ()=>void, priority: number = 0) {
    if (this.callsByKey.has(key)) {
      return
    }

    // If we're about to add a call to an empty list then register a
    // callback to make sure the call is flushed at the end of the
    // current "tick" unless we're already in the middle of a flush()
    // call, in which case the registered call will be picked up by
    // that call
    if (this.calls.length == 0 && !this.flushing) {
      this.registerFlushCallback()
    }

    // Add the call - sort it into the list by priority order, making
    // sure it comes after any other items of the same priority
    const bufferedCall = new RMBufferedCall(key, f, priority)
    const insertionPoint = RMBufferedCalls.getInsertionPoint(this.calls, bufferedCall)
    this.calls.splice(insertionPoint, 0, bufferedCall)
    this.callsByKey.set(key, bufferedCall)
  }

  // Registers a call with the system to flush the buffered calls when
  // the next "tick" occurs
  registerFlushCallback() {
    // FIXME - check the environment to make sure we're using the
    // right call: nextTick, setImmediate, setTimeout(0), etc.
    process.nextTick(this.flushCall)
  }

  // Calls all of the buffered functions, sorted first by priority
  // order, then sorted by the order they were added.  If more
  // buffered calls are made while flushing, they will be gathered and
  // flushed as well, after all of the current buffered calls are
  // flushed.
  flush() {
    const oldFlushing = this.flushing
    this.flushing = true
    try {
      // Keep pulling from the head of the queue.  As we make the
      // callbacks, more entries might be added to the queue, so keep
      // pulling until the queue is empty
      while (this.calls.length > 0) {
        const bufferedCall = this.calls.shift()
        if (bufferedCall != null) {
          this.callsByKey.delete(bufferedCall.key)
          bufferedCall.call()
        }
      }
    }
    finally {
      this.flushing = oldFlushing
    }
  }

  // Searches through the given array, assumed to be sorted in
  // prioirty order (highest to lowest), and returns the point where
  // the given call should be inserted such that the list remains
  // sorted by priority, and the new call will come after any other
  // calls with the same priority.
  static getInsertionPoint(arr: Array<RMBufferedCall>, entry: RMBufferedCall): number {
    // Binary search
    const entryPriority = entry.priority
    let min = -1
    let max = arr.length
    while (min < (max - 1)) {
      const mid = Math.floor((min + max) / 2)
      const midEntry = arr[mid]
      const midPriority = midEntry.priority
      if (midPriority < entryPriority) {
        max = mid
      }
      else {
        min = mid
      }
    }
    return max
  }

  // Registers the given function to be buffered for calling later.
  // If a function has already been registered with the given key,
  // this call is ignored
  static bufferCall(key: any, f: ()=>void, priority: number = 0) {
    SINGLETON.add(key, f, priority)
  }

  // Calls all of the buffered functions, sorted first by priority
  // order, then by the order they were added.  If more buffered calls
  // are made while flushing, they will be gathered and flushed as
  // well, after all of the current buffered calls are flushed.
  static flushBufferedCalls() {
    SINGLETON.flush()
  }

  // Adds a buffered call for an immutable tracker, which should come
  // after computed properties but before the default
  static bufferImmutableTrackerCall(key: any, f: ()=>void) {
    RMBufferedCalls.bufferCall(key, f, IMMUTABLE_TRACKER_PRIORITY)
  }

  // Adds a buffered call for a computed property, which should come
  // before immutable property calls
  static bufferComputedPropertyCall(key: any, f: ()=>void) {
    RMBufferedCalls.bufferCall(key, f, COMPUTED_PROPERTY_PRIORITY)
  }
}

const SINGLETON = new RMBufferedCalls()

const COMPUTED_PROPERTY_PRIORITY = 20
const IMMUTABLE_TRACKER_PRIORITY = 10
