export default function topLevel(req, res) {
  const status = req.query.code ? req.query.code : 200
  res.status(status).send(`I am at the top-level`)
}
