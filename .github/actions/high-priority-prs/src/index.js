const fetch = require("./fetch.js")
const { process, report } = require("./process.js")

const start = async function() {
  const data = await fetch()
  if (data) report(process(data))
}

start()
