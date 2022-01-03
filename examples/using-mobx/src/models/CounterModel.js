import { observable, action, makeObservable } from "mobx"

class CounterModel {
  Count = 0

  constructor() {
    makeObservable(this, {
      Count: observable,
      Increment: action.bound,
      Decrement: action.bound,
    })
  }

  Increment() {
    this.Count += 1
  }

  Decrement() {
    this.Count -= 1
  }
}

const CounterStore = new CounterModel()
export default CounterStore
