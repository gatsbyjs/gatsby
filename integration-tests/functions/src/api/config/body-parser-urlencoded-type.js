import { inspect } from "util"

export default function bodyParserUrlencodedType(req, res) {
  res.send({
    body: inspect(req.body, { depth: Infinity, maxStringLength: 100 }),
  })
}

export const config = {
  bodyParser: {
    urlencoded: {
      type: `*/*`,
      extended: true
    },
  },
}
