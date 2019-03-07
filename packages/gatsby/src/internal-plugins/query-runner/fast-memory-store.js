let uuid = 0

function FastMemoryStore() {
  this._queueMap = new Map() // Array of taskIds
  this._tasks = {} // Map of taskId => task
  this._priorities = {} // Map of taskId => priority
  this._running = {} // Map of lockId => taskIds
}

FastMemoryStore.prototype.connect = function(cb) {
  cb(null, this._tasks.length)
}

FastMemoryStore.prototype.getTask = function(taskId, cb) {
  return cb(null, this._tasks[taskId])
}

FastMemoryStore.prototype.deleteTask = function(taskId, cb) {
  const hadTask = this._tasks[taskId]
  delete this._tasks[taskId]
  if (hadTask) {
    const priority = this._priorities[taskId]
    this._queueMap
      .get(priority)
      .splice(this._queueMap.get(priority).indexOf(taskId), 1)
    delete this._priorities[taskId]
  }
  cb()
}

FastMemoryStore.prototype.putTask = function(taskId, task, priority, cb) {
  const hadTask = this._tasks[taskId]
  this._tasks[taskId] = task
  priority = priority || 0
  if (!hadTask) {
    const queue = this._queueMap.get(priority) || []
    queue.push(task)
    this._queueMap.push(queue)
  }
  this._priorities[taskId] = priority
  cb()
}

FastMemoryStore.prototype.takeFirstN = function(n, cb) {
  const lockId = uuid++
  let remainingTasks = n
  const sortedKeys = this._queueMap.keys.sort()
  let taskIds = []
  for (let key of sortedKeys) {
    if (remainingTasks <= 0) {
      break
    }
    const grabbedTasks = this._queueMap.get(key).splice(0, remainingTasks)
    taskIds = taskIds.concat(grabbedTasks)
    remainingTasks -= grabbedTasks.length
    if (remainingTasks > 0) {
      this._queueMap.delete(key)
    }
  }
  const tasks = {}
  taskIds.forEach(function(taskId) {
    tasks[taskId] = this._tasks[taskId]
    delete this._tasks[taskId]
  })
  if (taskIds.length > 0) {
    this._running[lockId] = tasks
  }
  cb(null, lockId)
}

FastMemoryStore.prototype.takeLastN = function(n, cb) {
  const lockId = uuid++
  let remainingTasks = n
  const sortedKeys = this._queueMap.keys.sort()
  let taskIds = []
  for (let key of sortedKeys) {
    if (remainingTasks <= 0) {
      break
    }
    const grabbedTasks = this._queueMap.get(key).splice(-remainingTasks)
    taskIds = taskIds.concat(grabbedTasks)
    remainingTasks -= grabbedTasks.length
    if (remainingTasks > 0) {
      this._queueMap.delete(key)
    }
  }
  taskIds = taskIds.reverse()
  const tasks = {}
  taskIds.forEach(function(taskId) {
    tasks[taskId] = this._tasks[taskId]
    delete this._tasks[taskId]
  })
  if (taskIds.length > 0) {
    this._running[lockId] = tasks
  }
  cb(null, lockId)
}

FastMemoryStore.prototype.getLock = function(lockId, cb) {
  cb(null, this._running[lockId])
}

FastMemoryStore.prototype.getRunningTasks = function(cb) {
  cb(null, this._running)
}

FastMemoryStore.prototype.releaseLock = function(lockId, cb) {
  delete this._running[lockId]
  cb()
}

module.exports = FastMemoryStore
