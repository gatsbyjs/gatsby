import net from "net"
import fs from "fs-extra"
import path from "path"

const functionPath = path.join(__dirname, `./function.ts`)
const functionStr = fs.readFileSync(functionPath, `utf-8`)
console.log({ functionPath, functionStr })

console.time(`connect to server`)
const clients = net.connect({ port: 2222, host: `143.110.158.220` }, () => {
  console.timeEnd(`connect to server`)

  // 'connect' listener
  console.log("connected to server!")

  setInterval(() => {
    const traceId = `call-${Math.random()}`
    console.time(traceId)
    clients.write(
      JSON.stringify({
        functionStr,
        traceId,
        args: { a: Math.random(), b: Math.random() },
      })
    )
  }, 100)
})
clients.on("data", data => {
  console.log(data.toString())
  console.timeEnd(JSON.parse(data).traceId)
  // clients.end()
})
clients.on("end", () => {
  console.log("disconnected from server")
})
