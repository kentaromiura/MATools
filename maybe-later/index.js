'use strict'

const CALLBACKS = {
  timeout: Object.create(null),
  frame: Object.create(null),
  immediate: Object.create(null)
}

let UID = 0;
const push = (collection, callback, deferrer) => {
  let exists = null;
  for(exists in collection) break;
  const id = exists || UID++;

  if (exists === null) {
    collection[id] = [callback];
    deferrer(() => {
      const reference = collection[id];
      // immediately delete collection[id], this allow calls to deferrer inside a deferrer
      delete collection[id]; 
      const time = (globalThis.performance || Date).now()

      for (const i in reference) {
        reference[i](time)
      }
    })
  } else {
    collection[id].push(callback);
  }

  return () => {
    delete collection[id]
  }
}

const defer = (callback, argument) =>
  typeof argument === 'number'
    ? defer.timeout(callback, argument)
    : defer.immediate(callback, argument)

if (global.setImmediate) {
  defer.immediate = (callback) =>
    push(CALLBACKS.immediate, callback, global.setImmediate)
} else {
  defer.immediate = (callback) => defer.timeout(callback, 0)
}

const requestAnimationFrame = global.requestAnimationFrame

defer.frame = requestAnimationFrame
  ? (callback) => push(CALLBACKS.frame, callback, requestAnimationFrame)
  : (callback) => defer.timeout(callback, 1000 / 60)

let mark

defer.timeout = (callback, ms) => {
  // Destroy the callbacks.timeout collection, so that same-timer timeouts
  // added after the runloop get assigned to a different sub collections.
  // For example, adding a 40ms timeout, then waiting 20ms, then adding
  // another 40ms timeout would results in the two 40ms timeouts getting
  // squished together which is obviously wrong. This makes sure that
  // timeout collections only live for a single runloop.
  if (!mark) {
    mark = defer.immediate(() => {
      mark = null
      CALLBACKS.timeout = Object.create(null)
    })
  }

  const collection =
    CALLBACKS.timeout[ms] ||
    (CALLBACKS.timeout[ms] = Object.create(null))

  return push(collection, callback, (callback) => {
    setTimeout(callback, ms)
  })
}

defer.wait = (...args) =>
  new Promise((resolve) => {
    defer(resolve, ...args)
  })

const CANCELS = Object.create(null)

defer.once = (name, ...args) => {
  if (CANCELS[name]) {
    CANCELS[name]()
    delete CANCELS[name]
  }
  return (CANCELS[name] = defer(...args))
}

module.exports = defer