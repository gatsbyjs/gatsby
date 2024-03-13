import fs from "fs-extra"
import { prepareFunction } from "../lambda-handler"
import { join, relative } from "path"
import { slash } from "gatsby-core-utils/path"

const writeFileSpy = jest
  .spyOn(fs, `writeFile`)
  .mockImplementation(async () => {})
const writeJsonSpy = jest
  .spyOn(fs, `writeJSON`)
  .mockImplementation(async () => {})

const fixturePath = join(
  relative(process.cwd(), __dirname),
  `fixtures`,
  `lambda-handler`
)
const pathToEntryPoint = join(fixturePath, `entry.js`)
const requiredFile = join(fixturePath, `included.js`)

test(`produced handler is correct`, async () => {
  await prepareFunction({
    functionId: `test`,
    name: `test`,
    pathToEntryPoint,
    requiredFiles: [requiredFile],
  })

  // asserting correctness on actual output would be difficult
  // so this assertion is mostly to make sure win32 produces same
  // output as posix
  expect(writeFileSpy).toMatchSnapshot()
  expect(writeJsonSpy).toBeCalledWith(expect.any(String), {
    config: {
      name: `test`,
      generator: expect.stringContaining(`gatsby-adapter-netlify@`),
      includedFiles: [slash(requiredFile)],
      externalNodeModules: [`msgpackr-extract`],
    },
    version: 1,
  })
})
