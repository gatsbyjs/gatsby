exports.onClientEntry = function() {
  require(`es6-object-assign`).polyfill()
}
