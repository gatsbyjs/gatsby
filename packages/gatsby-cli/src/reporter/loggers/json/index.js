import { onLogAaction } from "../../redux/index"

onLogAaction(action => {
  process.stdout.write(JSON.stringify(action) + `\n`)
})
