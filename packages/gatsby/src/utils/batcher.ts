export default class Batcher<Callback extends (...args: any[]) => any> {
  private queue: Parameters<Callback>[] = [];
  private callbacks: ((...args: Parameters<Callback>) => void)[] = []
  private bulkCallbacks: ((args: Parameters<Callback>[]) => void)[] = []

  constructor(private threshold: number) {}

  /** Add a call to the batcher */
  add(...args: Parameters<Callback>) {
    this.queue.push(args)

    if (this.queue.length >= this.threshold) {
      this.flush()
    }
  }

  /** Call all of our callbacks and clear out the queue */
  flush() {
    // call each callback for each item in the queue
    this.queue.forEach(args => 
      this.callbacks.forEach(callback => callback(...args))
    )

    // pass the entire queue to all bulk callbacks
    this.bulkCallbacks.forEach(callback => {
      callback(this.queue)
    })

    // clear out the queue
    this.queue = []
  }

  /** Sets up a callback for each batcher item */
  call(callback: (...args: Parameters<Callback>) => void) {
    this.callbacks.push(callback)
  }

  /** Sets up a bulk callback that takes the entire queue */
  bulkCall(callback: (args: Parameters<Callback>[]) => void) {
    this.bulkCallbacks.push(callback)
  }
}