const _ = require(`lodash`)

export default function topLevel(req, res) {
  if (!_.isEmpty(req.query)) {
    res.json(req.query)
  } else if (!_.isEmpty(req.body)) {
    res.json(req.body)
  } else if (!_.isEmpty(req.files)) {
    res.json(req.files)
  } else {
    res.json(`no body was sent`)
  }
}
