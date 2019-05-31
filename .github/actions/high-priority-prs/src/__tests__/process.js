const process = require("./process")
const fs = require("fs")
const data = JSON.parse(fs.readFileSync("./fixtures/data.json", `utf-8`))

test("does some stuff", () => {
  console.log(process(data))
})
