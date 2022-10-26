import path from "path"
import { createNormalizedModuleKey } from "../create-normalized-module-key"

const projectRoot = path.join(`Users`, `username`, `project`)

it(`should normalize bare module imports from node_modules`, () => {
  const nodeModule = path.join(`node_modules`, `package-name`)

  const normalizedModuleKey = createNormalizedModuleKey(
    path.join(projectRoot, nodeModule),
    projectRoot
  )

  expect(normalizedModuleKey).toMatchSnapshot()
})

it(`should normalize relative module imports from node_modules`, () => {
  const nodeModule = path.join(`node_modules`, `package-name`)

  const normalizedModuleKey = createNormalizedModuleKey(
    path.join(projectRoot, nodeModule, `index.js`),
    projectRoot
  )

  expect(normalizedModuleKey).toMatchSnapshot()
})

it(`should normalize local module imports`, () => {
  const rootRelativeLocalModuleFile = path.join(`src`, `components`, `index.js`)
  const absoluteLocalModuleFile = path.join(
    projectRoot,
    rootRelativeLocalModuleFile
  )

  const normalizedModuleKey = createNormalizedModuleKey(
    absoluteLocalModuleFile,
    projectRoot
  )
  expect(normalizedModuleKey).toMatchSnapshot()
})
