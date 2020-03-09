import ci from "ci-info"
const ciInfo: typeof ci = jest.genMockFromModule(`ci-info`)

// @ts-ignore
ciInfo.isCI = false
// @ts-ignore
ciInfo.name = `bad default`

function setIsCI(value: boolean): void {
  // @ts-ignore
  ciInfo.isCI = value
}

function setName(name: string): void {
  // @ts-ignore
  ciInfo.name = name
}

// @ts-ignore
ciInfo.setIsCI = setIsCI
// @ts-ignore
ciInfo.setName = setName

export default ciInfo
