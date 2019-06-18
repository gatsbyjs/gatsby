const fetch = require("./fetch.js")
const { processData, report } = require("./process-data.js")

const start = async function() {
  const data = await fetch()
  if (data) report(processData(data))
}

start()
