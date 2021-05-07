import { open } from "lmdb-store"

const myStore = open({
  path: `my-store`,
  // any options go here, we can turn on compression like this:
  // compression: true,
})
// await myStore.put("greeting", { someText: "Hello, World!" })
// myStore.get("greeting").someText // 'Hello, World!'
// or
// myStore.transactionAsync(() => {
// myStore.put("greeting", { someText: "Hello, World!" })
// myStore.get("greeting").someText // 'Hello, World!'
// })
export default myStore
