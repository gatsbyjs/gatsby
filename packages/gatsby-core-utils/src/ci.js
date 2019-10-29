const ci = require(`ci-info`)

const CI_DEFINITIONS = [
  envFromCIandCIName,
  getEnvDetect({ key: `NOW_BUILDER_ANNOTATE`, name: `ZEIT Now` }),
  getEnvDetect({ key: `NOW_REGION`, name: `ZEIT Now v1` }),
  herokuDetect,
  getEnvFromCIInfo,
  envFromCIWithNoName,
]

function lookupCI() {
  for (const fn of CI_DEFINITIONS) {
    try {
      const res = fn()
      if (res) {
        return res
      }
    } catch (e) {
      // ignore
    }
  }
  return null
}
const CIName = lookupCI()

function isCI() {
  return !!CIName
}

function getCIName() {
  if (!isCI()) {
    return null
  }
  return CIName
}

module.exports = { isCI, getCIName }

function getEnvFromCIInfo() {
  if (ci.isCI) return ci.name || `ci-info detected w/o name`
  return null
}

function getEnvDetect({ key, name }) {
  return function() {
    if (process.env[key]) {
      return name
    }
    return null
  }
}

function herokuDetect() {
  return /\.heroku\/node\/bin\/node/.test(process.env.NODE) && `Heroku`
}

function envFromCIandCIName() {
  if (process.env.CI_NAME && process.env.CI) {
    return process.env.CI_NAME
  }
  return null
}

function envFromCIWithNoName() {
  if (process.env.CI) {
    return `CI detected without name`
  }
  return null
}
