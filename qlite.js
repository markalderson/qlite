var QLite = {
	isPromise: function (a_value) {
		return a_value && a_value.then && typeof a_value.then === 'function';
	},
	deferred: function () {
		function handleCallbackPromise(got_to_resolve, this_promise, callback_promise) {
			var next = this_promise.next;
			callback_promise.then(
				// Success
				function (next_result) {
					if (got_to_resolve) next.resolve(next_result);
					else next.reject(next_result);
				},
				// Error
				function (next_reason) {
					next.reject(next_reason);
				}
			);
		}

		return {
			resolve: function (result) {
				var promise = this.promise;
				// Wrap the resolve procedure inside a function...
				function res() {
					var next = promise.next;
					var arg_for_next;
					try {
						arg_for_next = promise.success_callback(result);
						if (next) {
							if (QLite.isPromise(arg_for_next)) {
								var got_to_resolve = true;
								handleCallbackPromise(got_to_resolve, promise, arg_for_next);
							} else next.resolve(arg_for_next);
						}
					} catch (error) {
						if (next) next.reject(error);
					}
				};
				// ...and wait until client code terminates
				setTimeout(res, 0);
			},
			reject: function (reason) {
				var promise = this.promise;
				// Wrap the reject procedure inside a function...
				function rej() {
					var next = promise.next;
					var arg_for_next;
					try {
						arg_for_next = promise.error_callback(reason);
						if (next) {
							if (QLite.isPromise(arg_for_next)) {
								var got_to_resolve = false;
								handleCallbackPromise(got_to_resolve, promise, arg_for_next);
							} else next.reject(arg_for_next);
						}
					} catch (error) {
						if (next) next.reject(error);
					}
				};
				// ...and wait until client code terminates
				setTimeout(rej, 0);
			},
			promise: {
				success_callback: function () {}, // default: do nothing
				error_callback: function () {}, // default: do nothing
				then: function (success_callback, error_callback) {
					// Override callbacks, if provided
					if (success_callback) this.success_callback = success_callback;
					if (error_callback) this.error_callback = error_callback;

					// Return new chained promise
					this.next = QLite.deferred();
					return this.next.promise;
				}
			}
		};
	}
};

function asyncMessage(message, wait) {
	var deferred = QLite.deferred();
	setTimeout(function () {
		deferred.resolve(message);
	}, wait);
	return deferred.promise;
}


function syncMessage(message) {
	var deferred = QLite.deferred();
	deferred.resolve(message);
	return deferred.promise;
}

function failingAsyncMessage(message, wait) {
	var deferred = QLite.deferred();
	setTimeout(function () {
		deferred.reject(message);
	}, wait);
	return deferred.promise;
}

asyncMessage('yo', 1000).then(function () {
	throw 'nope';
}).then(function (m) {
	console.log('ok: ' + m);
}, function (m) {
	console.log('error: ' + m);
});

/*
var yay_promise = asyncMessage('yay', 1000);

yay_promise.
	then(function (result) {
		console.log(result);
	});

yay_promise.
	then(function (result) {
		console.log(result);
	});
*/