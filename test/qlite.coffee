describe 'QLite', ->
  beforeEach ->
    jasmine.clock().install()
  afterEach ->
    jasmine.clock().uninstall()
  it 'allows to create promises', ->
    deferred = QLite.defer()
    setTimeout (-> deferred.resolve 'Hello QLite!'), 1000
    c = jasmine.createSpy 'c'
    deferred.promise.then c
    expect(c).not.toHaveBeenCalled()
    jasmine.clock().tick 1001
    expect(c).toHaveBeenCalledWith 'Hello QLite!'
  it 'creates promises that are rejectable', ->
    deferred = QLite.defer()
    setTimeout (-> deferred.reject 'I am rejecting you!'), 1000
    c = jasmine.createSpy 'c'
    deferred.promise.then null, c
    expect(c).not.toHaveBeenCalled()
    jasmine.clock().tick 1001
    expect(c).toHaveBeenCalledWith 'I am rejecting you!'
  it 'creates deferred objects with a _fail(x)_ method as a shorthand for _then(null, x)_', ->
    deferred = QLite.defer()
    setTimeout (-> deferred.reject 'I am rejecting you!'), 1000
    c = jasmine.createSpy 'c'
    deferred.promise.fail c
    expect(c).not.toHaveBeenCalled()
    jasmine.clock().tick 1001
    expect(c).toHaveBeenCalledWith 'I am rejecting you!'
  it 'creates deferred objects with a _fin(x)_ method as a shorthand for _then(x, x)_', ->
    # First, with resolve
    deferred = QLite.defer()
    setTimeout (-> deferred.resolve 'I am resolving!'), 1000
    c1 = jasmine.createSpy 'c1'
    deferred.promise.fin c1
    expect(c1).not.toHaveBeenCalled()
    jasmine.clock().tick 1001
    expect(c1).toHaveBeenCalledWith 'I am resolving!'
    # Then with reject
    deferred = QLite.defer()
    setTimeout (-> deferred.reject 'I am rejecting!'), 1000
    c2 = jasmine.createSpy 'c2'
    deferred.promise.fin c2
    expect(c2).not.toHaveBeenCalled()
    jasmine.clock().tick 1001
    expect(c2).toHaveBeenCalledWith 'I am rejecting!'
  it 'creates promises that are chainable', ->
    deferred = QLite.defer()
    setTimeout (-> deferred.resolve 1), 1000
    increment = (x) -> x + 1
    c = jasmine.createSpy 'c'
    deferred.promise.then(increment).then(increment).then c
    expect(c).not.toHaveBeenCalled()
    jasmine.clock().tick 1001
    expect(c).toHaveBeenCalledWith 3
  it 'deals properly with callbakcks that return promises', ->
    s = jasmine.createSpy 's'
    incrementAsync = (x) ->
      d = QLite.defer()
      setTimeout (-> d.resolve x + 1), 1000
      return d.promise
    incrementSync = (x) -> x
    incrementAsync(1).then(incrementAsync).then(incrementAsync).then s
    jasmine.clock().tick 3001
    expect(s).toHaveBeenCalledWith 4
  it 'creates promises that support multiple calls to _then_ method', ->
    deferred = QLite.defer()
    setTimeout (-> deferred.resolve()), 1000
    c1 = jasmine.createSpy 'c1'
    c2 = jasmine.createSpy 'c2'
    deferred.promise.then c1
    deferred.promise.then c2
    expect(c1).not.toHaveBeenCalled()
    expect(c2).not.toHaveBeenCalled()
    jasmine.clock().tick 1001
    expect(c1).toHaveBeenCalled()
    expect(c2).toHaveBeenCalled()
  it 'properly handles callback exceptions with rejection', ->
    deferred = QLite.defer()
    setTimeout (-> deferred.resolve()), 1000
    c = jasmine.createSpy 'c'
    deferred.promise.then(-> throw 'I am throwing!').fail c
    expect(c).not.toHaveBeenCalled()
    jasmine.clock().tick 1001
    expect(c).toHaveBeenCalledWith 'I am throwing!'
  it 'works also even if _resolve_ is called before _then_', ->
    deferred = QLite.defer()
    deferred.resolve 'Yo!'
    c = jasmine.createSpy 'c'
    expect(c).not.toHaveBeenCalled()
    deferred.promise.then c
    jasmine.clock().tick 1
    expect(c).toHaveBeenCalledWith 'Yo!'
  it 'creates promises that once settled can\'t be fulfilled / rejected again', ->
    # First, with resolve
    deferred = QLite.defer()
    c1 = jasmine.createSpy 'c1'
    deferred.promise.then c1
    deferred.resolve 'I am resolving!'
    deferred.resolve 'I am resolving again!'
    deferred.reject 'I am rejecting!'
    expect(c1).not.toHaveBeenCalled()
    jasmine.clock().tick 1
    expect(c1).toHaveBeenCalledWith 'I am resolving!'
    expect(c1).not.toHaveBeenCalledWith 'I am resolving again!'
    expect(c1).not.toHaveBeenCalledWith 'I am rejecting!'
    # Again, but with rejection
    deferred = QLite.defer()
    c2 = jasmine.createSpy 'c2'
    deferred.promise.fail c2
    deferred.reject 'I am rejecting!'
    deferred.resolve 'I am resolving!'
    deferred.reject 'I am rejecting again!'
    jasmine.clock().tick 1
    expect(c2).toHaveBeenCalledWith 'I am rejecting!'
    expect(c2).not.toHaveBeenCalledWith 'I am resolving!'
    expect(c2).not.toHaveBeenCalledWith 'I am rejecting again!'
  it 'offers a _all_ method that creates a promise fulfilling when all passed promises do', ->
    [d1, d2, d3] = (QLite.defer() for i in [1..3])
    combined = QLite.all [d1.promise, d2.promise, d3.promise]
    d1.resolve 1
    d2.resolve 2
    d3.resolve 3
    c = jasmine.createSpy 'c'
    combined.then c
    expect(c).not.toHaveBeenCalled()
    jasmine.clock().tick 1
    expect(c).toHaveBeenCalledWith [1, 2, 3]
  it 'offers a _all_ method that creates a promise rejecting as soon as one of the passed promises do', ->
    [d1, d2, d3] = (QLite.defer() for i in [1..3])
    combined = QLite.all [d1.promise, d2.promise, d3.promise]
    d1.resolve 1
    d2.reject 'I am rejecting!'
    d3.resolve 3
    c = jasmine.createSpy 'c'
    combined.fail c
    expect(c).not.toHaveBeenCalled()
    jasmine.clock().tick 1
    expect(c).toHaveBeenCalledWith 'I am rejecting!'
  it 'offers a _any_ method that creates a promise fulfilling as soon as one of the passed promises do', ->
    [d1, d2, d3] = (QLite.defer() for i in [1..3])
    combined = QLite.any [d1.promise, d2.promise, d3.promise]
    d1.resolve 1
    d2.resolve 2
    d3.resolve 3
    c = jasmine.createSpy 'c'
    combined.then c
    expect(c).not.toHaveBeenCalled()
    jasmine.clock().tick 1
    expect(c).toHaveBeenCalledWith 1
  it 'offers a _any_ method that creates a promise rejecting when all passed promises do', ->
    [d1, d2, d3] = (QLite.defer() for i in [1..3])
    combined = QLite.any [d1.promise, d2.promise, d3.promise]
    d1.reject 'I am rejecting!'
    d2.reject 'I am rejecting!'
    d3.reject 'I am rejecting!'
    c = jasmine.createSpy 'c'
    combined.fail c
    expect(c).not.toHaveBeenCalled()
    jasmine.clock().tick 1
    expect(c).toHaveBeenCalledWith undefined
  it 'offers a _isPromise_ method that tests if an object is a promise', ->
    expect(QLite.isPromise { then: -> }).toEqual true
    expect(QLite.isPromise { foo: -> }).toEqual false
    expect(QLite.isPromise {}).toEqual false
    expect(QLite.isPromise 'foo').toEqual false
    expect(QLite.isPromise null).toEqual false
    expect(QLite.isPromise undefined).toEqual false
    expect(QLite.isPromise true).toEqual false
    expect(QLite.isPromise false).toEqual false
    expect(QLite.isPromise 1).toEqual false