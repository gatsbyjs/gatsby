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
  const handlerCode = writeFileSpy.mock.calls[0][1]
  // expect require in produced code (this is to mostly to make sure handlerCode is actual handler code)
  expect(handlerCode).toMatch(/require\(["'][^"']*["']\)/)
  // require paths should not have backward slashes (win paths)
  expect(handlerCode).not.toMatch(/require\(["'][^"']*\\[^"']*["']\)/)

  expect(writeJsonSpy).toBeCalledWith(
    expect.any(String),
    expect.objectContaining({
      config: expect.objectContaining({
        name: `test`,
        generator: expect.stringContaining(`gatsby-adapter-netlify`),
        includedFiles: [slash(requiredFile)],
        externalNodeModules: [`msgpackr-extract`],
      }),
      version: 1,
    })
  )
})
