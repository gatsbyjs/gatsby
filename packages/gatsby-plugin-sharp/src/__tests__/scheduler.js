const { setJobToProcess } = require(`../scheduler`)

describe(`setJobToProcess`, () => {
  it(`allows brackets in paths`, () => {
    let deferred = {}
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve
      deferred.reject = reject
    })
    const toProcess = {}
    const job = {
      args: {},
      inputPath: `1234/file.jpg`,
      contentDigest: `8675309jenny`,
      outputPath: `myoutputpath/1234/file[new].jpg`,
    }
    setJobToProcess(toProcess, job, deferred)
    expect(toProcess).toMatchSnapshot()
  })
})
