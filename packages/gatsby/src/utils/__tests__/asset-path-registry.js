import path from "path"
import { register, clear, remove, getAssets } from "../asset-path-registry"

beforeEach(clear)

describe(`general registry behavior`, () => {
  it(`starts with empty registry`, () => {
    const registry = register()
    expect(registry.size).toBe(0)
  })

  it(`registers a file path to registry`, () => {
    const registry = register(`a.js`)
    expect(registry.size).toBe(1)
  })

  it(`can remove a file path`, () => {
    const file = `a.js`
    register(file)
    const registry = remove(file)

    expect(registry.size).toBe(0)
  })

  it(`does not add same file path twice`, () => {
    const file = `a.js`
    new Array(10).fill(undefined).forEach(() => register(file))

    expect(register().size).toBe(1)
  })
})

describe(`getAssets`, () => {
  it(`returns in-memory assets`, async () => {
    const files = [`a.js`, `b.js`]
    files.forEach(file => register(file))
    const assets = await getAssets(path.join(__dirname, `__not_a_real_path__`))

    expect(Array.from(assets)).toEqual(files)
  })

  it(`returns webpack assets`, async () => {
    const assets = await getAssets(path.join(__dirname, `fixtures`))

    expect(assets).toMatchSnapshot()
  })

  it(`returns webpack and in-memory assets`, async () => {
    const files = [`a.js`, `b.js`]
    files.forEach(file => register(file))

    const assets = await getAssets(path.join(__dirname, `fixtures`))
    files.forEach(file => {
      expect(assets.has(file)).toBe(true)
    })

    expect(assets.size - files.length).not.toBe(0)
  })
})
