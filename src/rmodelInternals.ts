// An alternative packaging of RModel that provides direct access to
// its classes, for use by unit tests

import RModel from './rmodel'
import RMNode from './RMNode'
import RMProxy from './RMProxy'
import RMChangeListener from './RMChangeListener'
import RMBufferedCalls from './RMBufferedCalls'
import RMBufferedCall from './RMBufferedCall'

export default {
  RModel,
  RMNode,
  RMProxy,
  RMChangeListener,
  RMBufferedCalls,
  RMBufferedCall,
}
