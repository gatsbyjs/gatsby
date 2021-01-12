const Bottleneck = require(`bottleneck`)

var batcher = new Bottleneck.Batcher({
  maxTime: 1,
  maxSize: 3,
})

batcher.on("batch", function (batch) {
  console.log(`batch`, batch)
  batch.forEach(task => {
    if (typeof task === `object`) {
      console.log(task)
      task.cb(task.val + 2)
    }
  })
})

batcher.add({ val: 1, cb: res => console.log(res) })
batcher.add({ val: 2, cb: res => console.log(res) })
batcher.add(2)
batcher.add(3)
batcher.add(4)
setTimeout(() => {
  batcher.add(5)
  batcher.add(6)
  batcher.add(7)
  batcher.add(8)
}, 10)
