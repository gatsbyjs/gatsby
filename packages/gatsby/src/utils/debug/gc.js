let gc = global.gc
if (!gc) {
  const v8 = require(`v8`)
  const vm = require(`vm`)

  v8.setFlagsFromString(`--expose_gc`)
  gc = vm.runInNewContext(`gc`)

  global.gc = gc
}

exports.gc = gc
