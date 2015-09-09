QLite =
  # Private Implementation
  private:
    # Force async behavior
    delay: (what) -> setTimeout what, 0; return
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
          ->
            which.deferred[how.with_operation] how.with_argument
            return
        # Fulfill or reject this deferred / promise
        # how = an object specifying how to settle
        # how.with_operation = 'resolve' | 'reject'
        # how.with_argument = resolve value or reject reason
        settle: (how) ->
          for chained in @chaineds
            try
              switch how.with_operation
                when 'resolve' then callback = chained.resolve_callback
                when 'reject' then callback = chained.reject_callback
                else null
              if callback?
                callback_result = callback how.with_argument
                if QLite.isPromise callback_result
                  c1 = @settleChained chained, { with_operation: how.with_operation, with_argument: callback_result }
                  c2 = @settleChained chained, { with_operation: 'reject', with_argument: callback_result }
                  callback_result.then c1, c2
                else do @settleChained chained, { with_operation: how.with_operation, with_argument: callback_result }
            catch error
              do @settleChained chained, { with_operation: 'reject', with_argument: error }
          return
      # Public API
      # Resolve the associated promise
      resolve: (value) ->
        myself = @
        QLite.private.delay -> myself.private.settle { with_operation: 'resolve', with_argument: value }
      # Reject the associated promise
      reject: (reason) ->
        myself = @
        QLite.private.delay -> myself.private.settle { with_operation: 'reject', with_argument: reason }
      # The associated promise
      promise:
        # Assign callbacks that will handle fulfillment / rejection
        then: (onFulfilled, onRejected) ->
          chained = { deferred: QLite.defer() }
          chained.resolve_callback = onFulfilled if onFulfilled?
          chained.reject_callback = if onRejected? then onRejected else (reason) -> reason
          deferred.private.chaineds.push chained
          chained.deferred.promise
        # Only assign rejection callback
        fail: (onRejected) ->
          @then null, onRejected
          return
        # Assign the same callback both for fulfillment and for rejection
        finally: (onSettled) ->
          @then onSettled, onSettled
          return
  # Create a promise from an array of promises.
  # Fulfills when all given promises do.
  # Rejects as soon as one of the given promises does.
  # Fulfill value is an array containing the fulfill values of the given promises.
  # Reject reason is the same of the first rejecting promise.
  all: (promises) ->
    combined = QLite.defer()
    implementation =
      promises: promises
      values: []
      fulfilled: []
    check = ->
      n_fulfilled = 0
      n_fulfilled++ for fulfilled in implementation.fulfilled when fulfilled is true
      if n_fulfilled is implementation.promises.length
        combined.resolve implementation.values
      return
    notifyFulfillment = (promise, value) ->
      i = implementation.promises.indexOf promise
      implementation.fulfilled[i] = true
      implementation.values[i] = value
      check()
      return
    notifyRejection = (reason) -> combined.reject reason; return
    for promise in promises
      do (promise) ->
        promise.then ((value) -> notifyFulfillment promise, value; return), notifyRejection
        return
    combined.promise
  # Create a promise from an array of promises.
  # Fulfills as soon as one of the given promises does.
  # Rejects when all the given promises do.
  # Fulfill value is the same of the first fulfilling promise.
  # Rejection value is undefined.
  any: (promises) ->
    combined = QLite.defer()
    implementation =
      promises: promises
      rejected: []
    check = ->
      n_rejected = 0
      n_rejected++ for rejected in implementation.rejected when rejected is true
      if n_rejected is implementation.promises.length
        combined.reject undefined
      return
    notifyFulfillment = (value) -> combined.resolve value; return
    notifyRejection = (promise) ->
      i = implementation.promises.indexOf promise
      implementation.rejected[i] = true
      check()
      return
    for promise in promises
      do (promise) ->
        promise.then notifyFulfillment, (-> notifyRejection promise; return)
        return
    combined.promise
window.QLite = QLite