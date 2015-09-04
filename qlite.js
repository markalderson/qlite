var QLite = {
	isPromise: function (a_value) {
		return a_value && a_value.then && typeof a_value.then === 'function';
	},
	deferred: function () {
		return {
			resolve: function (result) {
				var promise = this.promise;
				// Wrap the resolve procedure inside a function...
				function r() {
					var arg_for_next = promise.success_callback.call(undefined, result);
					var next = promise.next;
					if (next) {
						if (QLite.isPromise(arg_for_next)) {
							arg_for_next.then(function (resolved_arg) {
								next.resolve(resolved_arg);
							});
						} else next.resolve(arg_for_next);
					}
				};
				// ...and schedule execution as soon as possible
				setTimeout(r, 0);
			},
			reject: function (reason) {
				var promise = this.promise;
				// Wrap the reject procedure inside a function...
				function r() {
					promise.error_callback(reason);
					if (next) next.reject(arg_for_next);
					promise.pending = false;
				};
				// ...and schedule execution as soon as possible
				setTimeout(r, 0);
			},
			promise: {
				success_callback: function () {}, // default: do nothing
				error_callback: function () {}, // default: do nothing
				then: function (success_callback, error_callback) {
					// Override callbacks, if provided
					if (success_callback && typeof success_callback === 'function') {
						this.success_callback = success_callback;
					}
					if (error_callback && typeof error_callback === 'function') {
						this.error_callback = error_callback;
					}

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


function foo() {
	var deferred = QLite.deferred();
	deferred.resolve('foo');
	console.log('resolved');
	return deferred.promise;
}

foo().then(function (m) {
	console.log(m);
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