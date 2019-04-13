// Represents one call buffered by RMBufferedCalls

export default class RMBufferedCall {
  key: any
  call: ()=>void
  priority: number
  constructor(key: any, call: ()=>void, priority: number) {
    this.key = key
    this.call = call
    this.priority = priority
  }
}
