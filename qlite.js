var QLite = {
	isPromise: function (a_value) {
		return a_value && a_value.then && typeof a_value.then === 'function';
	},
	defer: function () {
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
				var chained_deferreds = promise.chained_deferreds;
				for (var i = 0; i < chained_deferreds.length; i++) {
					// Wrap the resolve procedure inside a function...
					var next = chained_deferreds[i];
					var callback = promise.success_callbacks[i];
					if (callback) {
						function res() {
							var arg_for_next;
							try {
								arg_for_next = callback(result);
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
					}
				}
			},
			reject: function (reason) {
				var promise = this.promise;
				var chained_deferreds = promise.chained_deferreds;
				for (var i = 0; i < chained_deferreds.length; i++) {
					var next = chained_deferreds[i];
					var callback = promise.error_callbacks[i];
					if (callback) {
						// Wrap the reject procedure inside a function...
						function rej() {
							var arg_for_next;
							try {
								arg_for_next = callback(reason);
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
					}
				}
			},
			promise: {
				success_callbacks: [],
				error_callbacks: [],
				chained_deferreds: [],
				then: function (success_callback, error_callback) {
					if (success_callback) this.success_callbacks.push(success_callback);
					if (error_callback) this.error_callbacks.push(error_callback);

					var chained_deferred = QLite.defer();
					this.chained_deferreds.push(chained_deferred);
					return chained_deferred.promise;
				}
			}
		};
	}
};

function asyncMessage(message, wait) {
	var deferred = QLite.defer();
	setTimeout(function () {
		deferred.resolve(message);
	}, wait);
	return deferred.promise;
}


function syncMessage(message) {
	var deferred = QLite.defer();
	deferred.resolve(message);
	return deferred.promise;
}

function failingAsyncMessage(message, wait) {
	var deferred = QLite.defer();
	setTimeout(function () {
		deferred.reject(message);
	}, wait);
	return deferred.promise;
}

/*
asyncMessage('yo', 1000).then(function () {
	throw 'nope';
}).then(function (m) {
	console.log('ok: ' + m);
}, function (m) {
	console.log('error: ' + m);
});
*/

var a_promise = asyncMessage('yo', 1000);

a_promise.then(function (m) {
	console.log('yeay');
});


a_promise.then(function (m) {
	console.log(m.toUpperCase());
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