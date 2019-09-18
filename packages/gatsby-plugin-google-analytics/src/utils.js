const createFunctionWithTimeout = (callback, opt_timeout) => {
  var called = false
  function fn() {
    if (!called) {
      called = true
      callback()
    }
  }
  setTimeout(fn, opt_timeout || 1000)
  return fn
}

export { createFunctionWithTimeout }
