import { inspect } from "util"

export default function bodyParserFalse(req, res) {
  res.send({
    body: inspect(req.body, { depth: Infinity, maxStringLength: 100 }),
  })
}
