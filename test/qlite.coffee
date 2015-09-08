describe 'QLite', ->
  beforeEach ->
    jasmine.clock().install()
  afterEach ->
    jasmine.clock().uninstall()
  it 'allows to create promises', (done) ->
    deferred = QLite.defer()
    setTimeout (-> deferred.resolve 'Hello QLite!'; done()), 1000
    jasmine.clock().tick 1001;
    deferred.promise.then (value) -> expect(value).toEqual 'Hello QLite!'
  it 'creates promises that are rejectable', (done) ->
    deferred = QLite.defer()
    setTimeout (-> deferred.reject 'I am rejecting you!'; done()), 1000
    jasmine.clock().tick 1001;
    deferred.promise.fail (value) -> expect(value).toEqual 'I am rejecting you!'
  it 'creates promises that are chainable', (done) ->
    deferred = QLite.defer()
    setTimeout (-> deferred.resolve 1; done()), 1000
    jasmine.clock().tick 1001;
    increment = (x) -> x + 1
    deferred.promise.then(increment).then(increment).then (value) -> expect(value).toEqual 3
  it 'creates promises that support multiple calls to _then_ method', (done) ->
    deferred = QLite.defer()
    setTimeout (-> deferred.resolve(); done()), 1000
    jasmine.clock().tick 1001;
    c1 = ->
    c2 = ->
    expect(c1).not.toHaveBeenCalled()
    expect(c2).not.toHaveBeenCalled()
    deferred.promise.then(c1).then -> expect(c1).toHaveBeenCalled()
    deferred.promise.then(c2).then -> expect(c2).toHaveBeenCalled()
  it 'properly handles callback exceptions with rejection', (done) ->
    deferred = QLite.defer()
    setTimeout (-> deferred.resolve(); done()), 1000
    jasmine.clock().tick 1001;
    deferred.promise.then(-> throw 'I am throwing!').fail (reason) -> expect(reason).toEqual 'I am throwing!'
  it 'works also when _resolve_ is called before _then_', ->
    deferred = QLite.defer()
    deferred.resolve()
    c = ->
    deferred.promise.then -> expect(c).not.toHaveBeenCalled()
  it 'works also when _reject_ is called before _then_', ->
    deferred = QLite.defer()
    deferred.reject()
    c = ->
    deferred.promise.fail -> expect(c).toHaveBeenCalled()
  it 'offers a _all_ method to combine multiple promises', ->
    d1 = QLite.defer()
    d2 = QLite.defer()
    d3 = QLite.defer()
    combined = QLite.all [d1.promise, d2.promise, d2.promise]
    c = ->
    combined.then c
    d1.promise.then -> expect(c).not.toHaveBeenCalled()
    d1.resolve()