const { performance } = require(`perf_hooks`)

const BOLD = "\x1b[;1;1m"
const BLINK = "\x1b[;5;1m"
const RED = "\x1b[31m"
const GREEN = "\x1b[32m"
const RESET = "\x1b[0m"

let DISABLED = false // Easy flag for disabling the timers (and any warnings that may be caused by async stuff)
let VERBOSE = false // Print each step. Very noisy but might help with tracing down async problems
let verboseFence = 455995 // After how many cycles do we start verbose=true?
let AUTO_GROUP = true // Prefer to have all timeSum calls implicitly be timeSumGroup calls?
let traceRunning = false // Store a stack trace for each call to timeSum. Helps for debugging. Keep disabled for perf.
let running = new Map()
let runningTraces = new Map()
let data = new Map()
let front = []
let groupSeparator = " λ "
let printSeparator = " Λ "
let maxGroupDepth = 100 // If the nesting depth of groups exceeds this, throw hard. Prevents recursion problems.

let prei = 0
let lastPrint = 0 // last prei at which results were printed
let incCounter = 0 // used in an elaborate way to maintain insertion order when printing

/**
 * There can be only one active instance of a name at the same time. You'll get warnings or errors if timeSum is
 * called with a name that was started before but not ended. This will happen a lot with async code that is not
 * properly running in serial.
 * A name starting with `!` will never be grouped, regardless. This way you can still track global totals when
 * grouping.
 * The `λ` character has a special internal meaning.
 *
 *
 * @param name
 * @param callback
 * @private
 */
function _timeSum(name, callback, _fromGrouped = false) {
  if (DISABLED) return

  data.set(name, undefined) // Preserve call order in output. Just don't do `.has` and check `.forEach` values returned and it'll be fine :)

  ++prei
  const now = performance.now()
  const groupedName =
    name[0] === "!"
      ? name.slice(1)
      : (_fromGrouped ? front : [...front, name]).join(groupSeparator)
  if (VERBOSE && prei >= verboseFence)
    console.log("[" + prei + "] TS+;", groupedName)

  if (running.has(groupedName)) {
    return console.warn(
      `[${prei}] console.timeSum: name already being recorded:`,
      name,
      "(grouped name:",
      "`" + groupedName + "`",
      ")"
    )
  }

  running.set(groupedName, now)
  if (traceRunning) runningTraces.set(groupedName, new Error().stack)
  if (maxGroupDepth && running.size > maxGroupDepth)
    throw new Error(
      `[${prei}] console.timeSum: group nesting depth exceeded ${maxGroupDepth}. Maybe recursion?`
    )

  if (callback) {
    try {
      callback()
    } finally {
      _timeSumEnd(groupedName)
    }
  }
}
console.timeSum = console.timeSum || (AUTO_GROUP ? _timeSumGroup : _timeSum)

_timeSum.verbose = (bool = !VERBOSE) => (VERBOSE = bool)
_timeSum.disable = (bool = !DISABLED) => (DISABLED = bool)

function _timeSumEnd(name, recordAs = name) {
  if (DISABLED) return
  ++prei
  const endTime = performance.now()
  const groupedName =
    num2alpha(++incCounter) + ":" + name[0] === "!"
      ? name.slice(1)
      : [...front, name].join(groupSeparator)
  if (VERBOSE && prei >= verboseFence)
    console.log("[" + prei + "] TS ;", groupedName)
  const groupedRecordAs =
    recordAs[0] === "!"
      ? recordAs.slice(1)
      : [...front, recordAs].join(groupSeparator)
  const start = running.get(groupedName)
  if (start === undefined) {
    if (traceRunning) {
      console.log("runningTraces:")
      runningTraces.forEach((value, key) =>
        console.log(GREEN + key + RESET + ": ", value.replace(/\\n/g, "\n"))
      )
    }
    return console.warn(
      `[${prei}] console.timeEndSum: name not being recorded:`,
      name,
      "(grouped:",
      "`" + groupedName + "`",
      "). Maybe it was closed out of order?"
    )
  }
  running.delete(groupedName)
  if (traceRunning) runningTraces.delete(groupedName)

  add(groupedRecordAs, endTime - start, true)
}
console.timeSumEnd =
  console.timeSumEnd || (AUTO_GROUP ? _timeSumGroupEnd : _timeSumEnd)

function num2alpha(n) {
  if (n === 0) return "a"
  let s = ""
  while (n > 0) {
    const m = n % 26
    s = String.fromCharCode(97 + m) + s
    n = (n - m) / 26
  }
  return s
}

function _timeSumGroup(name, callback) {
  if (DISABLED) return
  if (name[0] !== "!") front.push(name)
  _timeSum(name, callback, true)
}

console.timeSumGroup = console.timeSumGroup || _timeSumGroup

function _timeSumGroupEnd(name, recordAs = name) {
  if (DISABLED) return
  if (name[0] !== "!") {
    const last = front.pop()
    if (last !== name) {
      console.log(
        "[" +
          prei +
          "] Incorrect order. Group expected to end `" +
          last +
          "` but was asked to end `" +
          name +
          "` instead"
      )
      console.log("[" + prei + "] Current timeSum from:", [...front, last])
      console.log(
        "Invalid group closed (`" + name + "`), caller not awaiting properly?"
      )
      if (traceRunning) {
        console.log("runningTraces:")
        runningTraces.forEach((value, key) =>
          console.log(GREEN + key + RESET + ": ", value.replace(/\\n/g, "\n"))
        )
      }
      throw new Error(
        "[" +
          prei +
          "] Invalid group closed (`" +
          name +
          "`). Probably async problems?"
      )
      return
    }
  }
  _timeSumEnd(name, recordAs)
}

console.timeSumGroupEnd = console.timeSumGroupEnd || _timeSumGroupEnd

console.timeSumCancel =
  console.timeSumCancel ||
  function _timeSumCancel(name) {
    if (DISABLED) return
    // Should this warn if the name does not exist..?
    running.delete(name)
    if (traceRunning) runningTraces.delete(name)
  }

console.timeSumPrint =
  console.timeSumPrint ||
  function _timeSumPrint(interval = 0, keepGroupNames = false) {
    if (DISABLED) return

    // Optionally, you can have it print every so many cycles so you don't have to wait for a complete build.
    if (interval && prei - lastPrint < interval) return
    lastPrint = prei

    console.group(`timeSum report;`)
    let maxs = 0
    let maxc = 0
    data.forEach((data, name) => {
      if (!data) return
      const { sum, count } = data
      const whole = Math.floor(sum).toString()
      maxs = Math.max(maxs, whole.length)
      maxc = Math.max(maxc, String(count).length)
    })
    let arr = []
    let index = 0 // Maps are ordered. Insertion order is relevant here.
    const nameIndex = new Map() // name -> index. Used for sorting by group while maintaining insertion sort inside each group
    data.forEach((data, groupedName) => {
      if (!data) return
      const { sum, count, isTimer } = data
      const whole = Math.floor(sum).toString()
      const rest = String(sum % 1).slice(1) // Either zero or `0.` plus fraction

      nameIndex.set(groupedName.split(groupSeparator).pop(), index++)

      arr.push(
        groupedName +
          printSeparator +
          `- ` +
          (isTimer
            ? whole.padStart(maxs, ` `) + rest.slice(0, 3).padEnd(3, ` `) + `ms`
            : (
                whole.padStart(maxs, ` `) +
                (sum === count ? rest + ` x` : rest.padEnd(3, ` `))
              ).padEnd(maxs + 5, ` `)) +
          (isTimer || count !== sum
            ? ` (` + count.toString().padStart(maxc + 1, ` `) + `x )`
            : ` `.repeat(maxc + 6)) +
          `: `
      )
    })

    // Each element in this group is a string formatted like `g1 λ g2 λ g3 Λ rest of timing data`
    // We split on Λ (ignoring the second part). Then we split on λ and sort by insertion order of the first part, left to right, where
    // both parts are not the same (different group or leaves). A group goes before something this part of the group ("prefix")
    // The complexity of this sorting logic is contained to the print method so calls to .timeSum are not burdened by any of it.
    arr.sort((a, b) => {
      const x = a.split(printSeparator)
      const X = x[0].split(groupSeparator)
      const y = b.split(printSeparator)
      const Y = y[0].split(groupSeparator)
      for (let i = 0, l = Math.max(X.length, Y.length); i < l; ++i) {
        // If one is a parent group of the other, put the parent group first
        if (i > X.length) return -1
        if (i > Y.length) return 1
        // Unless the group name is the same, order them in insertion order. Otherwise move to next part.
        const s = X[i]
        const t = Y[i]
        const m = nameIndex.get(s)
        const n = nameIndex.get(t)
        if (m < n) return -1
        if (m > n) return 1
      }
      return 0 // not sure if this can happen because "leaves" are unique
    })

    arr = arr.map(s => {
      let [groupedName, desc] = s.split(printSeparator)
      let segments = keepGroupNames ? [] : groupedName.split(groupSeparator)
      let name = keepGroupNames ? groupedName : segments.pop()
      return desc + " ".repeat(segments.length * 2) + name
    })
    console.log(arr.join(`\n`))
    console.groupEnd()
  }

console.timeSumReset = console.timeSumClear =
  console.timeSumReset ||
  function _timeSumClear() {
    if (DISABLED) return
    data = new Map()
    running = new Map()
    if (traceRunning) runningTraces = new Map()
  }

console.timeSumCount =
  console.timeSumCount ||
  function _timeSumCount(name, delta = 1) {
    ++prei
    if (VERBOSE && prei >= verboseFence)
      console.log("[" + prei + "] TS++;", name)
    if (DISABLED) return
    const groupedName =
      name[0] === "!" ? name.slice(1) : [...front, name].join(groupSeparator)
    add(groupedName, delta, false)
  }

function add(name, delta, isTimer) {
  if (DISABLED) return
  let obj = data.get(name)
  if (obj === undefined) {
    obj = { sum: 0, count: 0, isTimer }
    data.set(name, obj)
  }
  obj.sum += delta
  obj.isTimer = isTimer
  ++obj.count
}

//
const atomics = new Map()
let lockTimer = 0
function lock(name) {
  // if (VERBOSE && prei >= verboseFence) console.log('lock(' + name + ')')
  let arr = atomics.get(name)
  if (!arr) {
    arr = []
    atomics.set(name, arr)
  }

  const p = new Promise(resolve => arr.push(resolve))
  if (arr.length === 1) {
    // if (VERBOSE && prei >= verboseFence) console.log('no active lock. locked for `' + name + '`')
    arr[0]()
  }
  clearTimeout(lockTimer)
  lockTimer = setTimeout(
    () => console.log("lock [" + name + "] not released after 5s"),
    5000
  )

  return p
}
function unlock(name) {
  // if (VERBOSE && prei >= verboseFence) console.log('unlock(' + name + ')')
  const arr = atomics.get(name)
  if (!arr) {
    throw new Error(
      "should not unlock a name that was not locked (" + name + ")"
    )
  }

  arr.shift()
  lockTimer = clearTimeout(lockTimer)
  if (arr.length) {
    // if (VERBOSE && prei >= verboseFence) console.log('unlocked next one')
    arr[0]() // Next tick will start next resolver call
  }
}
console.lock = console.lock || lock
console.unlock = console.unlock || unlock
console.atomic =
  console.atomic ||
  function _atomic(func, token = "anonymous") {
    // console.log('console.atomic: creating func [' + token + ']')
    // Returns a function that will invoke the given callback in serial. Any time this returned function is invoked
    // it will check whether there's another function with the same name in flight. If so, it will wait for that
    // function to complete before invoking this one. Call order is preserved.
    // The token can be a string but can be anything if that makes more sense for you.
    // If only one of the two args is a function, the call is normalized to put the function first.
    if (typeof func !== "function") {
      if (typeof token !== "function") {
        throw new Error("Must receive a callback to invoke")
      }
      return _atomic(token, func) // put func first
    }

    return async (...args) => {
      // console.log('console.atomic: called for [' + token + ']')
      // timeSum
      await lock(token)
      const r = await func(...args)
      unlock(token)
      return r
    }
  }

console.delay = console.wait = delay => {
  return new Promise(resolve => {
    setTimeout(resolve, delay)
  })
}
