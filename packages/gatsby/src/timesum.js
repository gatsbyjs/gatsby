const { performance } = require("perf_hooks")

let running = new Map()
let data = new Map()
let indent = 0

console.timeSum = function _timeSum(name, callback) {
  if (running.has(name)) {
    return console.warn("console.timeSum: name already being recorded:", name)
  }

  const now = performance.now()
  running.set(" ".repeat(indent) + name, now, true)

  if (callback) {
    try {
      callback()
    } finally {
      console.timeSumEnd(" ".repeat(indent) + name)
    }
  }
}

console.timeSumEnd = function _timeEndSum(name, recordAs = name) {
  const endTime = performance.now()
  const indentedName = " ".repeat(indent) + name
  const indentedRecordAs = " ".repeat(indent) + recordAs
  const start = running.get(indentedName)
  if (start === undefined) {
    return console.warn("console.timeEndSum: name not being recorded:", name)
  }
  running.delete(indentedName)

  add(indentedRecordAs, endTime - start, true)
}

console.timeSumGroup = function _timeSumGroup(name, callback) {
  _timeSum(name, callback)
  indent += 2
}

console.timeSumGroupEnd = function _timeSumGroupEnd(name, recordAs = name) {
  indent -= 2
  _timeEndSum(name, recordAs)
}

console.timeSumCancel = function _timeSumCancel(name) {
  // Should this warn if the name does not exist..?
  running.delete(name)
}

console.timeSumPrint = function _timeSumPrint() {
  // console.log(data)
  console.group("timeSum report;")
  let maxs = 0
  let maxc = 0
  data.forEach(({ sum, count }, name) => {
    const whole = Math.floor(sum).toString()
    maxs = Math.max(maxs, whole.length)
    maxc = Math.max(maxc, String(count).length)
  })
  const arr = []
  data.forEach(({ sum, count, isTimer }, name) => {
    const whole = Math.floor(sum).toString()
    const rest = String(sum % 1).slice(1) // Either zero or `0.` plus fraction
    arr.push(
      "- " +
        (isTimer
          ? whole.padStart(maxs, " ") + rest.slice(0, 3).padEnd(3, " ") + "ms"
          : (whole.padStart(maxs, " ") + (sum === count ? rest + ' x' : rest.padEnd(3, " "))).padEnd(
              maxs + 5,
              " "
            )) +
        (isTimer || count !== sum
          ? " (" + count.toString().padStart(maxc + 1, " ") + "x )"
          : " ".repeat(maxc + 6)) +
        ": " +
        name
    )
  })
  console.log(arr.reverse().join("\n"))
  console.groupEnd()
}

console.timeSumReset = function _timeSumClear() {
  data = new Map()
  running = new Map()
  indent = 0
}

console.timeSumCount = function _timeSumCount(name, delta = 1) {
  add(name, delta, false)
}

function add(name, delta, isTimer) {
  let obj = data.get(name)
  if (obj === undefined) {
    obj = { sum: 0, count: 0, isTimer }
    data.set(name, obj)
  }
  obj.sum += delta
  obj.isTimer = isTimer
  ++obj.count
}
