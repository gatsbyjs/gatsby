type UnknownCallback = (err?: unknown, value?: unknown) => void
type NumberCallback = (err?: unknown, value?: number) => void
type EmptyCallback = () => void

interface IMemoryStore {
  connect(cb: NumberCallback): void
  getTask(taskId: string, cb: UnknownCallback): void
  deleteTask(taskId: string, cb: EmptyCallback): void
  putTask(
    taskId: string,
    task: unknown,
    priority: number,
    cb: EmptyCallback
  ): void
  takeFirstN(n: number, cb: NumberCallback): void
  takeLastN(n: number, cb: NumberCallback): void
  getRunningTasks(cb: UnknownCallback): void
  getLock(lockId: string, cb: UnknownCallback): void
  releaseLock(lockId: string, cb: EmptyCallback): void
}

export function MemoryStoreWithPriorityBuckets(): IMemoryStore {
  let uuid = 0

  /**
   * Task ids grouped by priority
   */
  const queueMap = new Map<number, string[]>()

  /**
   * Task id to task lookup
   */
  const tasks = new Map<string, unknown>()

  /**
   * Task id to priority lookup
   */
  const taskIdToPriority = new Map<string, number>()

  /**
   * Lock to running tasks object
   */
  const running: Record<number, unknown> = {}

  let priorityKeys: number[] = []
  const updatePriorityKeys = (): void => {
    priorityKeys = Array.from(queueMap.keys()).sort((a, b) => b - a)
  }

  const addTaskWithPriority = (taskId: string, priority: number): boolean => {
    let needToUpdatePriorityKeys = false
    let priorityTasks = queueMap.get(priority)
    if (!priorityTasks) {
      priorityTasks = []
      queueMap.set(priority, priorityTasks)
      needToUpdatePriorityKeys = true
    }

    taskIdToPriority.set(taskId, priority)
    priorityTasks.push(taskId)
    return needToUpdatePriorityKeys
  }

  return {
    connect: function (cb): void {
      cb(null, tasks.size)
    },
    getTask: function (taskId, cb): void {
      cb(null, tasks.get(taskId))
    },
    deleteTask: function (taskId, cb): void {
      if (tasks.get(taskId)) {
        tasks.delete(taskId)
        const priority = taskIdToPriority.get(taskId)
        if (priority) {
          const priorityTasks = queueMap.get(priority) || []
          priorityTasks.splice(priorityTasks.indexOf(taskId), 1)
          taskIdToPriority.delete(taskId)
        }
      }
      cb()
    },
    putTask: function (taskId, task, priority = 0, cb): void {
      const oldTask = tasks.get(taskId)
      tasks.set(taskId, task)
      let needToUpdatePriorityKeys = false
      if (oldTask) {
        const oldPriority = taskIdToPriority.get(taskId)

        if (oldPriority && oldPriority !== priority) {
          const oldPriorityTasks = queueMap.get(oldPriority) || []
          oldPriorityTasks.splice(oldPriorityTasks.indexOf(taskId), 1)

          if (
            addTaskWithPriority(taskId, priority) ||
            oldPriorityTasks.length === 0
          ) {
            needToUpdatePriorityKeys = true
          }
        }
      } else {
        needToUpdatePriorityKeys = addTaskWithPriority(taskId, priority)
      }

      if (needToUpdatePriorityKeys) {
        updatePriorityKeys()
      }
      cb()
    },
    takeFirstN: function (n, cb): void {
      const lockId = uuid++
      let remainingTasks = n
      let needToUpdatePriorityKeys = false
      let haveSomeTasks = false
      const tasksToRun = {}

      for (const priority of priorityKeys) {
        const tasksWithSamePriority = queueMap.get(priority)
        const grabbedTaskIds =
          tasksWithSamePriority?.splice(0, remainingTasks) ?? []
        grabbedTaskIds.forEach(taskId => {
          // add task to task that will run
          // and remove it from waiting list
          tasksToRun[taskId] = tasks.get(taskId)
          tasks.delete(taskId)
          taskIdToPriority.delete(taskId)
          haveSomeTasks = true
        })

        remainingTasks -= grabbedTaskIds.length
        if (tasksWithSamePriority?.length === 0) {
          queueMap.delete(priority)
          needToUpdatePriorityKeys = true
        }
        if (remainingTasks <= 0) {
          break
        }
      }

      if (needToUpdatePriorityKeys) {
        updatePriorityKeys()
      }

      if (haveSomeTasks) {
        running[lockId] = tasksToRun
      }

      cb(null, lockId)
    },
    takeLastN: function (n, cb): void {
      // This is not really used by Gatsby, but will be implemented for
      // completion in easiest possible way (so not very performant).
      // Mostly done so generic test suite used by other stores passes.
      // This is mostly C&P from takeFirstN, with array reversal and different
      // splice args
      const lockId = uuid++
      let remainingTasks = n
      let needToUpdatePriorityKeys = false
      let haveSomeTasks = false
      const tasksToRun = {}

      for (const priority of priorityKeys.reverse()) {
        const tasksWithSamePriority = queueMap.get(priority) || []
        const deleteCount = Math.min(
          remainingTasks,
          tasksWithSamePriority.length
        )
        const grabbedTaskIds = tasksWithSamePriority.splice(
          tasksWithSamePriority.length - deleteCount,
          deleteCount
        )
        grabbedTaskIds.forEach(taskId => {
          // add task to task that will run
          // and remove it from waiting list
          tasksToRun[taskId] = tasks.get(taskId)
          tasks.delete(taskId)
          taskIdToPriority.delete(taskId)
          haveSomeTasks = true
        })

        remainingTasks -= grabbedTaskIds.length
        if (tasksWithSamePriority.length === 0) {
          queueMap.delete(priority)
          needToUpdatePriorityKeys = true
        }
        if (remainingTasks <= 0) {
          break
        }
      }

      if (needToUpdatePriorityKeys) {
        updatePriorityKeys()
      }

      if (haveSomeTasks) {
        running[lockId] = tasksToRun
      }

      cb(null, lockId)
    },
    getRunningTasks: function (cb): void {
      cb(null, running)
    },
    getLock: function (lockId, cb): void {
      cb(null, running[lockId])
    },
    releaseLock: function (lockId, cb): void {
      delete running[lockId]
      cb()
    },
  }
}
