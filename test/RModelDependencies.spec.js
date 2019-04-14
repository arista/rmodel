const RModel = require('../dist/rmodel.js')

describe('RModel dependency finding', ()=>{
  describe('findDependencies', ()=>{
    let val = null
    beforeEach(()=>{
      val = RModel({
        products: [
          {
            name: "lamp",
            pricing: {
              basePrice: 14.95,
              extendedWarranty: 2.95
            }
          },
          {
            name: "chair",
            pricing: {
              basePrice: 32.95,
              extendedWarranty: 4.15
            }
          },
        ]
      })
    })
    it('should find no dependencies', ()=>{
      const f = ()=>{ return 10 + 20 }
      const d = RModel.findDependencies(f)
      expect(d).toEqual([])
    })
    it('should find a single dependency', ()=>{
      const v = val.products[0]
      const f = ()=>{ return `product ${v.name}` }
      const d = RModel.findDependencies(f)
      expect(d).toEqual([
        {type: 'PropertyDependency', target: v, property: 'name'}
      ])
    })
    it('should find a dependency a level down', ()=>{
      const v = val.products[0]
      const f = ()=>{ v.pricing.basePrice }
      const d = RModel.findDependencies(f)
      expect(d).toEqual([
        {type: 'PropertyDependency', target: v, property: 'pricing'},
        {type: 'PropertyDependency', target: v.pricing, property: 'basePrice'},
      ])
    })
    it('should find multiple dependencies', ()=>{
      const v = val.products[0]
      const f = ()=>{ v.pricing.basePrice + v.pricing.extendedWarranty }
      const d = RModel.findDependencies(f)
      expect(d).toEqual([
        {type: 'PropertyDependency', target: v, property: 'pricing'},
        {type: 'PropertyDependency', target: v.pricing, property: 'basePrice'},
        {type: 'PropertyDependency', target: v.pricing, property: 'extendedWarranty'},
      ])
    })
    it('should only find a dependency once', ()=>{
      const v = val.products[0]
      const f = ()=>{ v.pricing.basePrice + v.pricing.extendedWarranty + v.pricing.basePrice }
      const d = RModel.findDependencies(f)
      expect(d).toEqual([
        {type: 'PropertyDependency', target: v, property: 'pricing'},
        {type: 'PropertyDependency', target: v.pricing, property: 'basePrice'},
        {type: 'PropertyDependency', target: v.pricing, property: 'extendedWarranty'},
      ])
    })
    it('should find array dependencies', ()=>{
      const f = ()=>{
        let total = 0
        for(const p of val.products) {
          total += p.pricing.basePrice + p.pricing.extendedWarranty
        }
        return total
      }
      const d = RModel.findDependencies(f)
      expect(d).toEqual([
        {type: 'PropertyDependency', target: val, property: 'products'},
        {type: 'PropertyDependency', target: val.products, property: 'length'},
        {type: 'PropertyDependency', target: val.products, property: '0'},
        {type: 'PropertyDependency', target: val.products[0], property: 'pricing'},
        {type: 'PropertyDependency', target: val.products[0].pricing, property: 'basePrice'},
        {type: 'PropertyDependency', target: val.products[0].pricing, property: 'extendedWarranty'},
        {type: 'PropertyDependency', target: val.products, property: '1'},
        {type: 'PropertyDependency', target: val.products[1], property: 'pricing'},
        {type: 'PropertyDependency', target: val.products[1].pricing, property: 'basePrice'},
        {type: 'PropertyDependency', target: val.products[1].pricing, property: 'extendedWarranty'},
      ])
    })
    it('should allow nested findDependencies calls to capture dependencies instead of a parent findDependencies call', ()=>{
      const nested = []
      const f = ()=>{
        for(const p of val.products) {
          const dd = RModel.findDependencies(()=>{
            const price = p.pricing.basePrice + p.pricing.extendedWarranty
          })
          nested.push(dd)
        }
      }
      const d = RModel.findDependencies(f)
      expect(d).toEqual([
        {type: 'PropertyDependency', target: val, property: 'products'},
        {type: 'PropertyDependency', target: val.products, property: 'length'},
        {type: 'PropertyDependency', target: val.products, property: '0'},
        {type: 'PropertyDependency', target: val.products, property: '1'},
      ])
      expect(nested).toEqual([
        [
          {type: 'PropertyDependency', target: val.products[0], property: 'pricing'},
          {type: 'PropertyDependency', target: val.products[0].pricing, property: 'basePrice'},
          {type: 'PropertyDependency', target: val.products[0].pricing, property: 'extendedWarranty'},
        ],
        [
          {type: 'PropertyDependency', target: val.products[1], property: 'pricing'},
          {type: 'PropertyDependency', target: val.products[1].pricing, property: 'basePrice'},
          {type: 'PropertyDependency', target: val.products[1].pricing, property: 'extendedWarranty'},
        ]
      ])
    })
    it('should track dependencies from different trees', ()=>{
      val2 = RModel({
        taxRate: 5.25
      })
      const v = val.products[0]
      const f = ()=>{ val.products[0].basePrice * (val2.taxRate + 1) }
      const d = RModel.findDependencies(f)
      expect(d).toEqual([
        {type: 'PropertyDependency', target: val, property: 'products'},
        {type: 'PropertyDependency', target: val.products, property: '0'},
        {type: 'PropertyDependency', target: val.products[0], property: 'basePrice'},
        {type: 'PropertyDependency', target: val2, property: 'taxRate'},
      ])
    })

    describe('tracking calls through RModel', ()=>{
      describe('RModel.root()', ()=>{
        it('should add the calls to root() as a dependency', ()=>{
          const f = ()=>{
            RModel.root(val.products)
            RModel.root(val)
            RModel.root(val.products)
          }
          const d = RModel.findDependencies(f)
          expect(d).toEqual([
            {type: 'PropertyDependency', target: val, property: 'products'},
            {type: 'RootDependency', target: val.products},
            {type: 'RootDependency', target: val},
          ])
        })
      })
      describe('RModel.parent()', ()=>{
        it('should add the calls to parent() as a dependency', ()=>{
          const f = ()=>{
            RModel.parent(val.products)
            RModel.parent(val)
            RModel.parent(val.products)
          }
          const d = RModel.findDependencies(f)
          expect(d).toEqual([
            {type: 'PropertyDependency', target: val, property: 'products'},
            {type: 'ParentDependency', target: val.products},
            {type: 'ParentDependency', target: val},
          ])
        })
      })
      describe('RModel.property()', ()=>{
        it('should add the calls to property() as a dependency', ()=>{
          const f = ()=>{
            RModel.property(val.products)
            RModel.property(val)
            RModel.property(val.products)
          }
          const d = RModel.findDependencies(f)
          expect(d).toEqual([
            {type: 'PropertyDependency', target: val, property: 'products'},
            {type: 'PropertyNameDependency', target: val.products},
            {type: 'PropertyNameDependency', target: val},
          ])
        })
      })
      describe('RModel.getId()', ()=>{
        it('should add the calls to getId() as a dependency', ()=>{
          const f = ()=>{
            RModel.getId(val.products)
            RModel.getId(val)
            RModel.getId(val.products)
          }
          const d = RModel.findDependencies(f)
          expect(d).toEqual([
            {type: 'PropertyDependency', target: val, property: 'products'},
            {type: 'IdDependency', target: val.products},
            {type: 'IdDependency', target: val},
          ])
        })
      })
      describe('RModel.findById()', ()=>{
        it('should add the calls to findById() as a dependency', ()=>{
          const f = ()=>{
            RModel.findById(val.products, 'a')
            RModel.findById(val, 'b')
            RModel.findById(val.products, 'a')
            RModel.findById(val.products, 'b')
            RModel.findById(val, 'a')
          }
          const d = RModel.findDependencies(f)
          expect(d).toEqual([
            {type: 'PropertyDependency', target: val, property: 'products'},
            {type: 'FindByIdDependency', target: val.products, id: 'a'},
            {type: 'RootDependency', target: val.products},
            {type: 'FindByIdDependency', target: val, id: 'b'},
            {type: 'RootDependency', target: val},
            {type: 'FindByIdDependency', target: val.products, id: 'b'},
            {type: 'FindByIdDependency', target: val, id: 'a'},
          ])
        })
      })
    })
  })
})
