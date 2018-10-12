import { observable, action } from 'mobx'

class CounterModel {
  @observable
  Count

  constructor() {
    this.Count = 0
  }
  @action
  Increment() {
    this.Count += 1
  }
  @action
  Decrement() {
    this.Count -= 1
  }
}
let CounterStore = new CounterModel()
export default CounterStore
