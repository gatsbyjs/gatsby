import path from "path"
import { createNormalizedModuleKey } from "../create-normalized-module-key"

const projectRoot = path.join(`Users`, `username`, `project`)

it(`should normalize bare module imports from node_modules`, () => {
  const nodeModule = path.join(`node_modules`, `package-name`)

  const normalizedModuleKey = createNormalizedModuleKey(
    path.join(projectRoot, nodeModule),
    projectRoot
  )

  expect(normalizedModuleKey).toEqual(`file://${nodeModule}`)
})

it(`should normalize relative module imports from node_modules`, () => {
  const nodeModule = path.join(`node_modules`, `package-name`)

  const normalizedModuleKey = createNormalizedModuleKey(
    path.join(projectRoot, nodeModule, `index.js`),
    projectRoot
  )

  expect(normalizedModuleKey).toEqual(`file://${nodeModule}`)
})

it(`should normalize local module imports`, () => {
  const localModuleFile = path.join(
    projectRoot,
    `src`,
    `components`,
    `index.js`
  )

  const normalizedModuleKey = createNormalizedModuleKey(
    localModuleFile,
    projectRoot
  )
  expect(normalizedModuleKey).toEqual(localModuleFile)
})
