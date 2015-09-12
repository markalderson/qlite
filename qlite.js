(function() {
  var QLite;

  QLite = {
    "private": {
      delay: function(what) {
        return setTimeout(what, 0);
      }
    },
    isPromise: function(value) {
      return ((value != null ? value.then : void 0) != null) && typeof value.then === 'function';
    },
    defer: function() {
      var deferred;
      return deferred = {
        "private": {
          chaineds: [],
          settleChained: function(which, how) {
            return function() {
              return which.deferred[how.with_operation](how.with_argument);
            };
          },
          settle: function(how) {
            var c1, c2, callback, callback_result, chained, error, j, len, ref, results;
            ref = this.chaineds;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              chained = ref[j];
              try {
                switch (how.with_operation) {
                  case 'resolve':
                    callback = chained.resolve_callback;
                    break;
                  case 'reject':
                    callback = chained.reject_callback;
                }
                if (callback != null) {
                  callback_result = callback(how.with_argument);
                  if (QLite.isPromise(callback_result)) {
                    c1 = this.settleChained(chained, {
                      with_operation: how.with_operation,
                      with_argument: callback_result
                    });
                    c2 = this.settleChained(chained, {
                      with_operation: 'reject',
                      with_argument: callback_result
                    });
                    results.push(callback_result.then(c1, c2));
                  } else {
                    results.push(this.settleChained(chained, {
                      with_operation: how.with_operation,
                      with_argument: callback_result
                    })());
                  }
                } else {
                  results.push(void 0);
                }
              } catch (_error) {
                error = _error;
                results.push(this.settleChained(chained, {
                  with_operation: 'reject',
                  with_argument: error
                })());
              }
            }
            return results;
          }
        },
        resolve: function(value) {
          var myself;
          if (!this.promise.settled) {
            this.promise.settled = true;
            myself = this;
            return QLite["private"].delay(function() {
              return myself["private"].settle({
                with_operation: 'resolve',
                with_argument: value
              });
            });
          }
        },
        reject: function(reason) {
          var myself;
          if (!this.promise.settled) {
            this.promise.settled = true;
            myself = this;
            return QLite["private"].delay(function() {
              return myself["private"].settle({
                with_operation: 'reject',
                with_argument: reason
              });
            });
          }
        },
        promise: {
          settled: false,
          then: function(onFulfilled, onRejected) {
            var chained;
            chained = {
              deferred: QLite.defer()
            };
            if (onFulfilled != null) {
              chained.resolve_callback = onFulfilled;
            }
            chained.reject_callback = onRejected != null ? onRejected : function(reason) {
              return reason;
            };
            deferred["private"].chaineds.push(chained);
            return chained.deferred.promise;
          },
          fail: function(onRejected) {
            return this.then(void 0, onRejected);
          },
          fin: function(onSettled) {
            return this.then(onSettled, onSettled);
          }
        }
      };
    },
    all: function(promises) {
      var combined, fn, implementation, j, len, notifyFulfillment, notifyRejection, promise;
      combined = QLite.defer();
      implementation = {
        values: [],
        fulfilled: 0
      };
      notifyFulfillment = function(promise, value) {
        var i;
        implementation.fulfilled++;
        i = promises.indexOf(promise);
        implementation.values[i] = value;
        if (implementation.fulfilled === promises.length) {
          return combined.resolve(implementation.values);
        }
      };
      notifyRejection = function(reason) {
        return combined.reject(reason);
      };
      fn = function(promise) {
        return promise.then((function(value) {
          return notifyFulfillment(promise, value);
        }), notifyRejection);
      };
      for (j = 0, len = promises.length; j < len; j++) {
        promise = promises[j];
        fn(promise);
      }
      return combined.promise;
    },
    any: function(promises) {
      var combined, fn, j, len, notifyFulfillment, notifyRejection, promise, rejected;
      combined = QLite.defer();
      rejected = 0;
      notifyFulfillment = function(value) {
        return combined.resolve(value);
      };
      notifyRejection = function() {
        rejected++;
        if (rejected === promises.length) {
          return combined.reject(void 0);
        }
      };
      fn = function(promise) {
        return promise.then(notifyFulfillment, notifyRejection);
      };
      for (j = 0, len = promises.length; j < len; j++) {
        promise = promises[j];
        fn(promise);
      }
      return combined.promise;
    }
  };

  switch (false) {
    case (typeof module !== "undefined" && module !== null ? module.exports : void 0) == null:
      module.exports = function() {
        return QLite;
      };
      break;
    case typeof define === "undefined" || define === null:
      define(function() {
        return QLite;
      });
      break;
    case typeof window === "undefined" || window === null:
      window.QLite = QLite;
  }

}).call(this);
