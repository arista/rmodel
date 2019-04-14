const rmodelInternals = require('../dist/rmodelInternals.js')
const RModel = rmodelInternals.RModel
const RMNode = rmodelInternals.RMNode
const RMChangeListener = rmodelInternals.RMChangeListener

// Tests adding and removing listeners

describe('rmodel change listeners', ()=>{
  describe('adding and removing change listeners', ()=>{
    let r = null
    let node = null
    let listener = null
    let listener2 = null
    let options1 = null
    let options2 = null
    beforeEach(()=>{
      r = RModel({})
      node = RMNode.getNodeForObject(r)
      listener = (e)=> {}
      listener2 = (e)=> {}
      options1 = { source: 'descendants', property: 'x'}
      options2 = { property: 'y'}
    })
    describe('with no listeners added', ()=>{
      it('should have null changeListeners', ()=>{
        expect(node.changeListeners).toEqual(null)
      })
    })
    describe('addChangeListener', ()=>{
      describe('when no listeners have been added yet', ()=>{
        it('should add the listener', ()=>{
          RModel.addChangeListener(r, listener, options1)
          const el = new RMChangeListener(listener, options1)
          expect(node.changeListeners).toEqual([ el ])
        })
      })
      describe('when a listener has already been added', ()=>{
        it('should add the listener', ()=>{
          RModel.addChangeListener(r, listener, options1)
          RModel.addChangeListener(r, listener2, options2)
          const el = new RMChangeListener(listener, options1)
          const el2 = new RMChangeListener(listener2, options2)
          expect(node.changeListeners).toEqual([ el, el2 ])
        })
      })
      describe('when the same listener has already been added with the same options', ()=>{
        it('should add the listener', ()=>{
          RModel.addChangeListener(r, listener, options1)
          RModel.addChangeListener(r, listener2, options2)
          RModel.addChangeListener(r, listener, options1)
          const el = new RMChangeListener(listener, options1)
          const el2 = new RMChangeListener(listener2, options2)
          expect(node.changeListeners).toEqual([ el, el2, el ])
        })
      })
      describe('with no options', ()=>{
        it('should add the listener with no options', ()=>{
          RModel.addChangeListener(r, listener)
          const el = new RMChangeListener(listener, null)
          expect(node.changeListeners).toEqual([ el ])
        })
      })
    })
    describe('removeChangeListener', ()=>{
      describe('when no listener has been added', ()=>{
        it('should do nothing', ()=>{
          RModel.removeChangeListener(r, listener)
          expect(node.changeListeners).toEqual(null)
        })
      })
      describe('when a listener has been added with no options', ()=>{
        let el = null
        beforeEach(()=>{
          RModel.addChangeListener(r, listener)
          el = new RMChangeListener(listener, null)
        })
        describe('removing that listener with no options', ()=>{
          it('should remove the listener', ()=>{
            RModel.removeChangeListener(r, listener)
            expect(node.changeListeners).toEqual([])
          })
        })
        describe('removing a different listener with no options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener2)
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with blank options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with values', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, options1)
            expect(node.changeListeners).toEqual([ el ])
          })
        })
      })
      describe('when a listener has been added with a property option', ()=>{
        let el = null
        beforeEach(()=>{
          RModel.addChangeListener(r, listener, { property: 'x'})
          el = new RMChangeListener(listener, { property: 'x'})
        })
        describe('removing that listener with no options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener)
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing a different listener with matching options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener2, { property: 'x' })
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with blank options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with property and source', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {property: 'x', source: 'self'})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with different property and no source', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {property: 'y'})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with matching property and no source', ()=>{
          it('should remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {property: 'x'})
            expect(node.changeListeners).toEqual([ ])
          })
        })
      })
      describe('when a listener has been added with a source option', ()=>{
        let el = null
        beforeEach(()=>{
          RModel.addChangeListener(r, listener, { source: 'self' })
          el = new RMChangeListener(listener, { source: 'self' })
        })
        describe('removing that listener with no options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener)
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing a different listener with matching options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener2, { source: 'self' })
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with blank options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with source and property', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {source: 'self', property: 'x'})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with different source and no property', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {source: 'children'})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with matching source and no property', ()=>{
          it('should remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {source: 'self'})
            expect(node.changeListeners).toEqual([ ])
          })
        })
      })
      describe('when a listener has been added with property and a source options', ()=>{
        let el = null
        beforeEach(()=>{
          RModel.addChangeListener(r, listener, { property: 'x', source: 'self'})
          el = new RMChangeListener(listener, { property: 'x', source: 'self'})
        })
        describe('removing that listener with no options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener)
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing a different listener with matching options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener2, { property: 'x', source: 'self' })
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with blank options', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with matching source and property', ()=>{
          it('should remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, { source: 'self', property: 'x'})
            expect(node.changeListeners).toEqual([ ])
          })
        })
        describe('removing that listener with options with different source and matching property', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {source: 'children', property: 'x'})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with no source and matching property', ()=>{
          it('should not remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {property: 'x'})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with matching source and different property', ()=>{
          it('should remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {source: 'children', property: 'y'})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
        describe('removing that listener with options with matching source and no property', ()=>{
          it('should remove the listener', ()=>{
            RModel.removeChangeListener(r, listener, {source: 'self'})
            expect(node.changeListeners).toEqual([ el ])
          })
        })
      })
      describe('when there are multiple matching listeners', ()=>{
        it('should remove the last one', ()=>{
          RModel.addChangeListener(r, listener)
          RModel.addChangeListener(r, listener2)
          RModel.addChangeListener(r, listener)
          const el = new RMChangeListener(listener, null)
          const el2 = new RMChangeListener(listener2, null)
          expect(node.changeListeners).toEqual([el, el2, el])
          RModel.removeChangeListener(r, listener)
          expect(node.changeListeners).toEqual([el, el2])
        })
      })
    })
  })
  describe('getInterestedPropertyChangeListeners', ()=>{
    let r = null
    let r2 = null
    let r3 = null
    let node = null
    let node2 = null
    let node3 = null
    let listener = null
    let listener2 = null
    beforeEach(()=>{
      r = RModel({})
      r2 = RModel({})
      r3 = RModel({})
      r.a = r2
      r2.b = r3
      node = RMNode.getNodeForObject(r)
      node2 = RMNode.getNodeForObject(r2)
      node3 = RMNode.getNodeForObject(r3)
      listener = (e)=> {}
      listener2 = (e)=> {}
    })
    describe('with no options specified for the listeners', ()=>{
      beforeEach(()=>{
        RModel.addChangeListener(r, listener)
      })
      describe('when the source is the listener node', ()=>{
        it('should include the listener', ()=>{
          const ls = node.getInterestedPropertyChangeListeners('x')
          expect(ls).toEqual([node.changeListeners[0]])
        })
      })
      describe('when the source is a child node', ()=>{
        it('should not include the listener', ()=>{
          const ls = node2.getInterestedPropertyChangeListeners('x')
          expect(ls).toEqual(null)
        })
      })
      describe('when the source is a grandchild', ()=>{
        it('should not include the listener', ()=>{
          const ls = node3.getInterestedPropertyChangeListeners('x')
          expect(ls).toEqual(null)
        })
      })
    })
    describe('with options specified for the listeners', ()=>{
      describe('with no property', ()=>{
        describe('with no source', ()=>{
          beforeEach(()=>{
            RModel.addChangeListener(r, listener, {})
          })
          describe('when the source is the listener node', ()=>{
            it('should include the listener', ()=>{
              const ls = node.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual([node.changeListeners[0]])
            })
          })
          describe('when the source is a child node', ()=>{
            it('should not include the listener', ()=>{
              const ls = node2.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual(null)
            })
          })
          describe('when the source is a grandchild', ()=>{
            it('should not include the listener', ()=>{
              const ls = node3.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual(null)
            })
          })
        })
        describe('with source \'self\'', ()=>{
          beforeEach(()=>{
            RModel.addChangeListener(r, listener, {source: 'self'})
          })
          describe('when the source is the listener node', ()=>{
            it('should include the listener', ()=>{
              const ls = node.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual([node.changeListeners[0]])
            })
          })
          describe('when the source is a child node', ()=>{
            it('should not include the listener', ()=>{
              const ls = node2.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual(null)
            })
          })
          describe('when the source is a grandchild', ()=>{
            it('should not include the listener', ()=>{
              const ls = node3.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual(null)
            })
          })
        })
        describe('with source \'children\'', ()=>{
          beforeEach(()=>{
            RModel.addChangeListener(r, listener, {source: 'children'})
          })
          describe('when the source is the listener node', ()=>{
            it('should include the listener', ()=>{
              const ls = node.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual([node.changeListeners[0]])
            })
          })
          describe('when the source is a child node', ()=>{
            it('should not include the listener', ()=>{
              const ls = node2.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual([node.changeListeners[0]])
            })
          })
          describe('when the source is a grandchild', ()=>{
            it('should not include the listener', ()=>{
              const ls = node3.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual(null)
            })
          })
        })
        describe('with source \'descendants\'', ()=>{
          beforeEach(()=>{
            RModel.addChangeListener(r, listener, {source: 'descendants'})
          })
          describe('when the source is the listener node', ()=>{
            it('should include the listener', ()=>{
              const ls = node.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual([node.changeListeners[0]])
            })
          })
          describe('when the source is a child node', ()=>{
            it('should not include the listener', ()=>{
              const ls = node2.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual([node.changeListeners[0]])
            })
          })
          describe('when the source is a grandchild', ()=>{
            it('should not include the listener', ()=>{
              const ls = node3.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual([node.changeListeners[0]])
            })
          })
        })
      })
      describe('with a property specified', ()=>{
        describe('with source \'self\'', ()=>{
          beforeEach(()=>{
            RModel.addChangeListener(r, listener, {source: 'self', property: 'x'})
          })
          describe('with the specified property', ()=>{
            it('should include the listener', ()=>{
              const ls = node.getInterestedPropertyChangeListeners('x')
              expect(ls).toEqual([node.changeListeners[0]])
            })
          })
          describe('with a different property', ()=>{
            it('should not include the listener', ()=>{
              const ls = node.getInterestedPropertyChangeListeners('y')
              expect(ls).toEqual(null)
            })
          })
        })
      })
    })
    describe('with duplicate interested listeners', ()=>{
      beforeEach(()=>{
        RModel.addChangeListener(r, listener)
        RModel.addChangeListener(r, listener)
      })
      it('should include all of the listeners', ()=>{
        const ls = node.getInterestedPropertyChangeListeners('x')
        expect(ls).toEqual([
          node.changeListeners[0],
          node.changeListeners[1]
        ])
      })
    })
    describe('with multiple interested listeners at multiple levels', ()=>{
      beforeEach(()=>{
        RModel.addChangeListener(r, listener)
        RModel.addChangeListener(r2, listener)
        RModel.addChangeListener(r3, listener)
        RModel.addChangeListener(r, listener, {source: 'children', property: 'y'})
        RModel.addChangeListener(r, listener, {source: 'children'})
        RModel.addChangeListener(r2, listener, {property: 'x'})
      })
      it('should include all of the listeners', ()=>{
        const ls = node2.getInterestedPropertyChangeListeners('x')
        expect(ls).toEqual([
          node2.changeListeners[0],
          node2.changeListeners[1],
          node.changeListeners[2]
        ])
      })
    })
  })
  describe('getInterestedArrayChangeListeners', ()=>{
    // FIXME - implement this
  })
})
