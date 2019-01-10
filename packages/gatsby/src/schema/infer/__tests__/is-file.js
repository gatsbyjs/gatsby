const { isFile } = require(`../is-file`)

jest.mock(`../../db`, () => {
  const nodes = [
    {
      id: 1,
      internal: { type: `File` },
      absolutePath: `/home/me/foo.txt`,
      dir: `/home/me`,
    },
    {
      id: 2,
      internal: { type: `File` },
      absolutePath: `/home/me/foo/bar.txt`,
      dir: `/home/me/foo`,
    },
    {
      id: 3,
      parent: 1,
      internal: { type: `Foo` },
      file: `./foo/bar.txt`,
    },
    {
      id: 4,
      parent: 1,
      internal: { type: `Foo` },
      file: `./foo/bar/bar.txt`,
    },
    {
      id: 5,
      internal: { type: `File` },
      absolutePath: `C:/Users/me/foo.txt`,
      dir: `C:/Users/me`,
    },
    {
      id: 6,
      internal: { type: `File` },
      absolutePath: `C:/Users/me/foo/bar.txt`,
      dir: `C:/Users/me/foo`,
    },
    {
      id: 7,
      parent: 5,
      internal: { type: `Foo` },
      file: `foo/bar.txt`,
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
    const relativePath = `./foo/bar.txt`
    expect(isFile(selector, relativePath)).toBeTruthy()
  })

  it(`handles file paths referencing non-existing File nodes`, () => {
    const selector = `Foo.file`
    const relativePath = `./foo/bar/bar.txt`
    expect(isFile(selector, relativePath)).toBeFalsy()
  })

  describe(`Windows environment`, () => {
    it(`works with Windows file paths`, () => {
      const path = require(`path`)
      jest.spyOn(path, `join`).mockImplementation(path.win32.join)

      const selector = `Foo.file`
      const relativePath = `foo\\bar.txt`
      expect(isFile(selector, relativePath)).toBeTruthy()

      path.join.mockRestore()
    })
  })
})
