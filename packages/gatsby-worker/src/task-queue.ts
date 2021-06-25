interface ITaskQueueNode<ValueType> {
  value: ValueType
  next?: ITaskQueueNode<ValueType>
  prev?: ITaskQueueNode<ValueType>
}
export class TaskQueue<ValueType> {
  private head?: ITaskQueueNode<ValueType>
  private tail?: ITaskQueueNode<ValueType>;

  *[Symbol.iterator](): Iterator<ITaskQueueNode<ValueType>> {
    let currentHead = this.head
    while (currentHead) {
      yield currentHead
      currentHead = currentHead.next
    }
  }

  enqueue(task: ValueType): void {
    const newNode: ITaskQueueNode<ValueType> = {
      value: task,
    }
    if (this.tail) {
      this.tail.next = newNode
      newNode.prev = this.tail
    } else {
      this.head = newNode
    }

    this.tail = newNode
  }

  remove(taskNode: ITaskQueueNode<ValueType>): void {
    if (taskNode === this.head) {
      this.head = taskNode.next
      if (this.head) {
        this.head.prev = undefined
      } else {
        // if we don't have head, we also don't have tail
        this.tail = undefined
      }
    } else {
      if (taskNode === this.tail) {
        this.tail = taskNode.prev
      }
      // if node is not the head then it will have .prev
      taskNode.prev!.next = taskNode.next
    }
  }
}
