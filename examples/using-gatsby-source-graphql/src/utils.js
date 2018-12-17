const dateformat = require(`dateformat`)

exports.makeBlogPath = ({ id, createdAt, slug }) => {
  const date = new Date(createdAt)
  const formattedDate = dateformat(date, `yyyy-mm-dd`)
  return `/${formattedDate}-${slug}`
}
