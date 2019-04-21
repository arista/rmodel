// Maintains a global stack of dependency trackers.  Whenever an
// operation (such as a computed property) runs, it uses a new tracker
// to determine its own dependencies, effectively suspending
// dependency tracking for an outer operation.  When the operation
// completes, that operation's tracker is popped, and whatever "outer"
// operation is being called will resume its own tracking.
//
// This is to support computed properties that themselves call
// computed properties, etc.  The "outer" computed property shouldn't
// be tracking the dependencies of the "inner" computed property.

import RMDependencyTracker from './RMDependencyTracker'
import RMNode from './RMNode'

export default class RMDependencyTrackers {
  dependencyTrackers: Array<RMDependencyTracker>

  constructor() {
    this.dependencyTrackers = []
  }

  // Creates a new RMDependencyTracker, then executes the given
  // function while that tracker is in effect.  The
  // RMDependencyTracker is then returned.
  static trackDependencies(f: ()=>void): RMDependencyTracker {
    const ret = new RMDependencyTracker()
    const g = SINGLETON
    g.dependencyTrackers.push(ret)
    try {
      f()
    }
    finally {
      g.dependencyTrackers.pop()
    }
    return ret
  }

  // Returns the RMDependencyTracker that is currently in effect, null
  // if none
  static get current(): RMDependencyTracker | null {
    const g = SINGLETON
    if (g.dependencyTrackers.length == 0) {
      return null
    }
    else {
      return g.dependencyTrackers[g.dependencyTrackers.length - 1]
    }
  }

  // If there is a dependency tracker in effect, add a property
  // dependency to it
  static addPropertyDependency(node: RMNode<any>, property: string) {
    const dependencyTracker = this.current
    if (dependencyTracker != null) {
      dependencyTracker.addPropertyDependency(node, property)
    }
  }

  // If there is a dependency tracker in effect, add a root dependency
  // to it
  static addRootDependency(node: RMNode<any>) {
    const dependencyTracker = this.current
    if (dependencyTracker != null) {
      dependencyTracker.addRootDependency(node)
    }
  }

  // If there is a dependency tracker in effect, add a parent dependency
  // to it
  static addParentDependency(node: RMNode<any>) {
    const dependencyTracker = this.current
    if (dependencyTracker != null) {
      dependencyTracker.addParentDependency(node)
    }
  }

  // If there is a dependency tracker in effect, add a propertyName
  // dependency to it
  static addPropertyNameDependency(node: RMNode<any>) {
    const dependencyTracker = this.current
    if (dependencyTracker != null) {
      dependencyTracker.addPropertyNameDependency(node)
    }
  }

  // If there is a dependency tracker in effect, add an id dependency
  // to it
  static addIdDependency(node: RMNode<any>) {
    const dependencyTracker = this.current
    if (dependencyTracker != null) {
      dependencyTracker.addIdDependency(node)
    }
  }

  // If there is a dependency tracker in effect, add a findById
  // dependency to it
  static addFindByIdDependency(node: RMNode<any>, id: string) {
    const dependencyTracker = this.current
    if (dependencyTracker != null) {
      dependencyTracker.addFindByIdDependency(node, id)
    }
  }
}

const SINGLETON = new RMDependencyTrackers()
