/**
 * Code mainly copied from https://github.com/GlobeletJS/zero-timeout
 *
 * This code lets us schedule tasks for the next tick, similar to Node.JS's process.nextTick().
 * This is handy for reducing blocking times and freeing the main thread
 */

//
const timeouts = []
let taskId = 0

// Make a unique message, that won't be confused with messages from
// other scripts or browser tabs
const messageKey = `zeroTimeout_$` + Math.random().toString(36).slice(2)

// Make it clear where the messages should be coming from
const loc = window.location
let targetOrigin = loc.protocol + `//` + loc.hostname
if (loc.port !== ``) targetOrigin += `:` + loc.port

// When a message is received, execute a timeout from the list
window.addEventListener(
  `message`,
  evnt => {
    if (evnt.source != window || evnt.data !== messageKey) return
    evnt.stopPropagation()

    const task = timeouts.shift()
    if (!task || task.canceled) return
    task.func(...task.args)
  },
  true
)

// Now define the external functions to set or cancel a timeout
export const setZeroTimeout = (func, ...args) => {
  taskId += 1
  timeouts.push({ id: taskId, func, args })
  window.postMessage(messageKey, targetOrigin)
  return taskId
}

export const cancelZeroTimeout = id => {
  const task = timeouts.find(timeout => timeout.id === id)
  if (task) task.canceled = true
}
