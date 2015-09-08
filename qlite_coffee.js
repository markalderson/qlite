// Generated by CoffeeScript 1.10.0
(function() {
  var QLite, deferred;

  QLite = {
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
              which.deferred[how.with_operation](how.with_argument);
            };
          },
          settle: function(how) {
            var c1, c2, callback, callback_result, chained, error, error1, i, len, ref;
            ref = this.chaineds;
            for (i = 0, len = ref.length; i < len; i++) {
              chained = ref[i];
              try {
                switch (how.with_operation) {
                  case 'resolve':
                    callback = chained.resolve_callback;
                    break;
                  case 'reject':
                    callback = chained.reject_callback;
                    break;
                  default:
                    null;
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
                    callback_result.then(c1, c2);
                  } else {
                    this.settleChained(chained, {
                      with_operation: how.with_operation,
                      with_argument: callback_result
                    })();
                  }
                }
              } catch (error1) {
                error = error1;
                this.settleChained(chained, {
                  with_operation: 'reject',
                  with_argument: error
                })();
              }
            }
          }
        },
        resolve: function(value) {
          return this["private"].settle({
            with_operation: 'resolve',
            with_argument: value
          });
        },
        reject: function(reason) {
          return this["private"].settle({
            with_operation: 'reject',
            with_argument: reason
          });
        },
        promise: {
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
            this.then(null, onRejected);
          },
          "finally": function(onSettled) {
            this.then(onSettled, onSettled);
          }
        }
      };
    }
  };

  deferred = QLite.defer();

  deferred.reject('dammit!');

  deferred.promise["finally"](function(err) {
    console.log(err);
  });

}).call(this);