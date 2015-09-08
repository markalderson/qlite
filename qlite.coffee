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
window.QLite = QLite