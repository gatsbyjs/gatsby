import { execFileSync } from "child_process"
import flowBin from "flow-bin"

try {
  if (process.platform !== `win32`) {
    execFileSync(flowBin, [`check`], { stdio: `inherit` })
  }
} catch (e) {
  process.exit(1)
}
