const { runTask } = require(`../worker-api`)
const path = require(`path`)

export async function babelParseToAst(
  contents: string,
  filePath: string
): File {
  console.time(`parse ${filePath}`)
  const result = await runTask(
    require.resolve(`./babel-parse-to-ast-worker`),
    contents,
    filePath
  )
  console.timeEnd(`parse ${filePath}`)

  return result
}
