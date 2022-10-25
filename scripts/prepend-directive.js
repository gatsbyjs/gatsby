const fs = require(`fs-extra`)
const path = require(`path`)

function prependDirective({ directive, files, cwd = process.cwd() }) {
  for (const file of files) {
    try {
      const filePath = path.resolve(cwd, file)
      const fileContent = fs.readFileSync(filePath).toString()

      fs.writeFileSync(filePath, `"${directive}"\n${fileContent}`)

      console.info(`Prepended directive "${directive}" to file ${file}`)
    } catch (cause) {
      throw new Error(
        `Failed to prepend directive "${directive}" to file "${file}"`,
        { cause }
      )
    }
  }
}

module.exports = {
  prependDirective,
}
