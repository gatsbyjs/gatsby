const { isFile } = require(`../is-file`)

jest.mock(`../../db`, () => {
  const nodes = [
    {
      id: 1,
      internal: { type: `File` },
      absolutePath: `/home/me/foo.node`,
      dir: `/home/me`,
    },
    {
      id: 2,
      internal: { type: `File` },
      absolutePath: `/home/me/foo/bar.baz`,
      dir: `/home/me/foo`,
    },
    {
      id: 3,
      parent: 1,
      internal: { type: `Foo` },
      file: `./foo/bar.baz`,
    },
    {
      id: 4,
      parent: 1,
      internal: { type: `Foo` },
      file: `./foo/bar/bar.baz`,
    },
    {
      id: 5,
      internal: { type: `File` },
      absolutePath: `C:\\Users\\me\\foo.node`,
      dir: `C:\\Users\\me`,
    },
    {
      id: 6,
      internal: { type: `File` },
      absolutePath: `C:\\Users\\me\\foo\\bar.baz`,
      dir: `C:\\Users\\me\\foo`,
    },
    {
      id: 7,
      parent: 5,
      internal: { type: `Foo` },
      file: `foo\\bar.baz`,
    },
  ]
  return {
    getById: id => nodes.find(n => n.id === id),
    getNodesByType: type => nodes.filter(n => n.internal.type === type),
  }
})

describe(`isFile util`, () => {
  it(`handles file paths referencing existing File nodes`, () => {
    const selector = `Foo.file`
    const relativePath = `./foo/bar.baz`
    expect(isFile(selector, relativePath)).toBeTruthy()
  })

  it(`handles file paths referencing non-existing File nodes`, () => {
    const selector = `Foo.file`
    const relativePath = `./foo/bar/bar.baz`
    expect(isFile(selector, relativePath)).toBeFalsy()
  })

  describe(`Windows environment`, () => {
    it(`works with Windows file paths`, () => {
      const path = require(`path`)
      jest.spyOn(path, `join`).mockImplementation(path.win32.join)

      const selector = `Foo.file`
      const relativePath = `foo\\bar.baz`
      expect(isFile(selector, relativePath)).toBeTruthy()

      path.join.mockRestore()
    })
  })
})
