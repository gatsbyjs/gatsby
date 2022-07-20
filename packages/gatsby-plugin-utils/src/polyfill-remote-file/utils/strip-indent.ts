export function stripIndent(
  tpl: ReadonlyArray<string>,
  ...expressions: ReadonlyArray<string>
): string {
  let str = ``

  tpl.forEach((chunk, index) => {
    str +=
      chunk.replace(/^(\\n)*[ ]+/gm, `$1`) +
      (expressions[index] ? expressions[index] : ``)
  })

  return str
}
