import { inspect } from "util"

export default function bodyParserRawLimit(req, res) {
  res.send({
    body: inspect(req.body, { depth: Infinity, maxStringLength: 100 }),
  })
}

export const config = {
  bodyParser: {
    raw: {
      limit: `100mb`,
    },
  },
}
