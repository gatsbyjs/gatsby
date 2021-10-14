import { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby"

export default function handler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  console.log(`submitted form`, req.body)
  res.json(`ok`)
}
