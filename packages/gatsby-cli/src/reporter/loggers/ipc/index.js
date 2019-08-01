import { onLogAaction } from "../../redux/index"
import stripAnsi from "strip-ansi"

onLogAaction(action => {
  const some = {
    ...action,
    text: stripAnsi(action.text),
  }

  process.send(some)
})
