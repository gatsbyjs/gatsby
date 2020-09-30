import table from "markdown-table"

export const generateMarkdownTableFromJoiSchema = schema => {
  const json = schema.describe()
  const array = [
    [`Key`, `Description`, `Default`],
    ...Object.keys(json.keys).map(key => {
      const field = json.keys[key]
      return [key, field.flags?.description, field.flags?.default]
    }),
  ]
  return table(array)
}
