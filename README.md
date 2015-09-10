# QLite

![](https://raw.githubusercontent.com/marcoliceti/qlite/develop/assets/logo-128.png)

QLite is a **tiny** (less than 3KB) JavaScript [Promise](https://promisesaplus.com/) library.

Elegantly written in about 100 lines of [CoffeScript](http://coffeescript.org/), QLite is inspired by the [Q Promise library](https://github.com/kriskowal/q), that is also a reference for the promises used in the [Google's AngularJS Framework](https://angularjs.org/).

Table of Contents:

* [Download](#download)
* [But... what are JavaScript Promises?](#but-what-are-javascript-promises)
* [How does QLite compare with other Promise libraries?](#how-does-qlite-compare-with-other-promise-libraries)
* [Why should I use QLite?](#why-should-i-use-qlite)

## Download

Of course you can download or clone this repository, but it's better if you use a package manager. QLite is available as an [npm](https://www.npmjs.com/) package:

``` bash
npm install qlite
```

## But... what are JavaScript Promises?

Put simply, a promise is a JavaScript object:

* representing a (usually) asynchronous task
* has a `then(onFulfilled, onRejected)` method
* `onFulfilled` is a callback that will be called when the task executions succeeds
* `onRejected` is a callback that will be called when the task executions fails (either normally or due to an exception)

Also, the `then` method returns a new, related promise, based on what `onFulfilled` and `onReject` will return. This allows for _promise chaining_.

Promises allow you to switch from this:

``` javascript
myAsyncTask(input, function(error, output) {
  if (error) recoverFrom(error);
  else doSomethingWith(output);
});
```

to this:

``` javascript
myAsyncTask(input).then(doSomethingWith, recoverFrom);
```

While at first it may not seem a big step forward, the new approach will surely prove useful when asynchronous APIs mix with complex execution flows. _Abstractions like promises allow you to breathe :)_

If you want to learn more, these are some good resources:

* [A deep tutorial provided with the Q library](https://github.com/kriskowal/q#tutorial)
* [The `then` method standard / specification](https://promisesaplus.com/)
* [An introduction with a good "Motivation" section](https://www.promisejs.org/)

**Note:** That's advanced and / or very detailed material. It may be confusing or overwhelm you. My suggestion is to start understanding by _coding_ instead of _reading_. Questions will then arise naturally. Remember: promises are simpler than they appear.

## How does QLite compare with other Promise libraries?

QLite offers a reasonable subset of the [Q API](https://github.com/kriskowal/q/wiki/API-Reference). Namely, you got these core features:

* these methods for _authoring_ promise-based APIs:
  * `QLite.defer()` to create a _deferred object_ (i.e. a handle on a new promise)
  * every deferred object has a:
    * `resolve(value)` method to be called when the asynchronous task succeeds, with `value` being the task result
    * `reject(reason)` method to be called when the asynchronous task fails, with `reason` being a normal error or an exception thrown during task execution
    * `promise` property, which is a reference to the promise associated to the deferred object
* these methds for _consuming_ a promise-based API:
  * the `then` method explained previously

Additionally, QLite provides these extra features, also present in the Q library:

* `QLite.isPromise(value)` to test if a value is a promise
* `QLite.all(promises)` to combine an array of promises into a single promise with AND semantics
* `QLite.any(promises)` to combine an array of promises into a single promise with OR semantics
* `fail(callback)` and `fin(callback)` as shorthands for `then(null, callback)` and `then(callback, callback)`

This should do for a lot of use cases. Future releases may add new features, like progress notification, for example.

QLite implementation is _similar_ to Q. More precisely, QLite tests are run also against the Q implementation, giving the same results, with just a few exceptions:

* `QLite.isPromise` considers a promise every object with a `then` method
* `QLite.any` rejects with `undefined` as reason

## Why should I use QLite?

Use QLite when:

* you want an extremely compact implementation (less than 3KB)
* you're strongly interested in understanding the implementation of 3rd party software you include in your projects

Otherwise, just use the regular Q implementation. It has more features and is well tested.
