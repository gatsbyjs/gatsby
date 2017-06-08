patch()

function patch() {
  var head = document.querySelector(`head`)
  var ensure = __webpack_require__.e
  var chunks = __webpack_require__.s
  var failures

  __webpack_require__.e = function(chunkId, callback) {
    var loaded = false
    var immediate = true

    var handler = function(error) {
      if (!callback) return

      callback(__webpack_require__, error)
      callback = null
    }

    if (!chunks && failures && failures[chunkId]) {
      handler(true)
      return
    }

    ensure(chunkId, function() {
      if (loaded) return
      loaded = true

      if (immediate) {
        // webpack fires callback immediately if chunk was already loaded
        // IE also fires callback immediately if script was already
        // in a cache (AppCache counts too)
        setTimeout(function() {
          handler()
        })
      } else {
        handler()
      }
    })

    // This is |true| if chunk is already loaded and does not need onError call.
    // This happens because in such case ensure() is performed in sync way
    if (loaded) {
      return
    }

    immediate = false

    onError(function() {
      if (loaded) return
      loaded = true

      if (chunks) {
        chunks[chunkId] = void 0
      } else {
        failures || (failures = {})
        failures[chunkId] = true
      }

      handler(true)
    })
  }

  function onError(callback) {
    var script = head.lastChild

    if (script.tagName !== `SCRIPT`) {
      if (typeof console !== `undefined` && console.warn) {
        console.warn(`Script is not a script`, script)
      }

      return
    }

    script.onload = script.onerror = function() {
      script.onload = script.onerror = null
      setTimeout(callback, 0)
    }
  };
};