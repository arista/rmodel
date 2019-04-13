// A proxy for the Array.pop function which passes its calls to the
// RMNode
class RMArrayPopProxy {
    constructor(node) {
        this.node = node;
    }
    apply(target, thisArg, args) {
        return this.node.proxyArrayPop(target, args);
    }
}

// A proxy for the Array.push function which passes its calls to the
// RMNode
class RMArrayPushProxy {
    constructor(node) {
        this.node = node;
    }
    apply(target, thisArg, args) {
        return this.node.proxyArrayPush(target, args);
    }
}

// A proxy for the Array.shift function which passes its calls to the
// RMNode
class RMArrayShiftProxy {
    constructor(node) {
        this.node = node;
    }
    apply(target, thisArg, args) {
        return this.node.proxyArrayShift(target, args);
    }
}

// A proxy for the Array.splice function which passes its calls to the
// RMNode
class RMArraySpliceProxy {
    constructor(node) {
        this.node = node;
    }
    apply(target, thisArg, args) {
        return this.node.proxyArraySplice(target, args);
    }
}

// A proxy for the Array.unshift function which passes its calls to
// the RMNode
class RMArrayUnshiftProxy {
    constructor(node) {
        this.node = node;
    }
    apply(target, thisArg, args) {
        return this.node.proxyArrayUnshift(target, args);
    }
}

// Represents one call buffered by RMBufferedCalls
class RMBufferedCall {
    constructor(key, call, priority) {
        this.key = key;
        this.call = call;
        this.priority = priority;
    }
}

// Manages a list of "buffered" calls - that is, function calls that
class RMBufferedCalls {
    constructor() {
        this.calls = [];
        this.callsByKey = new Map();
        this.flushing = false;
        this.flushCall = () => this.flush();
    }
    // Registers the given function to be buffered for calling later.
    // If a function has already been registered with the given key,
    // this call is ignored
    add(key, f, priority = 0) {
        if (this.callsByKey.has(key)) {
            return;
        }
        // If we're about to add a call to an empty list then register a
        // callback to make sure the call is flushed at the end of the
        // current "tick" unless we're already in the middle of a flush()
        // call, in which case the registered call will be picked up by
        // that call
        if (this.calls.length == 0 && !this.flushing) {
            this.registerFlushCallback();
        }
        // Add the call - sort it into the list by priority order, making
        // sure it comes after any other items of the same priority
        const bufferedCall = new RMBufferedCall(key, f, priority);
        const insertionPoint = RMBufferedCalls.getInsertionPoint(this.calls, bufferedCall);
        this.calls.splice(insertionPoint, 0, bufferedCall);
        this.callsByKey.set(key, bufferedCall);
    }
    // Registers a call with the system to flush the buffered calls when
    // the next "tick" occurs
    registerFlushCallback() {
        // FIXME - check the environment to make sure we're using the
        // right call: nextTick, setImmediate, setTimeout(0), etc.
        process.nextTick(this.flushCall);
    }
    // Calls all of the buffered functions, sorted first by priority
    // order, then sorted by the order they were added.  If more
    // buffered calls are made while flushing, they will be gathered and
    // flushed as well, after all of the current buffered calls are
    // flushed.
    flush() {
        const oldFlushing = this.flushing;
        this.flushing = true;
        try {
            // Keep pulling from the head of the queue.  As we make the
            // callbacks, more entries might be added to the queue, so keep
            // pulling until the queue is empty
            while (this.calls.length > 0) {
                const bufferedCall = this.calls.shift();
                if (bufferedCall != null) {
                    this.callsByKey.delete(bufferedCall.key);
                    bufferedCall.call();
                }
            }
        }
        finally {
            this.flushing = oldFlushing;
        }
    }
    // Searches through the given array, assumed to be sorted in
    // prioirty order (highest to lowest), and returns the point where
    // the given call should be inserted such that the list remains
    // sorted by priority, and the new call will come after any other
    // calls with the same priority.
    static getInsertionPoint(arr, entry) {
        // Binary search
        const entryPriority = entry.priority;
        let min = -1;
        let max = arr.length;
        while (min < (max - 1)) {
            const mid = Math.floor((min + max) / 2);
            const midEntry = arr[mid];
            const midPriority = midEntry.priority;
            if (midPriority < entryPriority) {
                max = mid;
            }
            else {
                min = mid;
            }
        }
        return max;
    }
    // Registers the given function to be buffered for calling later.
    // If a function has already been registered with the given key,
    // this call is ignored
    static bufferCall(key, f, priority = 0) {
        SINGLETON.add(key, f, priority);
    }
    // Calls all of the buffered functions, sorted first by priority
    // order, then by the order they were added.  If more buffered calls
    // are made while flushing, they will be gathered and flushed as
    // well, after all of the current buffered calls are flushed.
    static flushBufferedCalls() {
        SINGLETON.flush();
    }
    // Adds a buffered call for an immutable tracker, which should come
    // after computed properties but before the default
    static bufferImmutableTrackerCall(key, f) {
        RMBufferedCalls.bufferCall(key, f, IMMUTABLE_TRACKER_PRIORITY);
    }
    // Adds a buffered call for a computed property, which should come
    // before immutable property calls
    static bufferComputedPropertyCall(key, f) {
        RMBufferedCalls.bufferCall(key, f, COMPUTED_PROPERTY_PRIORITY);
    }
}
const SINGLETON = new RMBufferedCalls();
const COMPUTED_PROPERTY_PRIORITY = 20;
const IMMUTABLE_TRACKER_PRIORITY = 10;

// Represents one ChangeListener registered with a node, with a set of
// options
class RMChangeListener {
    constructor(listener, options) {
        this.listener = listener;
        this.options = options;
    }
    // Returns true if the given listener/options matches this listener
    matches(listener, options) {
        return this.listener == listener && RMChangeListener.optionsMatch(this.options, options);
    }
    // Returns true if this listener (belonging to the given node) is
    // interested in change events from the given source node for the
    // given property
    isInterestedInPropertyChange(node, source, property) {
        // If a specific property is required and doesn't match, then no
        if (this.options != null &&
            this.options.property != null &&
            this.options.property != property) {
            return false;
        }
        return !this.isNotInterestedInChangeFromSource(node, source);
    }
    // Returns true if this listener (belonging to the given node) is
    // interested in array change events from the given source node
    isInterestedInArrayChange(node, source) {
        // If a specific property is required then no
        if (this.options != null &&
            this.options.property != null) {
            return false;
        }
        return !this.isNotInterestedInChangeFromSource(node, source);
    }
    // Returns true if this listener is not interested in any changes
    // from the given source
    isNotInterestedInChangeFromSource(node, source) {
        // Check the source
        if (this.options == null || this.options.source == null) {
            // Default is 'self'
            return node !== source;
        }
        else {
            switch (this.options.source) {
                case 'self':
                    return node !== source;
                case 'children':
                    return node !== source && source.parent !== node;
                case 'descendants':
                default:
                    return false;
            }
        }
    }
    // Returns true if the two sets of options match
    static optionsMatch(options1, options2) {
        if (options1 == null && options2 == null) {
            return true;
        }
        if (options1 == null || options2 == null) {
            return false;
        }
        if (options1.property != options2.property) {
            return false;
        }
        if (options1.source != options2.source) {
            return false;
        }
        return true;
    }
}

// Abstract superclass for different kinds of dependencies
class RMDependency {
    constructor() {
    }
    // Converts this to an application-visible Dependency
    toDependency(toExternalValue) {
        throw new Error('Abstract method');
    }
    // Returns true if the given property dependency matches this
    matchesPropertyDependency(node, property) {
        return false;
    }
    // Returns true if the given root dependency matches this
    matchesRootDependency(node) {
        return false;
    }
    // Returns true if the given parent dependency matches this
    matchesParentDependency(node) {
        return false;
    }
    // Returns true if the given propertyName dependency matches this
    matchesPropertyNameDependency(node) {
        return false;
    }
    // Returns true if the given id dependency matches this
    matchesIdDependency(node) {
        return false;
    }
    // Returns true if the given findById dependency matches this
    matchesFindByIdDependency(node, id) {
        return false;
    }
    // Adds whatever listeners are required to call the given function
    // if a dependency changes
    addListeners(f) {
        throw new Error('Abstract method');
    }
    // Removes whatever listeners were added to call the given function
    // if a dependency changes
    removeListeners(f) {
        throw new Error('Abstract method');
    }
}

// Represents a dependency on a property of an object
class RMPropertyDependency extends RMDependency {
    constructor(target, property) {
        super();
        this.target = target;
        this.property = property;
    }
    // Converts this to an application-visible Dependency
    toDependency(toExternalValue) {
        return {
            type: 'PropertyDependency',
            target: toExternalValue(this.target),
            property: this.property
        };
    }
    // Returns true if the given property dependency matches this
    matchesPropertyDependency(node, property) {
        return this.target === node && this.property == property;
    }
    // Adds whatever listeners are required to call the given function
    // if a dependency changes
    addListeners(f) {
        const options = this.changeListenerOptions;
        // It's possible for the same computed property to have multiple
        // listeners for the exact same target (especially if the value is
        // an array, in which case property might be null), so make sure
        // we're only adding one.
        if (!this.target.hasChangeListener(f, options)) {
            this.target.addChangeListener(f, options);
        }
    }
    // Removes whatever listeners were added to call the given function
    // if a dependency changes
    removeListeners(f) {
        const options = this.changeListenerOptions;
        this.target.removeChangeListener(f, options);
    }
    // Returns the options that should be used for listeners
    get changeListenerOptions() {
        // If the object is an array, then potentially the property could
        // be affected by array mutations, so we want to listen for any
        // array change, not just a change to the property.
        //
        // FIXME - is there a better way to do it than just listening to
        // all array changes?
        const property = Array.isArray(this.target.target) ? null : this.property;
        return {
            property: property,
            source: 'self'
        };
    }
}

// Represents a dependency on the root of an object
class RMRootDependency extends RMDependency {
    constructor(target) {
        super();
        this.target = target;
    }
    // Converts this to an application-visible Dependency
    toDependency(toExternalValue) {
        return {
            type: 'RootDependency',
            target: toExternalValue(this.target)
        };
    }
    // Returns true if the given root dependency matches this
    matchesRootDependency(node) {
        return this.target === node;
    }
    // Adds whatever listeners are required to call the given function
    // if a dependency changes
    addListeners(f) {
        if (!this.target.hasRootChangeListener(f)) {
            this.target.addRootChangeListener(f);
        }
    }
    // Removes whatever listeners were added to call the given function
    // if a dependency changes
    removeListeners(f) {
        this.target.removeRootChangeListener(f);
    }
}

// Represents a dependency on the parent of an object
class RMParentDependency extends RMDependency {
    constructor(target) {
        super();
        this.target = target;
    }
    // Converts this to an application-visible Dependency
    toDependency(toExternalValue) {
        return {
            type: 'ParentDependency',
            target: toExternalValue(this.target)
        };
    }
    // Returns true if the given parent dependency matches this
    matchesParentDependency(node) {
        return this.target === node;
    }
    // Adds whatever listeners are required to call the given function
    // if a dependency changes
    addListeners(f) {
        if (!this.target.hasParentChangeListener(f)) {
            this.target.addParentChangeListener(f);
        }
    }
    // Removes whatever listeners were added to call the given function
    // if a dependency changes
    removeListeners(f) {
        this.target.removeParentChangeListener(f);
    }
}

// Represents a dependency on the property of an object
class RMPropertyNameDependency extends RMDependency {
    constructor(target) {
        super();
        this.target = target;
    }
    // Converts this to an application-visible Dependency
    toDependency(toExternalValue) {
        return {
            type: 'PropertyNameDependency',
            target: toExternalValue(this.target)
        };
    }
    // Returns true if the given propertyName dependency matches this
    matchesPropertyNameDependency(node) {
        return this.target === node;
    }
    // Adds whatever listeners are required to call the given function
    // if a dependency changes
    addListeners(f) {
        if (!this.target.hasPropertyNameChangeListener(f)) {
            this.target.addPropertyNameChangeListener(f);
        }
    }
    // Removes whatever listeners were added to call the given function
    // if a dependency changes
    removeListeners(f) {
        this.target.removePropertyNameChangeListener(f);
    }
}

// Represents a dependency on the id of an object
class RMIdDependency extends RMDependency {
    constructor(target) {
        super();
        this.target = target;
    }
    // Converts this to an application-visible Dependency
    toDependency(toExternalValue) {
        return {
            type: 'IdDependency',
            target: toExternalValue(this.target)
        };
    }
    // Returns true if the given id dependency matches this
    matchesIdDependency(node) {
        return this.target === node;
    }
    // Adds whatever listeners are required to call the given function
    // if a dependency changes
    addListeners(f) {
        if (!this.target.hasIdChangeListener(f)) {
            this.target.addIdChangeListener(f);
        }
    }
    // Removes whatever listeners were added to call the given function
    // if a dependency changes
    removeListeners(f) {
        this.target.removeIdChangeListener(f);
    }
}

// Represents a dependency on the result of a findById call on an
class RMIdDependency$1 extends RMDependency {
    constructor(target, id) {
        super();
        this.target = target;
        this.id = id;
    }
    // Converts this to an application-visible Dependency
    toDependency(toExternalValue) {
        return {
            type: 'FindByIdDependency',
            target: toExternalValue(this.target),
            id: this.id
        };
    }
    // Returns true if the given findById dependency matches this
    matchesFindByIdDependency(node, id) {
        return this.target === node && this.id == id;
    }
    // Adds whatever listeners are required to call the given function
    // if a dependency changes
    addListeners(f) {
        const root = this.target.root;
        if (!root.hasFindByIdChangeListener(f, this.id)) {
            root.addFindByIdChangeListener(f, this.id);
        }
    }
    // Removes whatever listeners were added to call the given function
    // if a dependency changes
    removeListeners(f) {
        const root = this.target.root;
        root.removeFindByIdChangeListener(f, this.id);
    }
}

// Tracks the dependencies for an operation
class RMDependencyTracker {
    constructor() {
        this.dependencies = null;
    }
    // Adds the given dependency to the list, if it doesn't already
    // exist
    addPropertyDependency(node, property) {
        if (!this.hasPropertyDependency(node, property)) {
            if (this.dependencies == null) {
                this.dependencies = [];
            }
            const dep = new RMPropertyDependency(node, property);
            this.dependencies.push(dep);
        }
    }
    // Returns true if the given dependency is already in the list
    hasPropertyDependency(node, property) {
        if (this.dependencies != null) {
            for (const dep of this.dependencies) {
                if (dep.matchesPropertyDependency(node, property)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Adds the given dependency to the list, if it doesn't already
    // exist
    addRootDependency(node) {
        if (!this.hasRootDependency(node)) {
            if (this.dependencies == null) {
                this.dependencies = [];
            }
            const dep = new RMRootDependency(node);
            this.dependencies.push(dep);
        }
    }
    // Returns true if the given dependency is already in the list
    hasRootDependency(node) {
        if (this.dependencies != null) {
            for (const dep of this.dependencies) {
                if (dep.matchesRootDependency(node)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Adds the given dependency to the list, if it doesn't already
    // exist
    addParentDependency(node) {
        if (!this.hasParentDependency(node)) {
            if (this.dependencies == null) {
                this.dependencies = [];
            }
            const dep = new RMParentDependency(node);
            this.dependencies.push(dep);
        }
    }
    // Returns true if the given dependency is already in the list
    hasParentDependency(node) {
        if (this.dependencies != null) {
            for (const dep of this.dependencies) {
                if (dep.matchesParentDependency(node)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Adds the given dependency to the list, if it doesn't already
    // exist
    addPropertyNameDependency(node) {
        if (!this.hasPropertyNameDependency(node)) {
            if (this.dependencies == null) {
                this.dependencies = [];
            }
            const dep = new RMPropertyNameDependency(node);
            this.dependencies.push(dep);
        }
    }
    // Returns true if the given dependency is already in the list
    hasPropertyNameDependency(node) {
        if (this.dependencies != null) {
            for (const dep of this.dependencies) {
                if (dep.matchesPropertyNameDependency(node)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Adds the given dependency to the list, if it doesn't already
    // exist
    addIdDependency(node) {
        if (!this.hasIdDependency(node)) {
            if (this.dependencies == null) {
                this.dependencies = [];
            }
            const dep = new RMIdDependency(node);
            this.dependencies.push(dep);
        }
    }
    // Returns true if the given dependency is already in the list
    hasIdDependency(node) {
        if (this.dependencies != null) {
            for (const dep of this.dependencies) {
                if (dep.matchesIdDependency(node)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Adds the given dependency to the list, if it doesn't already
    // exist
    addFindByIdDependency(node, id) {
        if (!this.hasFindByIdDependency(node, id)) {
            if (this.dependencies == null) {
                this.dependencies = [];
            }
            const dep = new RMIdDependency$1(node, id);
            this.dependencies.push(dep);
        }
    }
    // Returns true if the given dependency is already in the list
    hasFindByIdDependency(node, id) {
        if (this.dependencies != null) {
            for (const dep of this.dependencies) {
                if (dep.matchesFindByIdDependency(node, id)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Adds listeners to all of the dependencies, calling the given
    // function if a dependency changes
    addListeners(f) {
        const dependencies = this.dependencies;
        if (dependencies != null) {
            for (const dependency of dependencies) {
                dependency.addListeners(f);
            }
        }
    }
    // Removes the given listener to the given function from all of the
    // dependencies
    removeListeners(f) {
        const dependencies = this.dependencies;
        if (dependencies != null) {
            for (const dependency of dependencies) {
                dependency.removeListeners(f);
            }
        }
    }
}

// Maintains a global stack of dependency trackers.  Whenever an
class RMDependencyTrackers {
    constructor() {
        this.dependencyTrackers = [];
    }
    // Creates a new RMDependencyTracker, then executes the given
    // function while that tracker is in effect.  The
    // RMDependencyTracker is then returned.
    static trackDependencies(f) {
        const ret = new RMDependencyTracker();
        const g = SINGLETON$1;
        g.dependencyTrackers.push(ret);
        try {
            f();
        }
        finally {
            g.dependencyTrackers.pop();
        }
        return ret;
    }
    // Returns the RMDependencyTracker that is currently in effect, null
    // if none
    static get current() {
        const g = SINGLETON$1;
        if (g.dependencyTrackers.length == 0) {
            return null;
        }
        else {
            return g.dependencyTrackers[g.dependencyTrackers.length - 1];
        }
    }
    // If there is a dependency tracker in effect, add a property
    // dependency to it
    static addPropertyDependency(node, property) {
        const dependencyTracker = this.current;
        if (dependencyTracker != null) {
            dependencyTracker.addPropertyDependency(node, property);
        }
    }
    // If there is a dependency tracker in effect, add a root dependency
    // to it
    static addRootDependency(node) {
        const dependencyTracker = this.current;
        if (dependencyTracker != null) {
            dependencyTracker.addRootDependency(node);
        }
    }
    // If there is a dependency tracker in effect, add a parent dependency
    // to it
    static addParentDependency(node) {
        const dependencyTracker = this.current;
        if (dependencyTracker != null) {
            dependencyTracker.addParentDependency(node);
        }
    }
    // If there is a dependency tracker in effect, add a propertyName
    // dependency to it
    static addPropertyNameDependency(node) {
        const dependencyTracker = this.current;
        if (dependencyTracker != null) {
            dependencyTracker.addPropertyNameDependency(node);
        }
    }
    // If there is a dependency tracker in effect, add an id dependency
    // to it
    static addIdDependency(node) {
        const dependencyTracker = this.current;
        if (dependencyTracker != null) {
            dependencyTracker.addIdDependency(node);
        }
    }
    // If there is a dependency tracker in effect, add a findById
    // dependency to it
    static addFindByIdDependency(node, id) {
        const dependencyTracker = this.current;
        if (dependencyTracker != null) {
            dependencyTracker.addFindByIdDependency(node, id);
        }
    }
}
const SINGLETON$1 = new RMDependencyTrackers();

// Manages a mechanism which calls a function to compute a value, then
class RMComputedProperty {
    constructor(target, targetObject, property, f, options) {
        this.target = target;
        this.property = property;
        this.f = f;
        this.options = options;
        this.targetObject = targetObject;
        this.value = null;
        this.dependencies = null;
        // Bind the function calls to this instance
        this.computeValueCall = () => this.computeValue();
        this.dependencyChangedCall = () => this.dependencyChanged();
        this.computeAndAssignValueCall = () => this.computeAndAssignValue();
    }
    // Computes the value and stores the result.  The result is not
    // immediately set on the property, to avoid triggering downstream
    // events until we're ready
    computeValue() {
        this.value = this.f(this.targetObject);
    }
    // Computes the value of the property, then assigns it to the property
    computeAndAssignValue() {
        // Call the valueComputer to execute the function and store the
        // value, and get the resulting dependencies
        const dependencies = RMDependencyTrackers.trackDependencies(this.computeValueCall);
        // Assign the resulting value to the property
        const obj = this.targetObject;
        obj[this.property] = this.value;
        // Update the listeners when moving from the old set of listeners
        // to the new set
        this.updateListeners(this.dependencies, dependencies);
        this.dependencies = dependencies;
        // Clear out the computed value so we're not holding on to it
        this.value = null;
    }
    // Called when a registered listener reports that a dependency has
    // changed
    dependencyChanged() {
        if (this.options && this.options.immediate) {
            this.computeAndAssignValue();
        }
        else {
            RMBufferedCalls.bufferComputedPropertyCall(this, this.computeAndAssignValueCall);
        }
    }
    // Compares the new set of dependencies against the old set,
    // removing listeners that are no longer needed and adding listeners
    // that are
    updateListeners(oldDependencies, newDependencies) {
        // This is a brute force method - remove all listeners from old
        // dependencies and add the ones from the new.  FIXME - should we
        // look at something that tries to avoid unnecessary listener
        // "thrashing"?
        if (oldDependencies != null) {
            oldDependencies.removeListeners(this.dependencyChangedCall);
        }
        newDependencies.addListeners(this.dependencyChangedCall);
    }
    // Called when a computed property is being discarded, in which case
    // all of its listeners have to be removed
    disconnect() {
        const dependencies = this.dependencies;
        if (dependencies != null) {
            dependencies.removeListeners(this.dependencyChangedCall);
        }
    }
}

// Represents one FindByIdChangeListener registered with a node
// (typically registered with the root node)
class RMFindByIdChangeListener {
    constructor(listener, id) {
        this.listener = listener;
        this.id = id;
    }
    // Returns true if the given listener matches this listener and id
    matches(listener, id) {
        return this.listener == listener && this.id == id;
    }
}

class RMNode {
    constructor() {
        this.target = this;
        this.primaryReference = null;
        this.secondaryReferences = null;
        this.proxy = this;
        this.immutableValue = null;
    }
    proxyArrayPop(func, args) {
        return null;
    }
    proxyArrayPush(func, args) {
        return null;
    }
    proxyArrayShift(func, args) {
        return null;
    }
    proxyArraySplice(func, args) {
        return null;
    }
    proxyArrayUnshift(func, args) {
        return null;
    }
    get parent() {
        return null;
    }
    get root() {
        return this;
    }
    hasFindByIdChangeListener(listener, id) {
        return false;
    }
    addFindByIdChangeListener(listener, id) {
    }
    removeFindByIdChangeListener(listener, id) {
    }
    hasIdChangeListener(listener) {
        return false;
    }
    addIdChangeListener(listener) {
    }
    removeIdChangeListener(listener) {
    }
    hasParentChangeListener(listener) {
        return false;
    }
    addParentChangeListener(listener) {
    }
    removeParentChangeListener(listener) {
    }
    hasChangeListener(listener, options = null) {
        return false;
    }
    addChangeListener(listener, options = null) {
    }
    removeChangeListener(listener, options = null) {
    }
    hasPropertyNameChangeListener(listener) {
        return false;
    }
    addPropertyNameChangeListener(listener) {
    }
    removePropertyNameChangeListener(listener) {
    }
    hasRootChangeListener(listener) {
        return false;
    }
    addRootChangeListener(listener) {
    }
    removeRootChangeListener(listener) {
    }
    static valueToRModel(value) {
        return value;
    }
    isRoot() {
        return false;
    }
    get property() {
        return null;
    }
    static hasRModel(value) {
        return false;
    }
    static getManagedValue(value) {
        return value;
    }
    static toExternalValue(value) {
        return value;
    }
    addComputedProperty(property, f, options) {
    }
    removeComputedProperty(property) {
    }
    setId(id) {
    }
    getId() {
        return null;
    }
    deleteId() {
    }
    findById(id) {
        return null;
    }
    setImmutable(listener) {
        return this;
    }
    static getNodeForValue(value) {
        return null;
    }
    static getConnectedOrDisconnectedNodeForObject(obj) {
        return null;
    }
    flushImmutableChanges() {
    }
    proxyGet(property) {
        return null;
    }
    proxySet(property, value) {
        return false;
    }
    proxyDelete(property) {
        return false;
    }
}

// @flow
// Serves both as the main gateway of the rmodel API, and as a
// singleton instance for holding global RModel state
class RMGlobal {
    // FIXME - description
    static toRModel(value) {
        return RMNode.valueToRModel(value);
    }
    // FIXME - description
    static isRoot(value) {
        const node = this.requireNodeForValue(value);
        return node.isRoot();
    }
    // FIXME - description
    static getRoot(value) {
        const node = this.requireNodeForValue(value);
        return this.getObjectForNode(node.root);
    }
    // FIXME - description
    static getParent(value) {
        const node = this.requireNodeForValue(value);
        return this.getObjectForNode(node.parent);
    }
    // FIXME - description
    static getProperty(value) {
        const node = this.requireNodeForValue(value);
        return node.property;
    }
    // FIXME - description
    static getPrimaryReference(value) {
        const node = this.requireNodeForValue(value);
        const ref = node.primaryReference;
        if (ref != null) {
            return {
                referrer: this.requireObjectForNode(ref.referrer),
                property: ref.property
            };
        }
        else {
            return null;
        }
    }
    // FIXME - description
    static getSecondaryReferences(value) {
        const node = this.requireNodeForValue(value);
        const ret = [];
        if (node.secondaryReferences != null) {
            for (const ref of node.secondaryReferences) {
                const r = {
                    referrer: this.requireObjectForNode(ref.referrer),
                    property: ref.property
                };
                ret.push(r);
            }
        }
        return ret;
    }
    // FIXME - description
    static hasRModel(value) {
        return RMNode.hasRModel(value);
    }
    // FIXME - description
    static getManagedValue(value) {
        return RMNode.getManagedValue(value);
    }
    // FIXME - description
    static addChangeListener(value, listener, options = null) {
        const node = this.requireNodeForValue(value);
        node.addChangeListener(listener, options);
    }
    // FIXME - description
    static removeChangeListener(value, listener, options = null) {
        const node = this.requireNodeForValue(value);
        node.removeChangeListener(listener, options);
    }
    // Executes the given function while watching to see what RModel
    // values are accessed as that function is executed.  The resulting
    // values are returned as a list of dependencies
    static findDependencies(func) {
        const ret = [];
        const dependencyTracker = RMDependencyTrackers.trackDependencies(func);
        const deps = dependencyTracker.dependencies;
        if (deps != null) {
            for (const dep of deps) {
                const retdep = dep.toDependency(RMNode.toExternalValue);
                ret.push(retdep);
            }
        }
        return ret;
    }
    // FIXME - description
    static bufferCall(key, f) {
        RMBufferedCalls.bufferCall(key, f);
    }
    // FIXME - description
    static flushBufferedCalls() {
        RMBufferedCalls.flushBufferedCalls();
    }
    static addComputedProperty(value, property, f, options = null) {
        const node = this.requireNodeForValue(value);
        node.addComputedProperty(property, f, options);
    }
    static removeComputedProperty(value, property) {
        const node = this.requireNodeForValue(value);
        node.removeComputedProperty(property);
    }
    static setId(value, id) {
        const node = this.requireNodeForValue(value);
        node.setId(id);
    }
    static getId(value) {
        // This case is a little special - if a node is removed and
        // disconnected, and not yet added to another tree, we still want
        // to be able to see what its id used to be.
        const node = this.requireConnectedOrDisconnectedNodeForValue(value);
        return node.getId();
    }
    static deleteId(value) {
        const node = this.requireNodeForValue(value);
        node.deleteId();
    }
    static findById(value, id) {
        const node = this.requireNodeForValue(value);
        return node.findById(id);
    }
    static setImmutable(value, listener) {
        const node = this.requireNodeForValue(value);
        return node.setImmutable(listener);
    }
    // Returns the RMNode associated with the given value, throws an
    // exception if none
    static requireNodeForValue(value) {
        const node = RMNode.getNodeForValue(value);
        if (node == null) {
            throw new Error('InvalidArgument: Expected an RModel-enabled object value');
        }
        return node;
    }
    // Returns the RMNode associated with the given value, even if that
    // node has been disconnected, throws an exception if none
    static requireConnectedOrDisconnectedNodeForValue(value) {
        let node = RMNode.getNodeForValue(value);
        if (node == null) {
            if (value instanceof Object) {
                node = RMNode.getConnectedOrDisconnectedNodeForObject(value);
            }
        }
        if (node == null) {
            throw new Error('InvalidArgument: Expected an RModel-enabled object value');
        }
        return node;
    }
    // Returns the external object that should be exposed to the
    // application for the given node
    static getObjectForNode(node) {
        return node != null ? node.proxy : null;
    }
    // Returns the external object that should be exposed to the
    // application for the given node
    static requireObjectForNode(node) {
        return node.proxy;
    }
}

// Tracks the nodes that have changed their immutable values over the
class RMImmutableTracker {
    constructor(node, listener) {
        this.node = node;
        this.listener = listener;
        this.changedNodes = null;
        // Bind the function calls to this instance
        this.flushCall = () => this.flush();
    }
    // Notifies that the given node has created and modified a copy of
    // its immutable value, and will have to be notified at the end of
    // the current 'tick'
    addChangedNode(node) {
        if (this.changedNodes == null) {
            this.changedNodes = [node];
        }
        else {
            this.changedNodes.push(node);
        }
        RMBufferedCalls.bufferImmutableTrackerCall(this, this.flushCall);
    }
    // Called at the end of the current 'tick' to tell all of the nodes
    // to put their new immutable values into use, and to notify the
    // listener at the top of the immutable tree.
    flush() {
        if (this.changedNodes != null) {
            // Keep track of the old immutable value of the root, to be used
            // in the event that will be fired
            const oldValue = this.node.immutableValue;
            if (oldValue == null) {
                throw new Error('Assertion failed - oldNode should not be null');
            }
            // Notify all of the nodes that have changed their immutable
            // values
            for (const n of this.changedNodes) {
                n.flushImmutableChanges();
            }
            this.changedNodes = null;
            // Keep track of the new immutable value of the root, to be used
            // in the event that will be fired
            const newValue = this.node.immutableValue;
            if (newValue == null) {
                throw new Error('Assertion failed - oldNode should not be null');
            }
            // Fire the event
            const event = {
                type: 'ImmutableChange',
                oldValue,
                newValue
            };
            this.listener(event);
        }
    }
}

// Represents one IdChangeListener registered with a node
class RMIdChangeListener {
    constructor(listener) {
        this.listener = listener;
    }
    // Returns true if the given listener matches this listener
    matches(listener) {
        return this.listener == listener;
    }
}

// Represents one ParentChangeListener registered with a node
class RMParentChangeListener {
    constructor(listener) {
        this.listener = listener;
    }
    // Returns true if the given listener matches this listener
    matches(listener) {
        return this.listener == listener;
    }
}

// Represents one PropertyNameChangeListener registered with a node
class RMPropertyNameChangeListener {
    constructor(listener) {
        this.listener = listener;
    }
    // Returns true if the given listener matches this listener
    matches(listener) {
        return this.listener == listener;
    }
}

// The handler that intercepts calls to get, set, or delete properties
// on an underlying object, passing those calls through to the RMNode
// representing that object.
//
// The Proxy has a special designated property (RMOBJECTPROXY_NODEKEY)
// which provides access back to the RMNode
class RMProxy {
    constructor(node) {
        this.node = node;
    }
    // Proxies property getters to the RMNode.  The special
    // RMOBJECTPROXY_NODEKEY symbol is used to access the RMNode from
    // the proxy (and to identify that the object is actually a proxy)
    get(target, property) {
        if (property === RMPROXY_NODEKEY) {
            return this.node;
        }
        else {
            return this.node.proxyGet(property);
        }
    }
    // Proxies property setters to the RMNode.
    set(target, property, value) {
        return this.node.proxySet(property, value);
    }
    // Proxies property delections to the RMNode
    deleteProperty(target, property) {
        return this.node.proxyDelete(property);
    }
    //--------------------------------------------------
    // FIXME - are these still needed?
    //  // Returns true if the given value is the proxy representation for a
    //  // value managed by RModel
    //  static isRMProxy(value/*:?any*/)/*:boolean*/ {
    //    return RMProxy.getRMNode(value) != null
    //  }
    //
    //  // Returns the RMNode associated with the proxy representation of an
    //  // RModel-managed value, or null if the value is not managed by
    //  // RModel
    //  static getRMNode(value/*:?any*/)/*:?RMNode*/ {
    //    return (value instanceof Object) ? this.getRMNodeForObject(value) : null
    //  }
    // Returns the RMNode associated with the proxy representation of an
    // RModel-managed value, or null if the value is not managed by
    // RModel
    static getNode(obj) {
        return obj[RMPROXY_NODEKEY];
    }
}
const RMPROXY_NODEKEY = Symbol('RMPROXY_NODEKEY');

// A reference from one object to another in the same tree,
// represented as a referrer, and the property on the referrer.
class RMReference {
    constructor(referrer, property) {
        this.referrer = referrer;
        this.property = property;
    }
    // Returns true if the given ref equals this reference
    equals(ref) {
        return ref != null && this.matches(ref.referrer, ref.property);
    }
    // Returns true if the given ref has the same values as this
    // reference
    matches(referrer, property) {
        return this.referrer == referrer && this.property == property;
    }
    // "Disconnects" this reference by setting the referrer's property
    // to null
    disconnect() {
        // to satisfy TypeScript
        const p = this.referrer.proxy;
        p[this.property] = null;
    }
}

// Represents one RootChangeListener registered with a node
class RMRootChangeListener {
    constructor(listener) {
        this.listener = listener;
    }
    // Returns true if the given listener matches this listener
    matches(listener) {
        return this.listener == listener;
    }
}

// FIXME - this is just temporary
var rmodel = {
    RMArrayPopProxy,
    RMArrayPushProxy,
    RMArrayShiftProxy,
    RMArraySpliceProxy,
    RMArrayUnshiftProxy,
    RMBufferedCall,
    RMBufferedCalls,
    RMChangeListener,
    RMComputedProperty,
    RMDependency,
    RMDependencyTracker,
    RMDependencyTrackers,
    RMFindByIdChangeListener,
    RMFindByIdDependency: RMIdDependency$1,
    RMGlobal,
    RMImmutableTracker,
    RMIdChangeListener,
    RMIdDependency,
    RMParentChangeListener,
    RMParentDependency,
    RMPropertyDependency,
    RMPropertyNameChangeListener,
    RMPropertyNameDependency,
    RMProxy,
    RMReference,
    RMRootChangeListener,
    RMRootDependency,
};

export default rmodel;
