import { GatsbyFunctionResponse, GatsbyFunctionRequest } from "gatsby"
import sharp from "sharp"

export default async function topLevel(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  console.log(req.query)
  const data = await sharp({
    create: {
      width: req.query.width ? parseInt(req.query.width, 10) : 400,
      height: req.query.height ? parseInt(req.query.height, 10) : 400,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 },
    },
  })
    .png()
    .toBuffer()

  res.setHeader(`Content-Type`, `image/png`)
  res.send(data)
}
