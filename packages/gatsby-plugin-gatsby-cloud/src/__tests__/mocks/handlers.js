import { rest } from "msw"

export const handlers = [
  rest.get(`https://test.com/success`, async (req, res, ctx) =>
    res(
      ctx.json({
        currentBuild: {
          id: `122`,
          buildStatus: `SUCCESS`,
          createdAt: `2021-05-11T14:45:10.263Z`,
        },
        latestBuild: { id: `124`, buildStatus: `SUCCESS` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: `test` },
      })
    )
  ),
  rest.get(`https://test.com/error`, async (req, res, ctx) =>
    res(
      ctx.json({
        currentBuild: { id: `123`, buildStatus: `ERROR` },
        latestBuild: { id: `123`, buildStatus: `ERROR` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: `test` },
      })
    )
  ),
  rest.get(`https://test.com/building`, async (req, res, ctx) =>
    res(
      ctx.json({
        currentBuild: { id: `123`, buildStatus: `BUILDING` },
        latestBuild: { id: `123`, buildStatus: `SUCCESS` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: `test` },
      })
    )
  ),
  rest.get(`https://test.com/uptodate`, async (req, res, ctx) =>
    res(
      ctx.json({
        currentBuild: {
          id: `123`,
          buildStatus: `SUCCESS`,
          createdAt: `2021-05-11T14:45:10.263Z`,
        },
        latestBuild: { id: `1234`, buildStatus: `SUCCESS` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: `test` },
      })
    )
  ),
  rest.get(`https://test.com/fetching`, async (req, res, ctx) =>
    res(ctx.json({ currentBuild: {}, latestBuild: {}, siteInfo: {} }))
  ),
  rest.post(`http://test.com/events`, async (req, res, ctx) =>
    res(ctx.json({ message: `success` }))
  ),
  rest.get(
    `https://build-123-changed.gtsb.io/page-data/index/page-data.json`,
    async (req, res, ctx) => res(ctx.text(`abcdefg` + Date.now().toString()))
  ),
  rest.get(
    `https://build-123-unchanged.gtsb.io/page-data/index/page-data.json`,
    async (req, res, ctx) => res(ctx.text(`abcdefg`))
  ),

  rest.get(
    `https://content-sync-pretty-url.gtsb.io/__node-manifests/source-plugin/manifest-id.json`,
    async (_req, res, ctx) =>
      res(
        ctx.json({
          node: { id: `8378aa5f-291c-5182-8d54-e00ff9fbc11b` },
          page: { path: `/blog/automate-with-webhooks/` },
          foundPageBy: `ownerNodeId`,
        })
      )
  ),
  rest.get(
    `https://content-sync-pretty-url.gtsb.io/page-data/blog/automate-with-webhooks/page-data.json`,
    async (_req, res, ctx) => res(ctx.json({}))
  ),
  rest.get(
    `https://content-sync-pretty-url.gtsb.io/blog/automate-with-webhooks/`,
    async (_req, res, ctx) => res(ctx.json({}))
  ),

  rest.get(
    `https://content-sync-pretty-url-four-oh-four.gtsb.io/__node-manifests/source-plugin/manifest-id.json`,
    async (_req, res, ctx) => res(ctx.status(404))
  ),
]
