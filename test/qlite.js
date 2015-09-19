(function() {
  describe('QLite', function() {
    beforeEach(function() {
      return jasmine.clock().install();
    });
    afterEach(function() {
      return jasmine.clock().uninstall();
    });
    it('allows to create promises', function() {
      var c, deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        return deferred.resolve('Hello QLite!');
      }), 1000);
      c = jasmine.createSpy('c');
      deferred.promise.then(c);
      expect(c).not.toHaveBeenCalled();
      jasmine.clock().tick(1001);
      return expect(c).toHaveBeenCalledWith('Hello QLite!');
    });
    it('creates promises that are rejectable', function() {
      var c, deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        return deferred.reject('I am rejecting you!');
      }), 1000);
      c = jasmine.createSpy('c');
      deferred.promise.then(null, c);
      expect(c).not.toHaveBeenCalled();
      jasmine.clock().tick(1001);
      return expect(c).toHaveBeenCalledWith('I am rejecting you!');
    });
    it('creates deferred objects with a _fail(x)_ method as a shorthand for _then(null, x)_', function() {
      var c, deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        return deferred.reject('I am rejecting you!');
      }), 1000);
      c = jasmine.createSpy('c');
      deferred.promise.fail(c);
      expect(c).not.toHaveBeenCalled();
      jasmine.clock().tick(1001);
      return expect(c).toHaveBeenCalledWith('I am rejecting you!');
    });
    it('creates deferred objects with a _fin(x)_ method as a shorthand for _then(x, x)_', function() {
      var c1, c2, deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        return deferred.resolve('I am resolving!');
      }), 1000);
      c1 = jasmine.createSpy('c1');
      deferred.promise.fin(c1);
      expect(c1).not.toHaveBeenCalled();
      jasmine.clock().tick(1001);
      expect(c1).toHaveBeenCalledWith('I am resolving!');
      deferred = QLite.defer();
      setTimeout((function() {
        return deferred.reject('I am rejecting!');
      }), 1000);
      c2 = jasmine.createSpy('c2');
      deferred.promise.fin(c2);
      expect(c2).not.toHaveBeenCalled();
      jasmine.clock().tick(1001);
      return expect(c2).toHaveBeenCalledWith('I am rejecting!');
    });
    it('creates promises that are chainable', function() {
      var c, deferred, increment;
      deferred = QLite.defer();
      setTimeout((function() {
        return deferred.resolve(1);
      }), 1000);
      increment = function(x) {
        return x + 1;
      };
      c = jasmine.createSpy('c');
      deferred.promise.then(increment).then(increment).then(c);
      expect(c).not.toHaveBeenCalled();
      jasmine.clock().tick(1001);
      return expect(c).toHaveBeenCalledWith(3);
    });
    it('deals properly with callbakcks that return promises', function() {
      var incrementAsync, incrementSync, s;
      s = jasmine.createSpy('s');
      incrementAsync = function(x) {
        var d;
        d = QLite.defer();
        setTimeout((function() {
          return d.resolve(x + 1);
        }), 1000);
        return d.promise;
      };
      incrementSync = function(x) {
        return x;
      };
      incrementAsync(1).then(incrementAsync).then(incrementAsync).then(s);
      jasmine.clock().tick(3001);
      return expect(s).toHaveBeenCalledWith(4);
    });
    it('creates promises that support multiple calls to _then_ method', function() {
      var c1, c2, deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        return deferred.resolve();
      }), 1000);
      c1 = jasmine.createSpy('c1');
      c2 = jasmine.createSpy('c2');
      deferred.promise.then(c1);
      deferred.promise.then(c2);
      expect(c1).not.toHaveBeenCalled();
      expect(c2).not.toHaveBeenCalled();
      jasmine.clock().tick(1001);
      expect(c1).toHaveBeenCalled();
      return expect(c2).toHaveBeenCalled();
    });
    it('properly handles callback exceptions with rejection', function() {
      var c, deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        return deferred.resolve();
      }), 1000);
      c = jasmine.createSpy('c');
      deferred.promise.then(function() {
        throw 'I am throwing!';
      }).fail(c);
      expect(c).not.toHaveBeenCalled();
      jasmine.clock().tick(1001);
      return expect(c).toHaveBeenCalledWith('I am throwing!');
    });
    it('works also even if _resolve_ is called before _then_', function() {
      var c, deferred;
      deferred = QLite.defer();
      deferred.resolve('Yo!');
      c = jasmine.createSpy('c');
      expect(c).not.toHaveBeenCalled();
      deferred.promise.then(c);
      jasmine.clock().tick(1);
      return expect(c).toHaveBeenCalledWith('Yo!');
    });
    it('creates promises that once settled can\'t be fulfilled / rejected again', function() {
      var c1, c2, deferred;
      deferred = QLite.defer();
      c1 = jasmine.createSpy('c1');
      deferred.promise.then(c1);
      deferred.resolve('I am resolving!');
      deferred.resolve('I am resolving again!');
      deferred.reject('I am rejecting!');
      expect(c1).not.toHaveBeenCalled();
      jasmine.clock().tick(1);
      expect(c1).toHaveBeenCalledWith('I am resolving!');
      expect(c1).not.toHaveBeenCalledWith('I am resolving again!');
      expect(c1).not.toHaveBeenCalledWith('I am rejecting!');
      deferred = QLite.defer();
      c2 = jasmine.createSpy('c2');
      deferred.promise.fail(c2);
      deferred.reject('I am rejecting!');
      deferred.resolve('I am resolving!');
      deferred.reject('I am rejecting again!');
      jasmine.clock().tick(1);
      expect(c2).toHaveBeenCalledWith('I am rejecting!');
      expect(c2).not.toHaveBeenCalledWith('I am resolving!');
      return expect(c2).not.toHaveBeenCalledWith('I am rejecting again!');
    });
    it('offers a _all_ method that creates a promise fulfilling when all passed promises do', function() {
      var c, combined, d1, d2, d3, i, ref;
      ref = (function() {
        var j, results;
        results = [];
        for (i = j = 1; j <= 3; i = ++j) {
          results.push(QLite.defer());
        }
        return results;
      })(), d1 = ref[0], d2 = ref[1], d3 = ref[2];
      combined = QLite.all([d1.promise, d2.promise, d3.promise]);
      d1.resolve(1);
      d2.resolve(2);
      d3.resolve(3);
      c = jasmine.createSpy('c');
      combined.then(c);
      expect(c).not.toHaveBeenCalled();
      jasmine.clock().tick(1);
      return expect(c).toHaveBeenCalledWith([1, 2, 3]);
    });
    it('offers a _all_ method that creates a promise rejecting as soon as one of the passed promises do', function() {
      var c, combined, d1, d2, d3, i, ref;
      ref = (function() {
        var j, results;
        results = [];
        for (i = j = 1; j <= 3; i = ++j) {
          results.push(QLite.defer());
        }
        return results;
      })(), d1 = ref[0], d2 = ref[1], d3 = ref[2];
      combined = QLite.all([d1.promise, d2.promise, d3.promise]);
      d1.resolve(1);
      d2.reject('I am rejecting!');
      d3.resolve(3);
      c = jasmine.createSpy('c');
      combined.fail(c);
      expect(c).not.toHaveBeenCalled();
      jasmine.clock().tick(1);
      return expect(c).toHaveBeenCalledWith('I am rejecting!');
    });
    it('offers a _any_ method that creates a promise fulfilling as soon as one of the passed promises do', function() {
      var c, combined, d1, d2, d3, i, ref;
      ref = (function() {
        var j, results;
        results = [];
        for (i = j = 1; j <= 3; i = ++j) {
          results.push(QLite.defer());
        }
        return results;
      })(), d1 = ref[0], d2 = ref[1], d3 = ref[2];
      combined = QLite.any([d1.promise, d2.promise, d3.promise]);
      d1.resolve(1);
      d2.resolve(2);
      d3.resolve(3);
      c = jasmine.createSpy('c');
      combined.then(c);
      expect(c).not.toHaveBeenCalled();
      jasmine.clock().tick(1);
      return expect(c).toHaveBeenCalledWith(1);
    });
    it('offers a _any_ method that creates a promise rejecting when all passed promises do', function() {
      var c, combined, d1, d2, d3, i, ref;
      ref = (function() {
        var j, results;
        results = [];
        for (i = j = 1; j <= 3; i = ++j) {
          results.push(QLite.defer());
        }
        return results;
      })(), d1 = ref[0], d2 = ref[1], d3 = ref[2];
      combined = QLite.any([d1.promise, d2.promise, d3.promise]);
      d1.reject('I am rejecting!');
      d2.reject('I am rejecting!');
      d3.reject('I am rejecting!');
      c = jasmine.createSpy('c');
      combined.fail(c);
      expect(c).not.toHaveBeenCalled();
      jasmine.clock().tick(1);
      return expect(c).toHaveBeenCalledWith(void 0);
    });
    return it('offers a _isPromise_ method that tests if an object is a promise', function() {
      expect(QLite.isPromise({
        then: function() {}
      })).toEqual(true);
      expect(QLite.isPromise({
        foo: function() {}
      })).toEqual(false);
      expect(QLite.isPromise({})).toEqual(false);
      expect(QLite.isPromise('foo')).toEqual(false);
      expect(QLite.isPromise(null)).toEqual(false);
      expect(QLite.isPromise(void 0)).toEqual(false);
      expect(QLite.isPromise(true)).toEqual(false);
      expect(QLite.isPromise(false)).toEqual(false);
      return expect(QLite.isPromise(1)).toEqual(false);
    });
  });

}).call(this);
