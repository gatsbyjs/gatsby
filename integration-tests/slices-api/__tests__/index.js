/**
 * These tests ensure that Slices API output the correct data files and HTML to the public directory
 */

const { readdirSync, readFileSync } = require(`fs-extra`)
const path = require(`path`)

const publicDir = `${__dirname}/../public`
const slicesDataDir = `${publicDir}/slice-data`
const slicesHTMLDir = `${publicDir}/_gatsby/slices`

describe(`Slices API`, () => {
  describe(`Slices data`, () => {
    const dataFilePaths = readdirSync(path.resolve(slicesDataDir))

    it(`Should create a data file for each slice`, () => {
      expect(dataFilePaths).toMatchSnapshot()
    })

    it(`Files created for each slice should contain the correct data`, () => {
      dataFilePaths.forEach(dataFilePath => {
        const dataFile = readFileSync(`${slicesDataDir}/${dataFilePath}`)
        expect(dataFile).toMatchSnapshot()
      })
    })
  })

  describe(`Slices HTML`, () => {
    const htmlFilePaths = readdirSync(path.resolve(slicesHTMLDir))

    it(`Should create an HTML file for each slice`, () => {
      expect(htmlFilePaths).toMatchSnapshot()
    })

    it(`Files created for each slice should contain the correct HTML`, () => {
      htmlFilePaths.forEach(htmlFilePath => {
        const htmlFile = readFileSync(`${slicesHTMLDir}/${htmlFilePath}`)
        expect(htmlFile).toMatchSnapshot()
      })
    })
  })
})
