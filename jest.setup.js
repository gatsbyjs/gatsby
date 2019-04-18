// mock ink
jest.mock(`ink`)

const v8 = require(`v8`)
console.log(v8.getHeapStatistics())
