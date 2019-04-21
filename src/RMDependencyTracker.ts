// Tracks the dependencies for an operation

import RMDependency from './RMDependency'
import RMNode from './RMNode'
import RMPropertyDependency from './RMPropertyDependency'
import RMRootDependency from './RMRootDependency'
import RMParentDependency from './RMParentDependency'
import RMPropertyNameDependency from './RMPropertyNameDependency'
import RMIdDependency from './RMIdDependency'
import RMFindByIdDependency from './RMFindByIdDependency'

export default class RMDependencyTracker {
  dependencies: Array<RMDependency> | null
  constructor() {
    this.dependencies = null
  }

  // Adds the given dependency to the list, if it doesn't already
  // exist
  addPropertyDependency(node: RMNode<any>, property: string) {
    if (!this.hasPropertyDependency(node, property)) {
      if (this.dependencies == null) {
        this.dependencies = []
      }
      const dep = new RMPropertyDependency(node, property)
      this.dependencies.push(dep)
    }
  }

  // Returns true if the given dependency is already in the list
  hasPropertyDependency(node: RMNode<any>, property: string): boolean {
    if (this.dependencies != null) {
      for(const dep of this.dependencies) {
        if (dep.matchesPropertyDependency(node, property)) {
          return true
        }
      }
    }
    return false
  }

  // Adds the given dependency to the list, if it doesn't already
  // exist
  addRootDependency(node: RMNode<any>) {
    if (!this.hasRootDependency(node)) {
      if (this.dependencies == null) {
        this.dependencies = []
      }
      const dep = new RMRootDependency(node)
      this.dependencies.push(dep)
    }
  }

  // Returns true if the given dependency is already in the list
  hasRootDependency(node: RMNode<any>): boolean {
    if (this.dependencies != null) {
      for(const dep of this.dependencies) {
        if (dep.matchesRootDependency(node)) {
          return true
        }
      }
    }
    return false
  }

  // Adds the given dependency to the list, if it doesn't already
  // exist
  addParentDependency(node: RMNode<any>) {
    if (!this.hasParentDependency(node)) {
      if (this.dependencies == null) {
        this.dependencies = []
      }
      const dep = new RMParentDependency(node)
      this.dependencies.push(dep)
    }
  }

  // Returns true if the given dependency is already in the list
  hasParentDependency(node: RMNode<any>): boolean {
    if (this.dependencies != null) {
      for(const dep of this.dependencies) {
        if (dep.matchesParentDependency(node)) {
          return true
        }
      }
    }
    return false
  }

  // Adds the given dependency to the list, if it doesn't already
  // exist
  addPropertyNameDependency(node: RMNode<any>) {
    if (!this.hasPropertyNameDependency(node)) {
      if (this.dependencies == null) {
        this.dependencies = []
      }
      const dep = new RMPropertyNameDependency(node)
      this.dependencies.push(dep)
    }
  }

  // Returns true if the given dependency is already in the list
  hasPropertyNameDependency(node: RMNode<any>): boolean {
    if (this.dependencies != null) {
      for(const dep of this.dependencies) {
        if (dep.matchesPropertyNameDependency(node)) {
          return true
        }
      }
    }
    return false
  }

  // Adds the given dependency to the list, if it doesn't already
  // exist
  addIdDependency(node: RMNode<any>) {
    if (!this.hasIdDependency(node)) {
      if (this.dependencies == null) {
        this.dependencies = []
      }
      const dep = new RMIdDependency(node)
      this.dependencies.push(dep)
    }
  }

  // Returns true if the given dependency is already in the list
  hasIdDependency(node: RMNode<any>): boolean {
    if (this.dependencies != null) {
      for(const dep of this.dependencies) {
        if (dep.matchesIdDependency(node)) {
          return true
        }
      }
    }
    return false
  }

  // Adds the given dependency to the list, if it doesn't already
  // exist
  addFindByIdDependency(node: RMNode<any>, id: string) {
    if (!this.hasFindByIdDependency(node, id)) {
      if (this.dependencies == null) {
        this.dependencies = []
      }
      const dep = new RMFindByIdDependency(node, id)
      this.dependencies.push(dep)
    }
  }

  // Returns true if the given dependency is already in the list
  hasFindByIdDependency(node: RMNode<any>, id: string): boolean {
    if (this.dependencies != null) {
      for(const dep of this.dependencies) {
        if (dep.matchesFindByIdDependency(node, id)) {
          return true
        }
      }
    }
    return false
  }

  // Adds listeners to all of the dependencies, calling the given
  // function if a dependency changes
  addListeners(f: ()=>void) {
    const dependencies = this.dependencies
    if(dependencies != null) {
      for(const dependency of dependencies) {
        dependency.addListeners(f)
      }
    }
  }

  // Removes the given listener to the given function from all of the
  // dependencies
  removeListeners(f: ()=>void) {
    const dependencies = this.dependencies
    if(dependencies != null) {
      for(const dependency of dependencies) {
        dependency.removeListeners(f)
      }
    }
  }
}
