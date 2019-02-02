const fs = require(`fs-extra`)
const path = require(`path`)

const inputDir = path.join(__dirname, `input`)
const outputDir = path.join(__dirname, `output`)

exports.getTestInputs = () => {
  const files = fs.readdirSync(inputDir)

  return files.map(fileName => {
    const filePath = path.join(inputDir, fileName)
    const parsed = path.parse(fileName)
    const testData = require(filePath)
    const inputData = { ...testData, fileName: parsed.name }
    return inputData
  })
}

exports.clearTestOutput = async () => fs.removeSync(outputDir)

const getOutputPath = (input, dbEngine) => {
  const outputPath = path.join(outputDir, dbEngine, `${input.fileName}.json`)
  return outputPath
}

exports.saveTestOutput = async data => {
  await fs.outputFile(
    getOutputPath(data, process.env.GATSBY_DB_NODES || `redux`),
    JSON.stringify(data.results, null, 2)
  )
}

exports.readTestOutput = (data, dbEngine) =>
  require(getOutputPath(data, dbEngine))
