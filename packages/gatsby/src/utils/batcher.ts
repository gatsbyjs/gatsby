export default class Batcher<Callback extends (...args: Array<any>) => any> {
  private queue: Array<Parameters<Callback>> = []
  private callbacks: Array<(...args: Parameters<Callback>) => void> = []
  private bulkCallbacks: Array<(args: Array<Parameters<Callback>>) => void> = []

  constructor(private threshold: number) {}

  /** Add a call to the batcher */
  add(...args: Parameters<Callback>): void {
    this.queue.push(args)

    if (this.queue.length >= this.threshold) {
      this.flush()
    }
  }

  /** Call all of our callbacks and clear out the queue */
  flush(): void {
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
  call(callback: (...args: Parameters<Callback>) => void): void {
    this.callbacks.push(callback)
  }

  /** Sets up a bulk callback that takes the entire queue */
  bulkCall(callback: (args: Array<Parameters<Callback>>) => void): void {
    this.bulkCallbacks.push(callback)
  }
}
