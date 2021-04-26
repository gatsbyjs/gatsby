const _ = require(`lodash`)

export default function topLevel(req, res) {
  if (!_.isEmpty(req.query)) {
    res.json(req.query)
  } else if (!_.isEmpty(req.body)) {
    res.json(req.body)
  } else {
    res.send(`no body was sent`)
  }
}
