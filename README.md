# rmodel

RModel is a state management library that enables Plain Old JavasScript Objects ("POJO's") to emit events on mutation, define computed properties that update automatically, track references between objects, find objects by id, and project state changes as a series of immutable representations.  RModel is not tied to any particular UI framework, but its abilities do make it suitable for serving as the "single store" for a ReactJS application, combining the convenience of mutable state with the simplicity of React.

The easiest way to become familiar with RModel is to play with it in either a node or browser console.

RModel = require("./build/rmodel")

## Enabling an Object With RModel

Start with a JavaScript value:

```
> o = {a: "red", b: [2, 3, 4], c: {d: "blue"}}
{ a: 'red', b: [ 2, 3, 4 ], c: { d: 'blue' } }
```

and "wrap" it in an RModel:

```
> r = RModel(o)
{ a: 'red', b: [ 2, 3, 4 ], c: { d: 'blue' } }
```

This creates an RModel version of the object that is nearly indistinguishable from the original object.  You can read and write the RModel version as you would the original object:

```
> r.a = "green"
'green'
> r.b.push(13)
4
> r.b
[ 2, 3, 4, 13 ]
> r.c.d = "orange"
'orange'
> r
{ a: 'green', b: [ 2, 3, 4, 13 ], c: { d: 'orange' } }
> o
{ a: 'green', b: [ 2, 3, 4, 13 ], c: { d: 'orange' } }
```

However, the RModel version and the original object are different objects:

```
> r == o
false
```

The RModel version is effectively acting as a proxy, reading data from the original object, and writing data to the original object.

## Adding Change Listeners

Once you have the RModel version of an object, you can use it to listen for changes in the object:

```
> RModel.addChangeListener(r, e=>console.log(e), {source: "descendants"})
undefined
> r.a = "white"
{ type: 'PropertyChange',
  target: { a: 'white', b: [ 2, 3, 4, 13 ], c: { d: 'orange' } },
  property: 'a',
  oldValue: 'green',
  newValue: 'white',
  hadOwnProperty: true,
  hasOwnProperty: true,
  added: null,
  removed: null }
'white'
```

The listener will report any mutations to the object with a rich set of information, including the old and new values, whether the property was added or removed (hadOwnProperty, hasOwnProperty), and even what objects were removed from or added to the structure as a result of the mutation:

```
> r.c = {e: "yellow"}
{ type: 'PropertyChange',
  target: { a: 'white', b: [ 2, 3, 4, 13 ], c: { e: 'yellow' } },
  property: 'c',
  oldValue: { d: 'orange' },
  newValue: { e: 'yellow' },
  hadOwnProperty: true,
  hasOwnProperty: true,
  added: [ { e: 'yellow' } ],
  removed: [ { d: 'orange' } ] }
```

Changes to arrays are also detected and reported as ArrayChange events, with values similar to the Array.slice method:

```
> r.b.push(12)
{ type: 'ArrayChange',
  target: [ 2, 3, 4, 13, 12 ],
  index: 4,
  deleteCount: 0,
  insertCount: 1,
  deleted: null,
  inserted: [ 12 ],
  oldLength: 4,
  newLength: 5,
  added: null,
  removed: null }
5
```

With these events it is possible to track all changes to the data structure, implement undo/redo systems, and even transmit those changes to remote systems for saving or mirroring in another application.

This only works if you operate on the RModel version of the object, and not on the object itself:

```
> o.b.push(13)
6
> o
{ a: 'white', b: [ 2, 3, 4, 13, 12, 13 ], c: { e: 'yellow' } }
> r
{ a: 'white', b: [ 2, 3, 4, 13, 12, 13 ], c: { e: 'yellow' } }
```

The RModel version of the object still reflects the values from the original object, but because the change was not made through the RModel version, it wasn't detected and no event was fired.  When using RModel, it is advisable to avoid using the original object as much as possible - in fact, it may be best to just discard your original reference to the object so that you don't accidentally use it.

```
> o = null
> o
null
> r
{ a: 'white', b: [ 2, 3, 4, 13, 12, 13 ], c: { e: 'yellow' } }
```

## Computed Properties

You can instruct the RModel version of an object to set a property based on the result of a function call, and to update that property when the values referenced by the function change:

```
> r = RModel({x: 10, y: 20})
{ x: 10, y: 20 }
> RModel.addComputedProperty(r, "sum", v=>v.x + v.y)
undefined
> r
{ x: 10, y: 20, sum: 30 }
> r.x += 5
15
> r
{ x: 15, y: 20, sum: 35 }
```

When RModel defines a computed property, it executes the function once and sets the property's value with the result.  But as it executes that function, it also notes what objects and properties are being accessed by the function and adds listeners to those values.  If any of those listeners fires, then the function is run again, the property is set with the result, and the set of listeners is adjusted to whatever values were accessed by the function in that latest run.

By default, RModel will buffer changes before triggering computed properties, waiting until the next iteration of the JavaScript "event loop" to re-compute the values.  This prevents computed properties from being needlessly recalculated if an application is making multiple changes to an RModel.

In this example, Object.assign is used to change two properties in one call.  The changes are reported as two separate events, and after they have completed, the property has not yet been recomputed.  But then the event loop ends, and the property is recomputed once (as seen by the single change event for "sum"):

```
> RModel.addChangeListener(r, e=>console.log(e), {source: "descendants"})
undefined
> Object.assign(r, {x: 8, y: -4})
{ type: 'PropertyChange',
  target: { x: 8, y: 20, sum: 35 },
  property: 'x',
  oldValue: 15,
  newValue: 8,
  hadOwnProperty: true,
  hasOwnProperty: true,
  added: null,
  removed: null }
{ type: 'PropertyChange',
  target: { x: 8, y: -4, sum: 35 },
  property: 'y',
  oldValue: 20,
  newValue: -4,
  hadOwnProperty: true,
  hasOwnProperty: true,
  added: null,
  removed: null }
{ x: 8, y: -4, sum: 35 }
> { type: 'PropertyChange',
  target: { x: 8, y: -4, sum: 4 },
  property: 'sum',
  oldValue: 35,
  newValue: 4,
  hadOwnProperty: true,
  hasOwnProperty: true,
  added: null,
  removed: null }
> r
{ x: 8, y: -4, sum: 4 }
```

This buffering behavior can be overridden when adding the computed property.  Alternatively, you can use flushBufferedCalls() to force all buffered events to execute immediately, which may be useful when writing automated tests:

```
> Object.assign(r, {x: 9, y: -3}); RModel.flushBufferedCalls(); r
{ type: 'PropertyChange',
  target: { x: 9, y: -4, sum: 4 },
  property: 'x',
  oldValue: 8,
  newValue: 9,
  hadOwnProperty: true,
  hasOwnProperty: true,
  added: null,
  removed: null }
{ type: 'PropertyChange',
  target: { x: 9, y: -3, sum: 4 },
  property: 'y',
  oldValue: -4,
  newValue: -3,
  hadOwnProperty: true,
  hasOwnProperty: true,
  added: null,
  removed: null }
{ type: 'PropertyChange',
  target: { x: 9, y: -3, sum: 6 },
  property: 'sum',
  oldValue: 4,
  newValue: 6,
  hadOwnProperty: true,
  hasOwnProperty: true,
  added: null,
  removed: null }
{ x: 9, y: -3, sum: 6 }
```

## Setting Id's

An id may be assigned to any object in an RModel structure, allowing that object to be found from anywhere else in the RModel structure:

```
> r = RModel({a: {a1: {a2: {value: 24}}}, b: {}})
{ a: { a1: { a2: [Object] } }, b: {} }
> RModel.setId(r.a.a1.a2, "id1")
undefined
> RModel.findById(r.b, "id1")
{ value: 24 }
```

This is particularly useful if a component has been passed a portion of the state tree, but needs access to data that is stored for common use in another part of the tree.  In this example, user models are stored in a central area, while another area of the tree holds the information needed to display the current user.  Id's and computed properties tie the two areas together:

```
> r = RModel({
      models: {
          users: {
              "24": {name: "Quentin"},
              "47": {name: "Fatima"},
            }
        },
      currentUserDisplay: {
          userId: "24",
        }
    })
{ models: { users: { '24': [Object], '47': [Object] } },
  currentUserDisplay: { userId: '24' } }
> RModel.setId(r.models, "models")
undefined
> RModel.addComputedProperty(r.currentUserDisplay, "models", v=>RModel.findById(v, "models"))
undefined
> RModel.addComputedProperty(r.currentUserDisplay, "user", v=>v.models && v.models.users && v.models.users[v.userId])
undefined
> RModel.addComputedProperty(r.currentUserDisplay, "name", v=>v.user && v.user.name)
undefined
> r
{ models: { users: { '24': [Object], '47': [Object] } },
  currentUserDisplay: 
   { userId: '24',
     models: { users: [Object] },
     user: { name: 'Quentin' },
     name: 'Quentin' } }
```

Now currentUserDisplay is kept in sync with the models stored elsewhere in the tree:

```
> r.currentUserDisplay.userId = "47"
'47'
> r
{ models: { users: { '24': [Object], '47': [Object] } },
  currentUserDisplay: 
   { userId: '47',
     models: { users: [Object] },
     user: { name: 'Fatima' },
     name: 'Fatima' } }
```

Note that RModel stores the id internally - it is not exposed as a visible property.  An RModel object may have an "id" property and also be assigned an RModel id with a different value.

## Providing Immutable Values

