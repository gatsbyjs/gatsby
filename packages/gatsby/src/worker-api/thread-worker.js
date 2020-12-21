const { parentPort } = require("worker_threads")
const Remark = require(`remark`)
const remark = new Remark()

const parse = function parse(str) {
  return remark.parse(str)
}

parentPort.once("message", chunk => {
  // console.log(chunk);
  const astArray = chunk.map(mdStr => parse(mdStr))
  parentPort.postMessage(astArray)
})
