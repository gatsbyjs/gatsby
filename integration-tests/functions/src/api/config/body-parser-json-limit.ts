import {
  GatsbyFunctionConfig,
  GatsbyFunctionRequest,
  GatsbyFunctionResponse,
} from "gatsby"
import { inspect } from "util"

export default function bodyParserJsonLimit(
  req: GatsbyFunctionRequest<Record<any, any>>,
  res: GatsbyFunctionResponse
): void {
  res.send({
    body: inspect(req.body, { depth: Infinity, maxStringLength: 100 }),
  })
}

export const config: GatsbyFunctionConfig = {
  bodyParser: {
    json: {
      limit: `100mb`,
    },
  },
}
