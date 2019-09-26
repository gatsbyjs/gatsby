const ciInfo = jest.genMockFromModule(`ci-info`)

ciInfo.isCI = false
ciInfo.name = `bad default`

function setIsCI(value) {
  ciInfo.isCI = value
}

function setName(name) {
  ciInfo.name = name
}
ciInfo.setIsCI = setIsCI
ciInfo.setName = setName
module.exports = ciInfo
