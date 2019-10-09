const { setJobToProcess } = require(`../scheduler`)

describe(`setJobToProcess`, () => {
  it(`allows brackets in paths`, () => {
    const toProcess = {}
    const job = {
      args: {},
      inputPath: `1234/file.jpg`,
      contentDigest: `8675309jenny`,
      outputPath: `myoutputpath/1234/file[new].jpg`,
    }
    setJobToProcess(toProcess, job)
    expect(toProcess).toMatchSnapshot()
  })
})
