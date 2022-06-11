# Maybe Later

Note: this is the same version of kamicane with just a small change to use high-resolution timers.

`maybe-later` defers the execution of functions at a later time.
Deferring a function returns a method that cancels the function execution.

`maybe-later` is more resource friendly and faster than simply stacking `requestAnimationFrame` or `setTimeout` calls: every deferred function belonging to the same call stack with the same timeout gets executed inside the same call, at the same time.

When using `maybe-later` for animations everything will be synced properly.

## Basic usage

```js
const defer = require('maybe-later')
const cancel1 = defer(() => {
  console.log('hello immediate')
})

const cancel2 = defer(() => {
  console.log('hello timeout')
}, 100)

// if you change your mind
cancel1()
cancel2()
```

> `defer()` is an alias for `defer.immediate()` when called with no second argument, and `defer.timeout()` when the second argument is a number (timeout in milliseconds).

## Method: immediate

Defers the execution of a function in the next iteration loop, as soon as possible.
Uses `setImmediate` where available, falls back to `setTimeout(0)`.

```js
const defer = require('maybe-later')
defer.immediate(() => {
  console.log('hello world')
})
```

## Method: frame

Like `defer.immediate`, however `defer.frame` defers the execution of a function on the next animation frame.
If `requestAnimationFrame` is not available, `defer.frame` falls back to `setTimeout` with a `1000 / 60` delay.

```js
const defer = require('maybe-later')
defer.frame(() => {
  console.log('hello world')
})
```

## Method: timeout

Defers the execution of a function after a specified number of milliseconds.

```js
const defer = require('maybe-later')
defer.timeout(() => {
  console.log('hello world')
}, 1000)
```

## Method: once

Automatically cancels the previous call of the same name.

```js
const fs = require('fs')
const defer = require('defer')

fs.watch(FILE_PATH, () => {
  defer.once('file-change', () => console.log('done something expensive'), 1000)
})
```

## Method: wait

Returns a promise that resolves (with the current time as a value) after the specified amount of time (or on setImmediate when no time argument is passed).

```js
const defer = require('defer')
(async () => {
  const now = await defer.wait(1000)
  console.log('waited 1 second', now)
})()
```

## Time argument

A time argument is passed to each function of the stack, which is the date at which the stack has begun processing.
This ensures each function of the same stack receives the same time argument.