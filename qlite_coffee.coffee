QLite =
	defer: ->
		deferred =
			# Private Implementation
			private:
				resolve_callbacks: []
				reject_callbacks: []
				chained_deferreds: []
			# Public API
			isPromise: (value) ->
				# Everything with a then method is
				# considered a promise.
				value?.then? and typeof value.then is 'function'
			resolve: (value) ->
				for resolve_callback in @private.resolve_callbacks
					callback_result = resolve_callback value
					if @isPromise callback_result
						callback_result.then((callback_value) -> 
							for chained_deferred in @private.chained_deferreds
								chained_deferred.resolve callback_value,
						(callback_reason) -> 
							for chained_deferred in @private.chained_deferreds
								chained_deferred.reject callback_reason
						)
					else for chained_deferred in @private.chained_deferreds
						chained_deferred.resolve callback_result
			reject: 'TODO'
			promise:
				then: (onFullfilled, onRejected) ->
					deferred.private.resolve_callbacks.push onFullfilled if onFullfilled?
					deferred.private.reject_callbacks.push onRejected if onRejected?
					chained_deferred = QLite.defer()
					deferred.private.chained_deferreds.push chained_deferred
					chained_deferred

deferred = QLite.defer()
deferred.promise.then (-> {})
deferred.resolve 2