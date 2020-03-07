const ciInfo: typeof import("ci-info") = jest.genMockFromModule(`ci-info`)

ciInfo.isCI = false
ciInfo.name = `bad default`

function setIsCI(value: boolean): void {
  ciInfo.isCI = value
}

function setName(name: string): void {
  ciInfo.name = name
}
ciInfo.setIsCI = setIsCI
ciInfo.setName = setName
module.exports = ciInfo
