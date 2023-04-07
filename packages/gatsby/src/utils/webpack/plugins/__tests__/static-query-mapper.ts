import { removeExportQueryParam } from "../static-query-mapper"

const post = `/Users/dolores/project/post.tsx`

describe(`removeExportQueryParam`, () => {
  it(`should pass through path if it does not contain query param`, () => {
    expect(removeExportQueryParam(post)).toEqual(post)
  })
  it(`should pass through __contentFilePath`, () => {
    const path = `${post}?__contentFilePath=/Users/dolores/project/file.mdx`
    expect(removeExportQueryParam(path)).toEqual(path)
  })
  it(`should remove ?export=default`, () => {
    expect(removeExportQueryParam(`${post}?export=default`)).toEqual(post)
  })
  it(`should remove ?export=head`, () => {
    expect(removeExportQueryParam(`${post}?export=head`)).toEqual(post)
  })
  it(`should remove export but keep __contentFilePath`, () => {
    expect(
      removeExportQueryParam(
        `${post}?__contentFilePath=/Users/dolores/project/file.mdx&export=default`
      )
    ).toEqual(`${post}?__contentFilePath=/Users/dolores/project/file.mdx`)
    expect(
      removeExportQueryParam(
        `${post}?__contentFilePath=/Users/dolores/project/file.mdx&export=head`
      )
    ).toEqual(`${post}?__contentFilePath=/Users/dolores/project/file.mdx`)
  })
  it(`should handle space (" ") in __contentFilePath param correctly`, () => {
    expect(
      removeExportQueryParam(
        `/Users/dolores/project with space/post.tsx?__contentFilePath=/Users/dolores/project with space/file.mdx&export=default`
      )
    ).toEqual(
      `/Users/dolores/project with space/post.tsx?__contentFilePath=/Users/dolores/project with space/file.mdx`
    )
  })
  it(`should handle pluses ("+") in __contentFilePath param correctly`, () => {
    expect(
      removeExportQueryParam(
        `/Users/dolores/project+with+plus/post.tsx?__contentFilePath=/Users/dolores/project+with+plus/file.mdx&export=default`
      )
    ).toEqual(
      `/Users/dolores/project+with+plus/post.tsx?__contentFilePath=/Users/dolores/project+with+plus/file.mdx`
    )
  })
})
