// Generated by CoffeeScript 1.10.0
(function() {
  describe('QLite', function() {
    beforeEach(function() {
      return jasmine.clock().install();
    });
    afterEach(function() {
      return jasmine.clock().uninstall();
    });
    it('allows to create promises', function(done) {
      var deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        deferred.resolve('Hello QLite!');
        return done();
      }), 1000);
      jasmine.clock().tick(1001);
      return deferred.promise.then(function(value) {
        return expect(value).toEqual('Hello QLite!');
      });
    });
    it('creates promises that are rejectable', function(done) {
      var deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        deferred.reject('I am rejecting you!');
        return done();
      }), 1000);
      jasmine.clock().tick(1001);
      return deferred.promise.fail(function(value) {
        return expect(value).toEqual('I am rejecting you!');
      });
    });
    it('creates promises that are chainable', function(done) {
      var deferred, increment;
      deferred = QLite.defer();
      setTimeout((function() {
        deferred.resolve(1);
        return done();
      }), 1000);
      jasmine.clock().tick(1001);
      increment = function(x) {
        return x + 1;
      };
      return deferred.promise.then(increment).then(increment).then(function(value) {
        return expect(value).toEqual(3);
      });
    });
    it('creates promises that support multiple calls to _then_ method', function(done) {
      var c1, c2, deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        deferred.resolve();
        return done();
      }), 1000);
      jasmine.clock().tick(1001);
      c1 = function() {};
      c2 = function() {};
      expect(c1).not.toHaveBeenCalled();
      expect(c2).not.toHaveBeenCalled();
      deferred.promise.then(c1).then(function() {
        return expect(c1).toHaveBeenCalled();
      });
      return deferred.promise.then(c2).then(function() {
        return expect(c2).toHaveBeenCalled();
      });
    });
    it('properly handles callback exceptions with rejection', function(done) {
      var deferred;
      deferred = QLite.defer();
      setTimeout((function() {
        deferred.resolve();
        return done();
      }), 1000);
      jasmine.clock().tick(1001);
      return deferred.promise.then(function() {
        throw 'I am throwing!';
      }).fail(function(reason) {
        return expect(reason).toEqual('I am throwing!');
      });
    });
    it('works also when _resolve_ is called before _then_', function() {
      var c, deferred;
      deferred = QLite.defer();
      deferred.resolve();
      c = function() {};
      return deferred.promise.then(function() {
        return expect(c).toHaveBeenCalled();
      });
    });
    return it('works also when _reject_ is called before _then_', function() {
      var c, deferred;
      deferred = QLite.defer();
      deferred.reject();
      c = function() {};
      return deferred.promise.fail(function() {
        return expect(c).toHaveBeenCalled();
      });
    });
  });

}).call(this);
