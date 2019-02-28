/**
 * Calculate CPU core count
 * @param {boolean} [useEnvVar=false] Use the 'GATSBY_CPU_COUNT' env var to calculate the requested type of CPU cores
 * @returns {number} Count of the requested type of CPU cores. Defaults to number of physical cores or 1
 */

const physical_cores = require(`physical-cpu-count`)
const logical_cores = require(`os`).cpus().length

const cpuCoreCount = (useEnvVar = false) => {
  try {
    let coreCount = physical_cores || 1

    if (!useEnvVar) {
      // Return the physical CPU count,
      // or default to 1 if we can't detect
      return physical_cores || 1
    }

    if (typeof process.env.GATSBY_CPU_COUNT !== `undefined`) {
      const coreCountArg =
        Number(process.env.GATSBY_CPU_COUNT) || process.env.GATSBY_CPU_COUNT

      switch (typeof coreCountArg) {
        case `string`:
          // Leave at Default CPU count if coreCountArg === `physical_cores`

          // CPU count === logical CPU count
          // throw error if we have a problem counting logical cores
          if (coreCountArg === `logical_cores`) {
            coreCount = logical_cores

            if (typeof coreCount !== "number") {
              throw new Error(
                `process.env.GATSBY_CPU_COUNT is set to 'logical_cores' but there was a problem finding the number of logical cores`
              )
            }
          }
          break

        case `number`:
          // CPU count === passed in count
          coreCount = coreCountArg
          break

        default:
          break
      }
    }

    return coreCount
  } catch (err) {
    console.error(err)
    throw new Error(`There has been a problem counting the number of CPU cores`)
  }
}

module.exports = cpuCoreCount
