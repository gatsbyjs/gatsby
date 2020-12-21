const {
  createObjectBuffer,
  getUnderlyingArrayBuffer,
} = require("@bnaya/objectbuffer")

const initialValue = {
  foo: { bar: new Date(), arr: [1], nesting: { WorksTM: true } },
}
// ArrayBuffer is created under the hood
const myObject = createObjectBuffer(
  {},
  // size in bytes
  5024,
  initialValue
)

const arrayBuffer = getUnderlyingArrayBuffer(myObject)

// myObject.additionalProp = "new Value"
myObject.foo.arr.push(2)
console.log(arrayBuffer)
console.log(myObject.foo.arr)
