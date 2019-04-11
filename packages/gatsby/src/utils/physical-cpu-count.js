//Forked from physical-cpu-count package from npm
const os = require(`os`)
const childProcess = require(`child_process`)

function exec(command) {
  const output = childProcess.execSync(command, { encoding: `utf8` })
  return output
}

/*
 * Fallback if child process fails to receive CPU count
 */
function osCall() {
  const cores = os.cpus().filter(function(cpu, index) {
    const hasHyperthreading = cpu.model.includes(`Intel`)
    const isOdd = index % 2 === 1
    return !hasHyperthreading || isOdd
  })
  return cores.length
}

let amount
const platform = os.platform()

if (platform === `linux`) {
  try {
    const output = exec(`lscpu -p | egrep -v "^#" | sort -u -t, -k 2,4 | wc -l`)
    amount = parseInt(output.trim(), 10)
  } catch {
    amount = osCall()
  }
} else if (platform === `darwin`) {
  try {
    const output = exec(`sysctl -n hw.physicalcpu_max`)
    amount = parseInt(output.trim(), 10)
  } catch {
    amount = osCall()
  }
} else if (platform === `win32`) {
  try {
    const output = exec(`WMIC CPU Get NumberOfCores`)
    amount = output
      .split(os.EOL)
      .map(function parse(line) {
        return parseInt(line)
      })
      .filter(function numbers(value) {
        return !isNaN(value)
      })
      .reduce(function add(sum, number) {
        return sum + number
      }, 0)
  } catch {
    amount = osCall()
  }
} else {
  amount = osCall()
}

module.exports = amount
