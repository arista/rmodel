'use strict';

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
        const g = SINGLETON;
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
        const g = SINGLETON;
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
const SINGLETON = new RMDependencyTrackers();

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
        SINGLETON$1.add(key, f, priority);
    }
    // Calls all of the buffered functions, sorted first by priority
    // order, then by the order they were added.  If more buffered calls
    // are made while flushing, they will be gathered and flushed as
    // well, after all of the current buffered calls are flushed.
    static flushBufferedCalls() {
        SINGLETON$1.flush();
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
const SINGLETON$1 = new RMBufferedCalls();
const COMPUTED_PROPERTY_PRIORITY = 20;
const IMMUTABLE_TRACKER_PRIORITY = 10;

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

// Represents the RModel state associated with an object (Object or
class RMNode {
    constructor(target) {
        this.target = target;
        this.disconnected = false;
        this._root = this;
        this.proxyHandler = new RMProxy(this);
        // We need to do this to satisfy Flow, which complains about the
        // proxyHandler's defining get, set, etc. when it's supposed to be
        // read-only
        const handler = this.proxyHandler;
        this.proxy = new Proxy(target, handler);
        this.primaryReference = null;
        this.secondaryReferences = null;
        this.isGCing = false;
        this.isGCReferenced = false;
        this.isGCPrimaryReferenced = false;
        this._spliceProxy = null;
        this._pushProxy = null;
        this._popProxy = null;
        this._shiftProxy = null;
        this._unshiftProxy = null;
        this.changeListeners = null;
        this.computedProperties = null;
        this.id = null;
        this.nodesById = null;
        this.rootChangeListeners = null;
        this.parentChangeListeners = null;
        this.propertyNameChangeListeners = null;
        this.idChangeListeners = null;
        this.findByIdChangeListeners = null;
        this.immutableValue = null;
        this.newImmutableValue = null;
        this._immutableTracker = null;
    }
    // Returns true if this node is the root of its tree
    isRoot() {
        return this.root === this;
    }
    // Returns the root of the tree containing this node
    get root() {
        RMDependencyTrackers.addRootDependency(this);
        return this._root;
    }
    // Returns true if this and the given node are in the same tree -
    // i.e., they have the same roots
    isSameTree(node) {
        return node != null && this.root === node.root;
    }
    // Shorthad for getting the referrer of the primary reference, null
    // if this is the root
    get parent() {
        RMDependencyTrackers.addParentDependency(this);
        return this.primaryReference != null ? this.primaryReference.referrer : null;
    }
    // Shorthad for getting the property of the primary reference, null
    // if this is the root
    get property() {
        RMDependencyTrackers.addPropertyNameDependency(this);
        return this.primaryReference != null ? this.primaryReference.property : null;
    }
    // Returns all of the children of this node - that is, other nodes
    // referenced by this as primary references
    get children() {
        // FIXME - test this
        const ret = [];
        for (const property in this.target) {
            const val = this.target[property];
            const node = RMNode.getNodeForValue(val);
            if (node != null) {
                if (node.isPrimaryReference(this, property)) {
                    ret.push(node);
                }
            }
        }
        return ret;
    }
    // Returns all of the descendants of this node, including only nodes
    // referenced with a primary reference
    get descendants() {
        // FIXME - test this
        const ret = [];
        this.addDescendantsToArray(ret);
        return ret;
    }
    // Returns an array including this and all of the descendants of
    // this node, including only nodes referenced with a primary
    // reference
    get thisAndDescendants() {
        // FIXME - test this
        const ret = [this];
        this.addDescendantsToArray(ret);
        return ret;
    }
    addDescendantsToArray(arr) {
        for (const property in this.target) {
            const val = this.target[property];
            const node = RMNode.getNodeForValue(val);
            if (node != null) {
                if (node.isPrimaryReference(this, property)) {
                    arr.push(node);
                    node.addDescendantsToArray(arr);
                }
            }
        }
    }
    // Returns true if this node is a descendant of ancestor
    isDescendantOf(ancestor) {
        let n = this.parent;
        while (n != null) {
            if (n === ancestor) {
                return true;
            }
            n = n.parent;
        }
        return false;
    }
    // Returns true if this node is the same as ancestor or is a
    // descendant of ancestor
    isSameOrDescendantOf(ancestor) {
        return this === ancestor || this.isDescendantOf(ancestor);
    }
    // Returns true if the given referrer/property is the primary reference to this node
    isPrimaryReference(referrer, property) {
        const ref = this.primaryReference;
        return ref != null && ref.matches(referrer, property);
    }
    // Sets the given referrer and property to be the primary reference
    // to this node.  This will also set the root of this node to the
    // referrer's root
    setPrimaryReference(referrer, property, added) {
        if (!this.isPrimaryReference(referrer, property)) {
            this.assignPrimaryReference(new RMReference(referrer, property));
            this.setRoot(referrer.root, added);
        }
    }
    // Assigns the primary reference
    assignPrimaryReference(ref) {
        const oldParent = this.primaryReference != null ? this.primaryReference.referrer : null;
        const oldProperty = this.primaryReference != null ? this.primaryReference.property : null;
        this.primaryReference = ref;
        const newParent = this.primaryReference != null ? this.primaryReference.referrer : null;
        const newProperty = this.primaryReference != null ? this.primaryReference.property : null;
        if (oldParent !== newParent) {
            this.notifyParentChangeListeners(oldParent, newParent);
        }
        if (oldProperty !== newProperty) {
            this.notifyPropertyNameChangeListeners(oldProperty, newProperty);
        }
    }
    // Sets the root of this node.  If the root is actually changing,
    // then that means the node is being added to the tree, so it is
    // added to the given added array
    setRoot(newRoot, added) {
        if (this.root !== newRoot) {
            const oldRoot = this.root;
            this._root = newRoot;
            if (added != null) {
                added.push(this);
            }
            // If this node had a mapping by id, merge those mappings into
            // the new root
            this.mergeNodesById(newRoot);
            // If this node had listeners for id to node mappings, merge
            // those mappings into the new root, firing any listeners that
            // would be triggered by the new mappings
            this.transferFindByIdChangeListeners(newRoot);
            this.nodesById = null;
            // Notify listeners of the root change
            this.notifyRootChangeListeners(oldRoot, newRoot);
        }
    }
    // Returns true if the node has a secondary reference with the given
    // referrer and property
    hasSecondaryReference(referrer, property) {
        if (this.secondaryReferences == null) {
            return false;
        }
        else {
            for (const ref of this.secondaryReferences) {
                if (ref.matches(referrer, property)) {
                    return true;
                }
            }
            return false;
        }
    }
    // Adds a secondary reference
    addSecondaryReference(referrer, property) {
        const ref = new RMReference(referrer, property);
        if (this.secondaryReferences == null) {
            this.secondaryReferences = [ref];
        }
        else {
            this.secondaryReferences.push(ref);
        }
    }
    // Removes a secondary reference
    removeSecondaryReference(referrer, property) {
        const refs = this.secondaryReferences;
        if (refs != null) {
            for (let i = 0; i < refs.length; i++) {
                const ref = refs[i];
                if (ref.matches(referrer, property)) {
                    refs.splice(i, 1);
                    return;
                }
            }
        }
    }
    // Removes the given reference, either as a primary or a secondary
    // reference
    removeReference(referrer, property) {
        if (this.isPrimaryReference(referrer, property)) {
            this.assignPrimaryReference(null);
        }
        else {
            this.removeSecondaryReference(referrer, property);
        }
    }
    //--------------------------------------------------
    // Proxy method implementations
    // Called from the proxy to get a property value
    proxyGet(property) {
        // If the target is no longer being managed by this RMNode, then
        // try to find the node that is now managing the object and pass
        // the call to it.  Otherwise just pass the call through to the
        // target
        if (this.disconnected) {
            const node = RMNode.getNodeForObject(this.target);
            if (node != null) {
                return node.proxyGet(property);
            }
            else {
                return Reflect.get(this.target, property);
            }
        }
        // Only handle string properties (not symbol)
        if (typeof (property) !== 'string') {
            return Reflect.get(this.target, property);
        }
        // If there is a dependency tracker in effect, notify it now
        RMDependencyTrackers.addPropertyDependency(this, property);
        const target = this.target;
        const value = Reflect.get(target, property);
        // If the value is a special array mutator that reports its
        // changes as ArrayChanges, then return a Proxy for it
        switch (value) {
            case Array.prototype.splice:
                return this.spliceProxy;
            case Array.prototype.push:
                return this.pushProxy;
            case Array.prototype.pop:
                return this.popProxy;
            case Array.prototype.shift:
                return this.shiftProxy;
            case Array.prototype.unshift:
                return this.unshiftProxy;
        }
        // Some properties must be returned unwrapped, such as
        // "prototype".  These are identified as properties that are not
        // writable and not configurable - FIXME - test this
        const desc = Object.getOwnPropertyDescriptor(target, property);
        // FIXME - check the performance of this
        if (desc && !desc.writable && !desc.configurable) {
            return value;
        }
        // Return the value in its "external" form to the application
        else {
            return RMNode.toExternalValue(value);
        }
    }
    // Called from the proxy to set a property value
    proxySet(property, value) {
        // If the target is no longer being managed by this RMNode, then
        // try to find the node that is now managing the object and pass
        // the call to it.  Otherwise just pass the call through to the
        // target
        if (this.disconnected) {
            const node = RMNode.getNodeForObject(this.target);
            if (node != null) {
                return node.proxySet(property, value);
            }
            else {
                return Reflect.set(this.target, property, value);
            }
        }
        // Only handle string properties (not symbol)
        if (typeof (property) !== 'string') {
            // FIXME - test this
            return Reflect.set(this.target, property, value);
        }
        const target = this.target;
        const hadOwnProperty = target.hasOwnProperty(property);
        const oldInternalValue = Reflect.get(target, property);
        const oldExternalValue = RMNode.toExternalValue(oldInternalValue);
        const newInternalValue = RMNode.toInternalValue(value);
        const newExternalValue = RMNode.toExternalValue(newInternalValue);
        const ret = Reflect.set(target, property, newInternalValue);
        if (!hadOwnProperty || (oldInternalValue !== newInternalValue)) {
            let removed = null;
            // Set up the new value
            const added = this.referenceValue(newInternalValue, property, null);
            // Handle the old value
            if (oldInternalValue instanceof Object) {
                removed = [];
            }
            this.dereferenceValue(oldInternalValue, property, removed);
            // Handle the immutable copy (if any)
            this.immutableSetProperty(property, value);
            // Fire the change event
            const listeners = this.getInterestedPropertyChangeListeners(property);
            if (listeners != null) {
                const externalAdded = RMNode.toExternalArray(added);
                const externalRemoved = RMNode.toExternalArray(removed);
                const event = {
                    type: 'PropertyChange',
                    target: this.proxy,
                    property: property,
                    oldValue: oldExternalValue,
                    newValue: newExternalValue,
                    hadOwnProperty: hadOwnProperty,
                    hasOwnProperty: true,
                    added: externalAdded,
                    removed: externalRemoved
                };
                for (const listener of listeners) {
                    const l = listener.listener;
                    l(event);
                }
            }
        }
        return ret;
    }
    // Called from the proxy to delete a property value
    proxyDelete(property) {
        // If the target is no longer being managed by this RMNode, then
        // try to find the node that is now managing the object and pass
        // the call to it.  Otherwise just pass the call through to the
        // target
        if (this.disconnected) {
            const node = RMNode.getNodeForObject(this.target);
            if (node != null) {
                return node.proxyDelete(property);
            }
            else {
                return Reflect.deleteProperty(this.target, property);
            }
        }
        // Only handle string properties (not symbol)
        if (typeof (property) !== 'string') {
            // FIXME - test this
            return Reflect.deleteProperty(this.target, property);
        }
        const target = this.target;
        const hadOwnProperty = target.hasOwnProperty(property);
        const oldInternalValue = Reflect.get(target, property);
        const oldExternalValue = RMNode.toExternalValue(oldInternalValue);
        const ret = Reflect.deleteProperty(this.target, property);
        if (hadOwnProperty) {
            let removed = null;
            if (oldInternalValue instanceof Object) {
                removed = [];
            }
            // Handle the old value
            this.dereferenceValue(oldInternalValue, property, removed);
            // Handle the immutable copy (if any)
            this.immutableDeleteProperty(property);
            // Fire the change event
            const listeners = this.getInterestedPropertyChangeListeners(property);
            if (listeners != null) {
                const externalRemoved = RMNode.toExternalArray(removed);
                const event = {
                    type: 'PropertyChange',
                    target: this.proxy,
                    property: property,
                    oldValue: oldExternalValue,
                    newValue: undefined,
                    hadOwnProperty: hadOwnProperty,
                    hasOwnProperty: false,
                    added: null,
                    removed: externalRemoved
                };
                for (const listener of listeners) {
                    const l = listener.listener;
                    l(event);
                }
            }
        }
        return ret;
    }
    //--------------------------------------------------
    // Associating RMNodes with objects
    // Returns the RMNode associated with an object, null if none
    static getNode(target) {
        return target[RMNODE_KEY];
    }
    // Creates a new RMNode for the given object and associates the
    // object with it
    static createNode(target) {
        const node = new RMNode(target);
        Object.defineProperty(target, RMNODE_KEY, { value: node, enumerable: false, writable: true, configurable: true });
        return node;
    }
    // Removes the node associated with a key
    static deleteNode(target) {
        delete target[RMNODE_KEY];
    }
    //--------------------------------------------------
    // Returns the RModel version of a value.  If the value is not an
    // object, then it is returned as-is.  If the value is an object,
    // then the RModel associated with that object is found or created
    // (recursively doing the same for its descendants), and that
    // RModel's proxy is returned.
    static valueToRModel(value) {
        if (value instanceof Object) {
            return this.objectToRModel(value);
        }
        else {
            return value;
        }
    }
    // Returns the RModel version of an object.  The RModel associated
    // with the object is found or created (recursively doing the same
    // for its descendants), and that RModel's proxy is returned
    static objectToRModel(obj) {
        let node = this.getConnectedOrDisconnectedNodeForObject(obj);
        if (node == null) {
            node = this.createNodeForObject(obj);
            node.processChildren();
            return node.proxy;
        }
        // If obj is an old node or proxy for an object that has been
        // removed from a tree, it may have been added to a new tree and
        // have a new node so try again, using the target directly
        else if (node.disconnected) {
            return this.objectToRModel(node.target);
        }
        else {
            return node.proxy;
        }
    }
    //--------------------------------------------------
    // Converting between values and nodes
    // Returns the RMNode associated with the given value, or null if
    // none
    static getNodeForValue(value) {
        // If it's already an RMNode, return it
        if (value instanceof Object) {
            return RMNode.getNodeForObject(value);
        }
        else {
            return null;
        }
    }
    // Returns the RMNode associated with the given object, or null if
    // none.  If the object has been removed from its tree, this will
    // also return null, unless the node has been added to a new tree,
    // in which case the new node is returned.
    static getNodeForObject(obj) {
        const node = this.getConnectedOrDisconnectedNodeForObject(obj);
        if (node != null) {
            // If obj is an old node or proxy for an object that has been
            // removed from a tree, it may have been added to a new tree and
            // have a new node so try again, using the target directly
            if (node.disconnected) {
                return RMNode.getNodeForObject(node.target);
            }
            else {
                return node;
            }
        }
        else {
            return null;
        }
    }
    // Returns the RMNode associated with the given object, or null if
    // none.  Returns the node even if it has been "disconnected"
    // because the object was removed from its tree
    static getConnectedOrDisconnectedNodeForObject(obj) {
        // If it's already an RMNode, return it
        if (obj instanceof RMNode) {
            return obj;
        }
        // If it's already a proxy for an RMNode, return its RMNode
        const proxyNode = RMProxy.getNode(obj);
        if (proxyNode != null) {
            return proxyNode;
        }
        // See if it already has a node
        const existingNode = RMNode.getNode(obj);
        if (existingNode != null) {
            return existingNode;
        }
        return null;
    }
    // Returns the RMNode associated with an object, creating it if not
    // found.
    static getOrCreateNodeForObject(obj) {
        const existingNode = RMNode.getNodeForObject(obj);
        if (existingNode != null) {
            return existingNode;
        }
        // Otherwise, create a node
        return this.createNodeForObject(obj);
    }
    // Convert an object that has no existing RMNode to be the root of a
    // new RModel tree
    static createNodeForObject(target) {
        // If the target is a node or proxy, then try again using the
        // underlying target (so we don't try to creates nodes on top of
        // nodes or proxies)
        const node = this.getConnectedOrDisconnectedNodeForObject(target);
        if (node != null) {
            return this.createNodeForObject(node.target);
        }
        // Create the node and associate it with the target
        return RMNode.createNode(target);
    }
    // Returns the value that should be exposed to the external
    // application
    static toExternalValue(value) {
        if (value instanceof Object) {
            const node = RMNode.getNodeForObject(value);
            if (node == null) {
                // If we get to this point for an RMNode, it probably means
                // that the value was removed from a tree and therefore
                // doesn't have an RMNode associated with it.  Regardless,
                // return the proxy version of the RMNode
                if (value instanceof RMNode) {
                    return value.proxy;
                }
                // It is possible for there to be Objects accessible from an
                // RModel tree that don't have RMNodes - for example,
                // functions on prototypes (e.g., Object.hasOwnProperty).
                // Also, Objects that have just been removed from a tree do
                // not (and should not) have RMNodes
                else {
                    return value;
                }
            }
            else {
                return node.proxy;
            }
        }
        else {
            return value;
        }
    }
    // Converts an array of nodes to their external forms.  Returns null
    // if the array is null or empty
    static toExternalArray(arr) {
        if (arr == null || arr.length == 0) {
            return null;
        }
        const ret = [];
        for (const elem of arr) {
            ret.push(elem.target);
        }
        return ret;
    }
    // Returns the "internal value", that is, the value used within the
    // target objects
    static toInternalValue(value) {
        if (value instanceof Object) {
            const node = RMNode.getNodeForObject(value);
            if (node == null) {
                return value;
            }
            else {
                return node.target;
            }
        }
        else {
            return value;
        }
    }
    // Returns true if the given value is associated with an RModel
    static hasRModel(value) {
        if (value instanceof Object) {
            const node = RMNode.getConnectedOrDisconnectedNodeForObject(value);
            if (node == null) {
                return false;
            }
            // If value is an old node or proxy for an object that has been
            // removed from a tree, it may have been added to a new tree and
            // have a new node so try again, using the target directly
            else if (node.disconnected) {
                return this.hasRModel(node.target);
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }
    // Returns the value being managed by this RMNode - i.e., the value
    // to which proxied get and set calls are being sent
    static getManagedValue(value) {
        if (value instanceof Object) {
            const node = this.getConnectedOrDisconnectedNodeForObject(value);
            if (node == null) {
                return value;
            }
            // If value is an old node or proxy for an object that has been
            // removed from a tree, it may have been added to a new tree and
            // have a new node so try again, using the target directly
            else if (node.disconnected) {
                return this.getManagedValue(node.target);
            }
            else {
                return node.target;
            }
        }
        else {
            return value;
        }
    }
    // Returns true if the given value already has a node, that is not
    // the root of its tree
    static hasNonRootNode(value) {
        const node = RMNode.getNodeForObject(value);
        return node != null && !node.isRoot();
    }
    //--------------------------------------------------
    // Recursively processes the children of a node that has been
    // created, or whose root or parentage may have changed.  The
    // children's RModels are created if they don't already exist, and
    // their primary and secondary references and roots will be set up.
    //
    // If added is specified, then any nodes added to the tree as a
    // result of this call are added to the array
    processChildren(added = null) {
        const target = this.target;
        const root = this.root;
        // Go through the object children
        for (const property in target) {
            const value = target[property];
            if (value instanceof Object) {
                const childNode = RMNode.getNodeForObject(value);
                // If the child doesn't have an RMNode, create one, set this
                // as its primary reference, set its root, and proceed
                // recursively
                if (childNode == null) {
                    const newChildNode = RMNode.createNodeForObject(value);
                    newChildNode.setPrimaryReference(this, property, added);
                    // Proceed recursively
                    newChildNode.processChildren(added);
                }
                // If the child is actually a reference to this tree's root,
                // add a secondary reference
                else if (childNode === this.root) {
                    childNode.addSecondaryReference(this, property);
                }
                // If the child already is the root of its own RModel tree,
                // add a primary reference to it and change its root
                else if (childNode.isRoot()) {
                    childNode.setPrimaryReference(this, property, added);
                    // FIXME - see if anything else needs to be "consolidated" in the root
                    // Proceed recursively
                    childNode.processChildren(added);
                }
                // If this child already has a primary reference from this
                // node, then just make sure its root is set
                else if (childNode.isPrimaryReference(this, property)) {
                    childNode.setRoot(root, added);
                    childNode.processChildren(added);
                }
                // If we get to this point and the child is already in the
                // same tree, then it must have a primary reference elsewhere.
                // Just add a secondary reference and don't proceed
                // recursively
                else if (this.isSameTree(childNode)) {
                    childNode.addSecondaryReference(this, property);
                }
                // If we get to this point, then the child is already owned by
                // another RModel tree, which is an error
                else {
                    // FIXME - better exception, including the attempted path to
                    // the child and its existing path
                    throw new Error('Attempt to add child from another tree');
                }
            }
        }
    }
    //--------------------------------------------------
    // Array proxy handlers
    // This is called when .push(...) is called on this node's proxy
    proxyArrayPush(func, args) {
        // Tell TypeScript we trust that the target is an array
        const targetArray = this.target;
        const inserted = this.argsToInternalValues(args, 0);
        // Perform the operation
        const oldLength = targetArray.length;
        let newCount = 0;
        if (inserted != null) {
            newCount = targetArray.push(...inserted);
        }
        else {
            newCount = targetArray.push();
        }
        const newLength = targetArray.length;
        // Have RModel process the change
        this.arraySplice(oldLength, 0, inserted, null, oldLength, newLength);
        // Apply changes to the immutable copy maintained by this object.
        // Do this after RModel has processed the change, so that RMNodes
        // are properly associated with all of the object arguments
        this.immutableApplyFunction(func, args);
        return newCount;
    }
    // This is called when .pop(...) is called on this node's proxy
    proxyArrayPop(func, args) {
        // Tell TypeScript we trust that the target is an array
        const targetArray = this.target;
        // Perform the operation
        const oldLength = targetArray.length;
        let deleted = null;
        if (oldLength > 0) {
            deleted = targetArray.pop();
        }
        else {
            return undefined;
        }
        const newLength = targetArray.length;
        // Have RModel process the change
        const ret = this.arraySplice(oldLength - 1, 1, null, [deleted], oldLength, newLength);
        // Apply changes to the immutable copy maintained by this object.
        // Do this after RModel has processed the change, so that RMNodes
        // are properly associated with all of the object arguments
        this.immutableApplyFunction(func, args);
        return (ret == null) ? undefined : ret[0];
    }
    // This is called when .shift(...) is called on this node's proxy
    proxyArrayShift(func, args) {
        // Tell TypeScript we trust that the target is an array
        const targetArray = this.target;
        // Perform the operation
        const oldLength = targetArray.length;
        let deleted = null;
        if (oldLength > 0) {
            deleted = targetArray.shift();
        }
        else {
            return undefined;
        }
        const newLength = targetArray.length;
        // Have RModel process the change
        const ret = this.arraySplice(0, 1, null, [deleted], oldLength, newLength);
        // Apply changes to the immutable copy maintained by this object.
        // Do this after RModel has processed the change, so that RMNodes
        // are properly associated with all of the object arguments
        this.immutableApplyFunction(func, args);
        return (ret == null) ? undefined : ret[0];
    }
    // This is called when .unshift(...) is called on this node's proxy
    proxyArrayUnshift(func, args) {
        // Tell TypeScript we trust that the target is an array
        const targetArray = this.target;
        const inserted = this.argsToInternalValues(args, 0);
        // Perform the operation
        const oldLength = targetArray.length;
        let newCount = 0;
        if (inserted != null) {
            newCount = targetArray.unshift(...inserted);
        }
        else {
            newCount = targetArray.unshift();
        }
        const newLength = targetArray.length;
        // Have RModel process the change
        this.arraySplice(0, 0, inserted, null, oldLength, newLength);
        // Apply changes to the immutable copy maintained by this object.
        // Do this after RModel has processed the change, so that RMNodes
        // are properly associated with all of the object arguments
        this.immutableApplyFunction(func, args);
        return newCount;
    }
    // This is called when .splice(...) is called on this node's proxy
    proxyArraySplice(func, args) {
        // Tell TypeScript we trust that the target is an array
        const targetArray = this.target;
        const oldLength = targetArray.length;
        // Normalize arguments
        let start = this.getSpliceStart(args, oldLength);
        let deleteCount = this.getSpliceDeleteCount(args, oldLength, start);
        const inserted = this.argsToInternalValues(args, 2);
        // Perform the operation
        let deleted = null;
        if (inserted != null) {
            deleted = targetArray.splice(start, deleteCount, ...inserted);
        }
        else {
            deleted = targetArray.splice(start, deleteCount);
        }
        const newLength = targetArray.length;
        // Have RModel process the change
        const ret = this.arraySplice(start, deleteCount, inserted, deleted, oldLength, newLength);
        // Apply changes to the immutable copy maintained by this object.
        // Do this after RModel has processed the change, so that RMNodes
        // are properly associated with all of the object arguments
        this.immutableApplyFunction(func, args);
        return (ret == null) ? [] : ret;
    }
    // Eventual method called to update the RModel bookkeeping after an
    // array splice.  This should only be called with normalized
    // arguments
    arraySplice(start, deleteCount, inserted, deleted, oldLength, newLength) {
        const insertCount = (inserted == null) ? 0 : inserted.length;
        // Adjust the indexes of the original values in the array affected
        // by an insert or delete
        const adjustDelta = insertCount - deleteCount;
        if (adjustDelta != 0) {
            const adjustStart = start + insertCount;
            this.adjustReferrerIndexProperties(adjustStart, adjustDelta);
        }
        // Get the external values for all the values to be added,
        // referencing each of them and forming the list of nodes that
        // were added to the tree
        let addedNodes = null;
        let externalInserted = null;
        if (inserted != null) {
            externalInserted = [];
            // A special case is if we are adding a descendant of an item,
            // then the item itself, neither of which is already in the
            // tree.  If both are RModels, then simply adding them in order
            // will fail on the first one, because it will think it is
            // adding an item from a different tree, even though both will
            // eventually end up in the same tree.
            //
            // To handle this, we make two passes - first we ignore those
            // objects that have an RModel but are not roots (i.e., those
            // that might trigger the error condition).  Then we go back and
            // make a second pass for those objects.
            const secondPass = [];
            for (let insertedIx = 0; insertedIx < inserted.length; insertedIx++) {
                const internalInsertedElem = inserted[insertedIx];
                if (RMNode.hasNonRootNode(internalInsertedElem)) {
                    secondPass.push(internalInsertedElem);
                }
                else {
                    addedNodes = this.addValueForSplice(internalInsertedElem, start, insertedIx, addedNodes, externalInserted);
                    secondPass.push(null);
                }
            }
            for (let insertedIx = 0; insertedIx < inserted.length; insertedIx++) {
                const internalInsertedElem = secondPass[insertedIx];
                if (internalInsertedElem != null) {
                    addedNodes = this.addValueForSplice(internalInsertedElem, start, insertedIx, addedNodes, externalInserted);
                }
            }
        }
        // Convert the added nodes to their external values
        let added = null;
        if (addedNodes != null && addedNodes.length > 0) {
            added = [];
            for (const addedNode of addedNodes) {
                const externalAddedValue = RMNode.toExternalValue(addedNode);
                added.push(externalAddedValue);
            }
        }
        // Get the external values of all the values to be removed,
        // dereferencing each of them and forming the list of nodes that
        // were removed from the tree.  Note that this needs to happen
        // after the added nodes are referenced, since an added node might
        // be what keeps a removed node in the tree.
        let externalDeleted = null;
        let removedNodes = null;
        if (deleted != null && deleted.length > 0) {
            externalDeleted = [];
            for (let deletedIx = 0; deletedIx < deleted.length; deletedIx++) {
                const internalDeletedElem = deleted[deletedIx];
                const deleteIx = start + deletedIx;
                const externalDeletedElem = RMNode.toExternalValue(internalDeletedElem);
                externalDeleted.push(externalDeletedElem);
                if (internalDeletedElem instanceof Object) {
                    if (removedNodes == null) {
                        removedNodes = [];
                    }
                    this.dereferenceValue(internalDeletedElem, deleteIx.toString(), removedNodes);
                }
            }
        }
        // Convert the removed nodes to their external values
        let removed = null;
        if (removedNodes != null && removedNodes.length > 0) {
            removed = [];
            for (const removedNode of removedNodes) {
                const externalRemovedValue = RMNode.toExternalValue(removedNode);
                removed.push(externalRemovedValue);
            }
        }
        // Fire the event if there was some change
        if (insertCount != 0 || deleteCount != 0) {
            const listeners = this.getInterestedArrayChangeListeners();
            if (listeners != null) {
                // We need to do this to satisfy flow
                const eventTarget = this.proxy;
                const event = {
                    type: 'ArrayChange',
                    target: eventTarget,
                    index: start,
                    deleteCount: deleteCount,
                    insertCount: insertCount,
                    deleted: externalDeleted,
                    inserted: externalInserted,
                    oldLength: oldLength,
                    newLength: newLength,
                    added: added,
                    removed: removed
                };
                for (const listener of listeners) {
                    const l = listener.listener;
                    l(event);
                }
            }
        }
        return externalDeleted;
    }
    // Returns the "start" value that should be used for a call to
    // splice
    getSpliceStart(args, length) {
        let start = (args.length >= 1) ? args[0] : 0;
        if (start > length) {
            start = length;
        }
        if (start < 0) {
            start = length + start;
        }
        if (start < 0) {
            start = 0;
        }
        return start;
    }
    // Returns the "deleteCount" value that should be used for a call to
    // splice
    getSpliceDeleteCount(args, length, start) {
        let deleteCount = (args.length >= 2) ? args[1] : length - start;
        if (deleteCount < 0) {
            deleteCount = 0;
        }
        if (start + deleteCount > length) {
            deleteCount = length - start;
        }
        return deleteCount;
    }
    // Converts the array of arguments, starting at the given value, to
    // an array of internal values, or null if the array would be empty
    argsToInternalValues(args, start) {
        if (args.length > start) {
            const ret = [];
            for (let i = start; i < args.length; i++) {
                const arg = args[i];
                const internalValue = RMNode.toInternalValue(arg);
                ret.push(internalValue);
            }
            return ret;
        }
        else {
            return null;
        }
    }
    // Takes care of adding a value as part of a call to splice.  Start
    // is the starting point of the splice, index is the index into the
    // array of inserted elements.  addedNodes is the list of nodes that
    // ended up being added, and inserted is the array of external
    // values of the inserted elements
    addValueForSplice(value, start, index, addedNodes, inserted) {
        const ix = start + index;
        const ret = this.referenceValue(value, ix.toString(), addedNodes);
        const externalValue = RMNode.toExternalValue(value);
        inserted[index] = externalValue;
        return ret;
    }
    // Adjusts all of the indexes of the array's element references
    // starting at the given start point going to the end of the array,
    // adjusting each one by the given delta.
    adjustReferrerIndexProperties(start, delta) {
        const arr = this.target;
        if (Array.isArray(arr)) {
            // If we are increasing indexes, then start from the last element
            // and go backwards.  That way, if an element has multiple
            // secondary references from the same array, we won't temporarily
            // cause those references to collide.
            if (delta > 0) {
                for (let ix = arr.length - 1; ix >= start; ix--) {
                    this.adjustElementReferrerIndexProperty(arr, ix, start, delta);
                }
            }
            // Same as above, except that if we're decreasing indexes, then
            // start from the first element and go forwards
            else if (delta < 0) {
                for (let ix = start; ix < arr.length; ix++) {
                    this.adjustElementReferrerIndexProperty(arr, ix, start, delta);
                }
            }
        }
    }
    // Adjusts the index for one element of an array
    adjustElementReferrerIndexProperty(arr, ix, start, delta) {
        const value = arr[ix];
        const node = RMNode.getNodeForValue(value);
        if (node != null) {
            node.adjustReferrerIndexProperty(this, ix - delta, ix);
        }
    }
    // Adjusts the index of value's first matching reference, changing
    // it to the given newIndex
    adjustReferrerIndexProperty(referrer, oldIndex, newIndex) {
        const oldIndexStr = oldIndex.toString();
        const newIndexStr = newIndex.toString();
        const primaryReference = this.primaryReference;
        if (primaryReference != null && primaryReference.matches(referrer, oldIndexStr)) {
            primaryReference.property = newIndexStr;
            return;
        }
        const secondaryReferences = this.secondaryReferences;
        if (secondaryReferences != null) {
            for (const secondaryReference of secondaryReferences) {
                if (secondaryReference.matches(referrer, oldIndexStr)) {
                    secondaryReference.property = newIndexStr;
                    return;
                }
            }
        }
    }
    //--------------------------------------------------
    // Array proxy functions
    // Returns the proxy function that should be returned when .push is
    // called on this object.  The proxy will pass its call back to
    // proxyArrayPush on this node.
    get pushProxy() {
        if (this._pushProxy == null) {
            const handler = new RMArrayPushProxy(this);
            const proxy = new Proxy(Array.prototype.push, handler);
            this._pushProxy = proxy;
        }
        // Assure TypeScript that the returned value will not be null
        return this._pushProxy;
    }
    // Returns the proxy function that should be returned when .pop is
    // called on this object.  The proxy will pass its call back to
    // proxyArrayPop on this node.
    get popProxy() {
        if (this._popProxy == null) {
            const handler = new RMArrayPopProxy(this);
            const proxy = new Proxy(Array.prototype.pop, handler);
            this._popProxy = proxy;
        }
        // Assure TypeScript that the returned value will not be null
        return this._popProxy;
    }
    // Returns the proxy function that should be returned when .unshift
    // is called on this object.  The proxy will pass its call back to
    // proxyArrayUnshift on this node.
    get unshiftProxy() {
        if (this._unshiftProxy == null) {
            const handler = new RMArrayUnshiftProxy(this);
            const proxy = new Proxy(Array.prototype.unshift, handler);
            this._unshiftProxy = proxy;
        }
        // Assure TypeScript that the returned value will not be null
        return this._unshiftProxy;
    }
    // Returns the proxy function that should be returned when .shift
    // is called on this object.  The proxy will pass its call back to
    // proxyArrayShift on this node.
    get shiftProxy() {
        if (this._shiftProxy == null) {
            const handler = new RMArrayShiftProxy(this);
            const proxy = new Proxy(Array.prototype.shift, handler);
            this._shiftProxy = proxy;
        }
        // Assure TypeScript that the returned value will not be null
        return this._shiftProxy;
    }
    // Returns the proxy function that should be returned when .splice
    // is called on this object.  The proxy will pass its call back to
    // proxyArraySplice on this node.
    get spliceProxy() {
        if (this._spliceProxy == null) {
            const handler = new RMArraySpliceProxy(this);
            const proxy = new Proxy(Array.prototype.splice, handler);
            this._spliceProxy = proxy;
        }
        // Assure TypeScript that the returned value will not be null
        return this._spliceProxy;
    }
    //--------------------------------------------------
    // Listeners and events
    // Adds the given listener to the list of listeners to be notified
    // when a change is made to an object.  By default, the listener
    // will only be notified of changes made to this object, and will be
    // notified of changes to any property.  Those behaviors can be
    // changed by specifying options with the listener.
    //
    // Listeners may be added multiple times even with the same options.
    // All registered listeners will be notified in the order they were
    // added, which means that a listener could be notified multiple
    // times if it was added multiple times
    addChangeListener(listener, options = null) {
        const l = new RMChangeListener(listener, options);
        if (this.changeListeners == null) {
            this.changeListeners = [l];
        }
        else {
            this.changeListeners.push(l);
        }
    }
    // Removes the listener that was originally added with the given
    // listener and options.  Note that the options must match exactly -
    // if one set of options specifies a value that is the default, and
    // another set of options leaves that value blank (thereby using the
    // default), those are still not considered a match.
    //
    // Duplicate listeners are removed in reverse order of when they
    // were added.
    //
    // If the listener is not found, the method exits without change
    removeChangeListener(listener, options = null) {
        const listeners = this.changeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener, options)) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
    }
    // Returns true if any of the existing listeners match the given
    // parameters
    hasChangeListener(listener, options = null) {
        const listeners = this.changeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener, options)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Returns the array of listeners that are interested in being
    // notified of a change to the given property on this node
    getInterestedPropertyChangeListeners(property) {
        let ret = null;
        for (let n = this; n != null; n = n.parent) {
            const listeners = n.changeListeners;
            if (listeners != null) {
                for (const l of listeners) {
                    if (l.isInterestedInPropertyChange(n, this, property)) {
                        if (ret == null) {
                            ret = [l];
                        }
                        else {
                            ret.push(l);
                        }
                    }
                }
            }
        }
        return ret;
    }
    // Returns the array of listeners that are interested in being
    // notified of a change to this node's array value
    getInterestedArrayChangeListeners() {
        let ret = null;
        for (let n = this; n != null; n = n.parent) {
            const listeners = n.changeListeners;
            if (listeners != null) {
                for (const l of listeners) {
                    if (l.isInterestedInArrayChange(n, this)) {
                        if (ret == null) {
                            ret = [l];
                        }
                        else {
                            ret.push(l);
                        }
                    }
                }
            }
        }
        return ret;
    }
    //--------------------------------------------------
    // RootChangeListeners
    // Adds the given listener to the list of listeners to be notified
    // when the root of an object changes.  Duplicate listeners may be
    // added.  All added listeners, including duplicates, will be
    // notified in the order they were added.
    addRootChangeListener(listener) {
        const l = new RMRootChangeListener(listener);
        if (this.rootChangeListeners == null) {
            this.rootChangeListeners = [l];
        }
        else {
            this.rootChangeListeners.push(l);
        }
    }
    // Removes the listener that was originally added with the given
    // listener.  Duplicate listeners are removed in reverse order of
    // when they were added.  If the listener is not found, the method
    // exits without change
    removeRootChangeListener(listener) {
        const listeners = this.rootChangeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener)) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
    }
    // Returns true if any of the existing listeners match the given
    // parameters
    hasRootChangeListener(listener) {
        const listeners = this.rootChangeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Notifies any listeners of a change to the root
    notifyRootChangeListeners(oldRoot, newRoot) {
        const listeners = this.rootChangeListeners;
        if (listeners != null && listeners.length > 0) {
            const listenersCopy = listeners.slice();
            const e = {
                type: 'RootChange',
                target: RMNode.toExternalValue(this),
                oldValue: RMNode.toExternalValue(oldRoot),
                newValue: RMNode.toExternalValue(newRoot),
            };
            for (const l of listenersCopy) {
                l.listener(e);
            }
        }
    }
    // FIXME - all of the above are only tested implicitly by testing computed properties
    //--------------------------------------------------
    // ParentChangeListeners
    // Adds the given listener to the list of listeners to be notified
    // when the parent of an object changes.  Duplicate listeners may be
    // added.  All added listeners, including duplicates, will be
    // notified in the order they were added.
    addParentChangeListener(listener) {
        const l = new RMParentChangeListener(listener);
        if (this.parentChangeListeners == null) {
            this.parentChangeListeners = [l];
        }
        else {
            this.parentChangeListeners.push(l);
        }
    }
    // Removes the listener that was originally added with the given
    // listener.  Duplicate listeners are removed in reverse order of
    // when they were added.  If the listener is not found, the method
    // exits without change
    removeParentChangeListener(listener) {
        const listeners = this.parentChangeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener)) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
    }
    // Returns true if any of the existing listeners match the given
    // parameters
    hasParentChangeListener(listener) {
        const listeners = this.parentChangeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Notifies any listeners of a change to the parent
    notifyParentChangeListeners(oldParent, newParent) {
        const listeners = this.parentChangeListeners;
        if (listeners != null && listeners.length > 0) {
            const listenersCopy = listeners.slice();
            const e = {
                type: 'ParentChange',
                target: RMNode.toExternalValue(this),
                oldValue: RMNode.toExternalValue(oldParent),
                newValue: RMNode.toExternalValue(newParent),
            };
            for (const l of listenersCopy) {
                l.listener(e);
            }
        }
    }
    // FIXME - all of the above are only tested implicitly by testing computed properties
    //--------------------------------------------------
    // PropertyNameChangeListeners
    // Adds the given listener to the list of listeners to be notified
    // when the parent of an object changes.  Duplicate listeners may be
    // added.  All added listeners, including duplicates, will be
    // notified in the order they were added.
    addPropertyNameChangeListener(listener) {
        const l = new RMPropertyNameChangeListener(listener);
        if (this.propertyNameChangeListeners == null) {
            this.propertyNameChangeListeners = [l];
        }
        else {
            this.propertyNameChangeListeners.push(l);
        }
    }
    // Removes the listener that was originally added with the given
    // listener.  Duplicate listeners are removed in reverse order of
    // when they were added.  If the listener is not found, the method
    // exits without change
    removePropertyNameChangeListener(listener) {
        const listeners = this.propertyNameChangeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener)) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
    }
    // Returns true if any of the existing listeners match the given
    // parameters
    hasPropertyNameChangeListener(listener) {
        const listeners = this.propertyNameChangeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Notifies any listeners of a change to the parent
    notifyPropertyNameChangeListeners(oldProperty, newProperty) {
        const listeners = this.propertyNameChangeListeners;
        if (listeners != null && listeners.length > 0) {
            const listenersCopy = listeners.slice();
            const e = {
                type: 'PropertyNameChange',
                target: RMNode.toExternalValue(this),
                oldValue: oldProperty,
                newValue: newProperty,
            };
            for (const l of listenersCopy) {
                l.listener(e);
            }
        }
    }
    // FIXME - all of the above are only tested implicitly by testing computed properties
    //--------------------------------------------------
    // IdChangeListeners
    // Adds the given listener to the list of listeners to be notified
    // when the id of an object changes.  Duplicate listeners may be
    // added.  All added listeners, including duplicates, will be
    // notified in the order they were added.
    addIdChangeListener(listener) {
        const l = new RMIdChangeListener(listener);
        if (this.idChangeListeners == null) {
            this.idChangeListeners = [l];
        }
        else {
            this.idChangeListeners.push(l);
        }
    }
    // Removes the listener that was originally added with the given
    // listener.  Duplicate listeners are removed in reverse order of
    // when they were added.  If the listener is not found, the method
    // exits without change
    removeIdChangeListener(listener) {
        const listeners = this.idChangeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener)) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
    }
    // Returns true if any of the existing listeners match the given
    // parameters
    hasIdChangeListener(listener) {
        const listeners = this.idChangeListeners;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Notifies any listeners of a change to the id
    notifyIdChangeListeners(oldId, newId) {
        const listeners = this.idChangeListeners;
        if (listeners != null && listeners.length > 0) {
            const listenersCopy = listeners.slice();
            const e = {
                type: 'IdChange',
                target: RMNode.toExternalValue(this),
                oldValue: oldId,
                newValue: newId,
            };
            for (const l of listenersCopy) {
                l.listener(e);
            }
        }
    }
    // FIXME - all of the above are only tested implicitly by testing computed properties
    //--------------------------------------------------
    // FindByIdChangeListeners
    // Adds the given listener to the list of listeners to be notified
    // when the mapping from id to object changes.  Duplicate listeners
    // may be added.  All added listeners, including duplicates, will be
    // notified in the order they were added.
    addFindByIdChangeListener(listener, id) {
        const l = new RMFindByIdChangeListener(listener, id);
        if (this.findByIdChangeListeners == null) {
            this.findByIdChangeListeners = {};
        }
        const listeners = this.findByIdChangeListeners[id];
        if (listeners == null) {
            this.findByIdChangeListeners[id] = [l];
        }
        else {
            listeners.push(l);
        }
    }
    // Removes the listener that was originally added with the given
    // listener and id.  Duplicate listeners are removed in reverse
    // order of when they were added.  If the listener is not found, the
    // method exits without change
    removeFindByIdChangeListener(listener, id) {
        const listeners = this.findByIdChangeListeners ? this.findByIdChangeListeners[id] : null;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener, id)) {
                    listeners.splice(i, 1);
                    if (listeners.length == 0 && this.findByIdChangeListeners != null) {
                        delete this.findByIdChangeListeners[id];
                    }
                    return;
                }
            }
        }
    }
    // Returns true if any of the existing listeners match the given
    // parameters
    hasFindByIdChangeListener(listener, id) {
        const listeners = this.findByIdChangeListeners ? this.findByIdChangeListeners[id] : null;
        if (listeners != null) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.matches(listener, id)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Notifies any listeners of a change to the object mapped to a
    // given id
    notifyFindByIdChangeListeners(id, oldValue, newValue) {
        const listeners = this.findByIdChangeListeners ? this.findByIdChangeListeners[id] : null;
        if (listeners != null && listeners.length > 0) {
            let listenersCopy = null;
            for (const l of listeners) {
                if (l.id == id) {
                    if (listenersCopy == null) {
                        listenersCopy = [l];
                    }
                    else {
                        listenersCopy.push(l);
                    }
                }
            }
            if (listenersCopy != null) {
                const e = {
                    type: 'FindByIdChange',
                    target: RMNode.toExternalValue(this),
                    id: id,
                    oldValue: RMNode.toExternalValue(oldValue),
                    newValue: RMNode.toExternalValue(newValue),
                };
                for (const l of listenersCopy) {
                    l.listener(e);
                }
            }
        }
    }
    // Moves any findById change listeners from this node to the
    // specified newRoot.  If the newRoot contains new mappings from id
    // to object, then the appropriate listeners are called
    transferFindByIdChangeListeners(newRoot) {
        // FIXME - test this
        const findByIdChangeListeners = this.findByIdChangeListeners;
        if (findByIdChangeListeners != null) {
            // Go through all the listeners of all the id's
            for (const id in findByIdChangeListeners) {
                const listeners = findByIdChangeListeners[id];
                if (listeners != null && listeners.length > 0) {
                    // See if the id mapping is effectively changing from the
                    // point of view of the listener
                    const oldValue = this.nodesById ? this.nodesById[id] : null;
                    const newValue = newRoot.nodesById ? newRoot.nodesById[id] : null;
                    let e = null;
                    if (oldValue !== newValue) {
                        e = {
                            type: 'FindByIdChange',
                            target: RMNode.toExternalValue(newRoot),
                            id: id,
                            oldValue: RMNode.toExternalValue(oldValue),
                            newValue: RMNode.toExternalValue(newValue),
                        };
                    }
                    // Go through the listeners, adding them to the new root
                    for (const l of listeners) {
                        newRoot.addFindByIdChangeListener(l.listener, l.id);
                        // If the id mapping effectively changed, let the listener
                        // know
                        if (e != null) {
                            l.listener(e);
                        }
                    }
                }
            }
            this.findByIdChangeListeners = null;
        }
    }
    // FIXME - all of the above are only tested implicitly by testing computed properties
    //--------------------------------------------------
    // Handles the mechanics of referencing a value - determines if it
    // should be a primary or seconday reference should be added, and
    // handles recursively processing any children.  Returns an array of
    // the nodes that were added to the tree (using the passed-in added
    // array if one was supplied)
    referenceValue(value, property, added) {
        if (value instanceof Object) {
            const newNode = RMNode.getOrCreateNodeForObject(value);
            // If we're referencing the root of this tree, just add it as
            // a secondary reference
            if (newNode === this.root) {
                newNode.addSecondaryReference(this, property);
            }
            // If there's no primary reference, (and it's not the root)
            // then set it and proceed recursively
            else if (newNode.primaryReference == null) {
                if (added == null) {
                    added = [];
                }
                newNode.setPrimaryReference(this, property, added);
                newNode.processChildren(added);
            }
            // There's already a primary reference - add as a secondary
            // reference, as long as it's coming from the same tree.
            else if (this.isSameTree(newNode.parent)) {
                newNode.addSecondaryReference(this, property);
            }
            // Otherwise, this is an attempt to reference a node that
            // belongs to a different tree
            else {
                // FIXME - better error
                throw new Error('Cannot set a property to point to an object belonging to a different tree');
            }
        }
        return added;
    }
    //--------------------------------------------------
    // Handling replacement and possibly removal of nodes
    // Called when the given value is being dereferenced by this node,
    // either from being replaced by a property set, or from a property
    // delete.  If removed is specified, then any nodes removed from the
    // tree are placed in that array.
    dereferenceValue(value, property, removed) {
        if (value instanceof Object) {
            const oldNode = RMNode.getNodeForObject(value);
            if (oldNode != null) {
                // If this was the primary reference for the node...
                if (oldNode.isPrimaryReference(this, property)) {
                    oldNode.removePrimaryReference(removed);
                }
                // This must have been a secondary reference, so remove it
                else {
                    oldNode.removeSecondaryReference(this, property);
                }
            }
        }
    }
    // Called to indicate that the primary reference for a node is being
    // removed, as a result of a property set or delete.  If removed is
    // specified, then any nodes removed from the tree as a result are
    // added to that array.
    removePrimaryReference(removed) {
        // First check if there's a secondary reference from a referrer
        // that's not a descendant of this node
        const secondaryRef = this.findReplacementSecondaryReference();
        if (secondaryRef != null) {
            this.assignPrimaryReference(secondaryRef);
        }
        else {
            this.assignPrimaryReference(null);
            this.dereferenced(removed);
        }
    }
    // Called when all references to this node from outside of its tree
    // have been removed.  This triggers a "mini garbage collection",
    // since there still might be secondary references to descendants of
    // this node, which could then include more references, etc.  Only
    // after following all of these references can we safely determine
    // which nodes should be removed from the tree, and we can also
    // reassign primary and secondary references.
    //
    // If removed is specified then any nodes removed from the tree as a
    // result are added to that array.
    dereferenced(removed) {
        // Get all of this node's descendants and clear their GC flags
        const nodes = this.thisAndDescendants;
        for (const node of nodes) {
            node.isGCing = true;
            node.isGCReferenced = false;
            node.isGCPrimaryReferenced = false;
        }
        // Find any nodes that still have a secondary reference from a
        // referrer that's not being considered for GC
        const referenced = [];
        for (const node of nodes) {
            if (node.hasSecondaryReferenceNotGCing()) {
                referenced.push(node);
                node.isGCReferenced = true;
            }
        }
        // Starting with that "root" set, find any additional references
        for (let i = 0; i < referenced.length; i++) {
            const node = referenced[i];
            for (const property in node.target) {
                const val = node.target[property];
                const propertyNode = RMNode.getNodeForValue(val);
                // Make sure the referenced object is one under consideration
                // for GC, but hasn't yet been marked as referenced
                if (propertyNode != null && propertyNode.isGCing && !propertyNode.isGCReferenced) {
                    referenced.push(propertyNode);
                    propertyNode.isGCReferenced = true;
                }
            }
        }
        // For nodes that are marked as referenced, we need to make sure
        // each is assigned a valid primary reference.  Be sure to walk
        // through this in the order that references were found, as that
        // will make sure that new primary references will be successfully
        // found for each.
        for (const node of referenced) {
            node.assignPostGCPrimaryReference();
            node.isGCPrimaryReferenced = true;
        }
        // Any nodes not marked as referenced at this point can be removed
        for (const node of nodes) {
            if (!node.isGCReferenced) {
                node.removeNode();
                if (removed != null) {
                    removed.push(node);
                }
            }
        }
        // Clear out the GC flags
        for (const node of nodes) {
            node.isGCing = false;
            node.isGCReferenced = false;
            node.isGCPrimaryReferenced = false;
        }
    }
    // Searches the secondary references of this node, most recent
    // first, for one that comes from a referrer that is not a
    // descendant of this node.  Returns null if no such reference is
    // found.  If one is found, then it is removed from the list of
    // secondary references and returned.
    findReplacementSecondaryReference() {
        const refs = this.secondaryReferences;
        if (refs == null) {
            return null;
        }
        for (let i = refs.length - 1; i >= 0; i--) {
            const ref = refs[i];
            // Make sure the referrer doesn't come from this node or one
            // of its descendants
            if (!ref.referrer.isSameOrDescendantOf(this)) {
                refs.splice(i, 1);
                return ref;
            }
        }
        return null;
    }
    // Returns true if this node has a secondary reference whose
    // referrer is not currently involved in GC
    hasSecondaryReferenceNotGCing() {
        const refs = this.secondaryReferences;
        if (refs == null) {
            return false;
        }
        for (const ref of refs) {
            if (!ref.referrer.isGCing) {
                return true;
            }
        }
        return false;
    }
    // Searches through this node's references for one that will be a
    // suitable replacement as a primary reference after a "GC" - one
    // whose referrer isn't being considered for GC, or is referenced
    assignPostGCPrimaryReference() {
        // See if the primary reference already satisfies the conditions
        const primary = this.primaryReference;
        if (primary != null && (!primary.referrer.isGCing || primary.referrer.isGCPrimaryReferenced)) {
            return;
        }
        const refs = this.secondaryReferences;
        if (refs != null) {
            for (let i = refs.length - 1; i >= 0; i--) {
                const ref = refs[i];
                if (!ref.referrer.isGCing || ref.referrer.isGCPrimaryReferenced) {
                    refs.splice(i, 1);
                    this.assignPrimaryReference(ref);
                    return;
                }
            }
        }
        // FIXME - this shouldn't happen
        throw new Error('Assertion failed: Node is left without a primary reference');
    }
    // Disconnects this node from its target object, effectively
    // removing it from the RModel system
    removeNode() {
        // If the node has an id, remove it from the root
        if (this.id) {
            this.root.setNodeById(this.id, null);
        }
        // Go through all of the node's references and remove them
        for (const property in this.target) {
            const val = this.target[property];
            const childNode = RMNode.getNodeForValue(val);
            if (childNode != null) {
                childNode.removeReference(this, property);
            }
        }
        if (this.target != null) {
            RMNode.deleteNode(this.target);
            this.disconnected = true;
        }
        // FIXME - clear out all of the values in the node
        this.changeListeners = null;
        // Disconnect and remove all computed properties
        const computedProperties = this.computedProperties;
        if (computedProperties != null) {
            for (const computedProperty of computedProperties) {
                computedProperty.disconnect();
            }
        }
        this.computedProperties = null;
        // Remove the immutable values
        this.immutableValue = null;
        this.newImmutableValue = null;
        this._immutableTracker = null;
    }
    //--------------------------------------------------
    // Computed properties
    // Adds a computed property, which will set the given property using
    // the result of the given function, tracking dependencies so that
    // if any of those dependencies change, the function will be called
    // again and the property's value set again.
    //
    // By default, changes to dependencies will be "buffered" until the
    // end of the current "tick", at which point the property will be
    // recomputed.  This behavior can be changed by specifying the
    // "immediate" option, which will force the property to be
    // recomputed immediately every time any change is made to any
    // dependency.
    //
    // A property can only have one associated computed property at a
    // time, so calling this will remove any existing computed property
    // with the same property name.
    addComputedProperty(property, f, options) {
        // Replace any existing property
        this.removeComputedProperty(property);
        // Add the property
        const targetObject = RMNode.toExternalValue(this);
        const computedProperty = new RMComputedProperty(this, targetObject, property, f, options);
        if (this.computedProperties == null) {
            this.computedProperties = [computedProperty];
        }
        else {
            this.computedProperties.push(computedProperty);
        }
        // Trigger it to compute and assign its value
        computedProperty.computeAndAssignValue();
    }
    // Removes any existing computed property for the given property
    // name.  Note that this will not delete or change the existing
    // value of the property.
    removeComputedProperty(property) {
        const computedProperties = this.computedProperties;
        if (computedProperties != null) {
            for (let i = 0; i < computedProperties.length; i++) {
                const computedProperty = computedProperties[i];
                if (computedProperty.property == property) {
                    computedProperties.splice(i, 1);
                    computedProperty.disconnect();
                    return;
                }
            }
        }
    }
    //--------------------------------------------------
    // Id's
    // Sets or changes the id of this object, registering the change
    // with the id-to-object mapping stored in the root
    setId(id) {
        const oldId = this.id;
        if (oldId != id) {
            this.assignId(id);
            // Remove the old mapping (if any), then set the new value on
            // the root
            const r = this.root;
            if (oldId != null) {
                r.setNodeById(oldId, null);
            }
            if (r.hasNodeWithId(id)) {
                throw new Error(`Attempt to set or add two objects with the same id '${id}' in the same tree`);
            }
            r.setNodeById(id, this);
        }
    }
    // Returns the id assigned to this object, null if no id has been
    // assigned
    getId() {
        RMDependencyTrackers.addIdDependency(this);
        return this.id;
    }
    // Removes the id assigned to this object, registering the change
    // with the id-to-object mapping stored in the root
    deleteId() {
        const oldId = this.id;
        if (oldId != null) {
            this.assignId(null);
            // Set the value on the mapping at the root
            this.root.setNodeById(oldId, null);
        }
    }
    assignId(id) {
        const oldId = this.id;
        this.id = id;
        const newId = this.id;
        if (oldId !== newId) {
            this.notifyIdChangeListeners(oldId, newId);
        }
    }
    // Consults the id-to-object mapping stored in the root and returns
    // the object with the given id, or null if not found
    findById(id) {
        RMDependencyTrackers.addFindByIdDependency(this, id);
        const node = this.findNodeById(id);
        if (node != null) {
            return RMNode.toExternalValue(node);
        }
        else {
            return null;
        }
    }
    // Consults the id-to-object mapping stored in the root and returns
    // the object with the given id, or null if not found
    findNodeById(id) {
        const nodesById = this.root.nodesById;
        if (nodesById != null) {
            return nodesById[id];
        }
        else {
            return null;
        }
    }
    // Takes any nodesById settings on the current node, and merges them
    // into the newRoot, removing them from the oldRoot
    mergeNodesById(newRoot) {
        const nodesById = this.nodesById;
        if (nodesById != null) {
            // Go through all the mappings, transferring them to the new
            // root
            for (const id in nodesById) {
                const node = nodesById[id];
                if (node != null) {
                    if (newRoot.hasNodeWithId(id)) {
                        throw new Error(`Attempt to add on object with the same id '${id}' as an object already in the tree`);
                    }
                    else {
                        newRoot.setNodeById(id, node);
                    }
                }
            }
        }
    }
    // Handles the mechanics of updating the mapping from id to node
    setNodeById(id, value) {
        if (value == null) {
            if (this.nodesById != null && this.nodesById.hasOwnProperty(id)) {
                const oldValue = this.nodesById[id];
                delete this.nodesById[id];
                this.notifyFindByIdChangeListeners(id, oldValue, null);
            }
        }
        else {
            if (this.nodesById == null) {
                this.nodesById = {};
            }
            const oldValue = this.nodesById[id];
            this.nodesById[id] = value;
            this.notifyFindByIdChangeListeners(id, oldValue, value);
        }
    }
    // Returns true if this has a mapping from id to node
    hasNodeWithId(id) {
        return this.nodesById != null && this.nodesById.hasOwnProperty(id);
    }
    //--------------------------------------------------
    // Immutable
    //
    // An RMNode can maintain an immutable value equivalent to its
    // target value. If a change is made to the target value, then a new
    // shallow copy of the immutable value is created and the change is
    // applied to that copy.  Then, all of the referrers are similarly
    // modified so that they point to the new copy - they are also
    // modified by making a shallow copy that is modified.  This
    // continues until the "immutable root" is reached, which is the
    // node previously designated by calling setImmutable(), at which
    // point the ImmutableListener function is invoked.
    //
    // Because a single operation can modify multiple objects
    // (especially if computed properties are involved), the above
    // process does not immediately call the listener.  Instead, changes
    // are "buffered" until the next "tick".  If a change is made to an
    // object that was already changed in the current "tick", then that
    // change is applied to the current shallow copy in use, as opposed
    // to creating a new shallow copy.
    //
    // Each object, therefore, keeps its immutable value, and possibly
    // the shallow copy that is being modified during the current
    // "tick".  Once the "tick" is over, all of those temporary shallow
    // copies are moved over to become new immutable values, and the
    // listener is notified.  The RMImmutableTracker manages this
    // process.
    // Sets this node and all of its descendants to maintain an
    // immutable copy.  If the node or its descendants are modified,
    // then the listener will be notified of the new immutable copy
    // value.
    //
    // This returns the initial immutable copy of the object
    setImmutable(listener) {
        if (this.immutableTracker != null) {
            // FIXME test this
            throw new Error('setImmutable has already been called on this object or one of its ancestors');
        }
        // Create the RMImmutableTracker
        this._immutableTracker = new RMImmutableTracker(this, listener);
        // Create and return the immutable copy of this value
        this.getOrCreateImmutableValue();
        if (this.immutableValue == null) {
            throw new Error('Assertion failed: immutableValue is null');
        }
        return this.immutableValue;
    }
    // Returns the RMImmutableTracker in effect for this node
    get immutableTracker() {
        // FIXME - test this
        for (let n = this; n != null; n = n.parent) {
            const it = n._immutableTracker;
            if (it != null) {
                return it;
            }
        }
        return null;
    }
    // Returns true if this node is in an area of the tree that is
    // maintaining an immutable copy
    get hasImmutableTracker() {
        return this.immutableTracker != null;
    }
    // Creates and returns the immutable copy of this node's value
    getOrCreateImmutableValue() {
        if (this.immutableValue == null) {
            // Create a deep copy of the target
            const target = this.target;
            const val = this.prepareImmutableCopy(target);
            for (const k in target) {
                const v = target[k];
                const n = RMNode.getNodeForValue(v);
                if (n != null && n.parent === this) {
                    val[k] = n.getOrCreateImmutableValue();
                }
                else {
                    val[k] = v;
                }
            }
            this.immutableValue = val;
        }
        return this.immutableValue;
    }
    // Creates a new object that can be used as a copy of the given
    // object
    prepareImmutableCopy(obj) {
        // Without the "any", flow complains about treating Array as an
        // object, and assigning RMNODE_KEY
        const ret = (Array.isArray(obj)) ? Array(obj.length) : {};
        // Set the immutable node to point back to this node, so that
        // calling RModel(...) on it will return the mutable proxy
        Object.defineProperty(ret, RMNODE_KEY, { value: this, enumerable: false, writable: true, configurable: true });
        return ret;
    }
    // Called by the RMImmutableTracker at the end of the current 'tick'
    // to indicate that the node can now put the new immutable value
    // into use
    flushImmutableChanges() {
        this.immutableValue = this.newImmutableValue;
        this.newImmutableValue = null;
    }
    // Called when mutating the value of this object.  This creates a
    // shallow copy of the object's current immutable value.  It then
    // notifies all of the referrers to also prepareImmutableChange, and
    // changes their referring properties to point to the new shallow
    // copy.
    //
    // If a new immutable value is in place, then that is returned.
    //
    // This does nothing if this object is not maintaining an immutable
    // copy, or has already been prepared.  It returns null in that
    // case.
    prepareImmutableChange() {
        const immutableTracker = this.immutableTracker;
        // Check that this is an immutable object that hasn't already been
        // prepared
        if (immutableTracker != null && this.newImmutableValue == null) {
            // Make a shallow copy of the immutable value
            const oldValue = this.immutableValue;
            if (oldValue == null) {
                throw new Error('Assertion failed: immutableValue should not be null');
            }
            const newValue = this.prepareImmutableCopy(oldValue);
            Object.assign(newValue, oldValue);
            this.newImmutableValue = newValue;
            // Notify the immutableTracker
            immutableTracker.addChangedNode(this);
            // Branch out to the referrers
            this.prepareImmutableChangeReferrers(newValue);
        }
        return this.newImmutableValue;
    }
    // Prepares all referrers to point to the new immutable value
    prepareImmutableChangeReferrers(newValue) {
        if (this.primaryReference != null) {
            this.prepareImmutableChangeReferrer(this.primaryReference, newValue);
        }
        if (this.secondaryReferences != null) {
            for (const ref of this.secondaryReferences) {
                this.prepareImmutableChangeReferrer(ref, newValue);
            }
        }
    }
    // Prepares a referrer to point to the new immutable value
    prepareImmutableChangeReferrer(ref, newValue) {
        // Set up the referrer to have a new immutable value
        const refObj = ref.referrer.prepareImmutableChange();
        // Change that immutable value to this object's new immutable
        // value
        if (refObj != null) {
            refObj[ref.property] = newValue;
        }
    }
    // Called by proxySet to perform the corresponding change in the
    // immutable copy being maintained by the object
    immutableSetProperty(property, value) {
        const nvalue = this.prepareImmutableChange();
        if (nvalue != null) {
            const n = RMNode.getNodeForValue(value);
            if (n == null) {
                nvalue[property] = value;
            }
            else {
                nvalue[property] = n.getOrCreateImmutableValue();
            }
        }
    }
    // Called by proxyDelete to perform the corresponding change in the
    // immutable copy being maintained by the object
    immutableDeleteProperty(property) {
        const nvalue = this.prepareImmutableChange();
        if (nvalue != null) {
            delete nvalue[property];
        }
    }
    // Used by the array proxy functions to perfom a corresponding
    // change in the immutable copy of an array
    immutableApplyFunction(func, args) {
        const nvalue = this.prepareImmutableChange();
        if (nvalue != null) {
            const nargs = [];
            for (const arg of args) {
                const n = RMNode.getNodeForValue(arg);
                if (n == null) {
                    nargs.push(arg);
                }
                else {
                    nargs.push(n.getOrCreateImmutableValue());
                }
            }
            // Apply the function to the immutable value, using the new
            // arguments
            Reflect.apply(func, nvalue, nargs);
        }
    }
}
// The key on an underlying object that refers back to its RMNode
const RMNODE_KEY = Symbol('RMNODE_KEY');

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

// The main entry point into the RModel API.  An application will
// The main function used to enable a value for RModel use
const rmodelFunc = function (value) {
    return RMGlobal.toRModel(value);
};
// The API methods are attached to the main function
const rmodelApi = {
    isRoot: function (value) {
        return RMGlobal.isRoot(value);
    },
    root: function (value) {
        return RMGlobal.getRoot(value);
    },
    parent: function (value) {
        return RMGlobal.getParent(value);
    },
    property: function (value) {
        return RMGlobal.getProperty(value);
    },
    primaryReference: function (value) {
        return RMGlobal.getPrimaryReference(value);
    },
    secondaryReferences: function (value) {
        return RMGlobal.getSecondaryReferences(value);
    },
    hasRModel: function (value) {
        return RMGlobal.hasRModel(value);
    },
    managedValue: function (value) {
        return RMGlobal.getManagedValue(value);
    },
    addChangeListener: function (value, listener, options = null) {
        return RMGlobal.addChangeListener(value, listener, options);
    },
    removeChangeListener: function (value, listener, options = null) {
        return RMGlobal.removeChangeListener(value, listener, options);
    },
    findDependencies: function (func) {
        return RMGlobal.findDependencies(func);
    },
    bufferCall: function (key, f) {
        RMGlobal.bufferCall(key, f);
    },
    flushBufferedCalls: function () {
        RMGlobal.flushBufferedCalls();
    },
    addComputedProperty: function (value, property, f, options = null) {
        RMGlobal.addComputedProperty(value, property, f, options);
    },
    removeComputedProperty: function (value, property) {
        RMGlobal.removeComputedProperty(value, property);
    },
    setId: function (value, id) {
        RMGlobal.setId(value, id);
    },
    getId: function (value) {
        return RMGlobal.getId(value);
    },
    deleteId: function (value) {
        return RMGlobal.deleteId(value);
    },
    findById: function (value, id) {
        return RMGlobal.findById(value, id);
    },
    setImmutable: function (value, listener) {
        return RMGlobal.setImmutable(value, listener);
    },
};
// Combine the main function with the API
const rmodel = Object.assign(rmodelFunc, rmodelApi);

module.exports = rmodel;
