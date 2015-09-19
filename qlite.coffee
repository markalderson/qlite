QLite =
  # Private Implementation
  private:
    # Force async behavior
    delay: (what) -> setTimeout what, 0
  # Public API
  # Test if value is a promise
  isPromise: (value) ->
        # Everything with a then method is
        # considered a promise.
        value?.then? and typeof value.then is 'function'
  # Construct a new deferred object (i.e. a promise wrapper)
  defer: ->
    deferred =
      # Private Implementation
      private:
        # Internal State
        chaineds: []
        # Helper Methods
        # Fulfill or reject a chained deferred object
        # Note: actually, it returns a settler function
        # which = the chained to settle
        # how = an object specifying how to settle
        # how.with_operation = 'resolve' | 'reject'
        # how.with_argument = resolve value or reject reason
        settleChained: (which, how) ->
          which.deferred[how.with_operation] how.with_argument
        # Fulfill or reject this deferred / promise
        # how = an object specifying how to settle
        # how.with_operation = 'resolve' | 'reject'
        # how.with_argument = resolve value or reject reason
        settle: (how) ->
          myself = @
          for chained in @chaineds
            do (chained) ->
              try
                switch how.with_operation
                  when 'resolve' then callback = chained.resolve_callback
                  when 'reject' then callback = chained.reject_callback
                if callback?
                  callback_result = callback how.with_argument
                  if QLite.isPromise callback_result
                    c1 = (x) -> myself.settleChained chained, { with_operation: how.with_operation, with_argument: x }
                    c2 = (x) -> myself.settleChained chained, { with_operation: 'reject', with_argument: x }
                    callback_result.then c1, c2
                  else myself.settleChained chained, { with_operation: how.with_operation, with_argument: callback_result }
              catch error
                myself.settleChained chained, { with_operation: 'reject', with_argument: error }
      # Public API
      # Resolve the associated promise
      resolve: (value) ->
        if !@promise.settled
          @promise.settled = true
          myself = @
          QLite.private.delay -> myself.private.settle { with_operation: 'resolve', with_argument: value }
      # Reject the associated promise
      reject: (reason) ->
        if !@promise.settled
          @promise.settled = true
          myself = @
          QLite.private.delay -> myself.private.settle { with_operation: 'reject', with_argument: reason }
      # The associated promise
      promise:
        # Private Implementation
        settled: false
        # Public API
        # Assign callbacks that will handle fulfillment / rejection
        then: (onFulfilled, onRejected) ->
          chained = { deferred: QLite.defer() }
          chained.resolve_callback = onFulfilled if onFulfilled?
          chained.reject_callback = if onRejected? then onRejected else (reason) -> reason
          deferred.private.chaineds.push chained
          return chained.deferred.promise
        # Only assign rejection callback
        fail: (onRejected) ->
          @then undefined, onRejected
        # Assign the same callback both for fulfillment and for rejection
        fin: (onSettled) ->
          @then onSettled, onSettled
  # Create a promise from an array of promises.
  # Fulfills when all given promises do.
  # Rejects as soon as one of the given promises does.
  # Fulfill value is an array containing the fulfill values of the given promises.
  # Reject reason is the same of the first rejecting promise.
  all: (promises) ->
    combined = QLite.defer()
    implementation =
      values: []
      fulfilled: 0
    notifyFulfillment = (promise, value) ->
      implementation.fulfilled++
      i = promises.indexOf promise
      implementation.values[i] = value
      if implementation.fulfilled is promises.length
        combined.resolve implementation.values
    notifyRejection = (reason) -> combined.reject reason
    for promise in promises
      do (promise) ->
        promise.then ((value) -> notifyFulfillment promise, value), notifyRejection
    return combined.promise
  # Create a promise from an array of promises.
  # Fulfills as soon as one of the given promises does.
  # Rejects when all the given promises do.
  # Fulfill value is the same of the first fulfilling promise.
  # Rejection value is undefined.
  any: (promises) ->
    combined = QLite.defer()
    rejected = 0
    notifyFulfillment = (value) -> combined.resolve value
    notifyRejection = ->
      rejected++
      if rejected is promises.length
        combined.reject undefined
    for promise in promises
      do (promise) ->
        promise.then notifyFulfillment, notifyRejection
    return combined.promise
switch
  when module?.exports? then module.exports = -> QLite
  when define? then define -> QLite
  when window? then window.QLite = QLite
