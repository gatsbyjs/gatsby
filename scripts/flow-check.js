const { execFileSync } = require(`child_process`)
const flowBin = require(`flow-bin`)

try {
  if (process.platform !== `win32`) {
    execFileSync(flowBin, [`check`], { stdio: `inherit` })
  }
} catch (e) {
  process.exit(1)
}
