import { observable, action, decorate } from "mobx"

class CounterModel {
  Count = 0

  Increment() {
    this.Count += 1
  }

  Decrement() {
    this.Count -= 1
  }
}
decorate(CounterModel, {
  Count: observable,
  Increment: action,
  Decrement: action,
})
const CounterStore = new CounterModel()
export default CounterStore
