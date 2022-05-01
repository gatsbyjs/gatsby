const path = require(`path`)
export default function topLevel(req, res) {
  res.send(`${path.parse(__filename).name}${path.parse(__filename).ext}`)
}
