import { rest } from 'msw'

export const handlers = [
  rest.get('https://test.com/success', async (req, res, ctx) => {
    return res(
      ctx.json({
        currentBuild: { id: `123`, buildStatus: `SUCCESS` },
        latestBuild: { id: `123`, buildStatus: `SUCCESS` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: 'test'}
      })
    )
  }),
  rest.get('https://test.com/error', async (req, res, ctx) => {
    return res(
      ctx.json({
        currentBuild: { id: `123`, buildStatus: `ERROR` },
        latestBuild: { id: `123`, buildStatus: `ERROR` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: 'test'}
      })
    )
  }),
  rest.get('https://test.com/building', async (req, res, ctx) => {
    return res(
      ctx.json({
        currentBuild: { id: `123`, buildStatus: `BUILDING` },
        latestBuild: { id: `123`, buildStatus: `SUCCESS` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: 'test'}
      })
    )
  }),
  rest.get('https://test.com/uptodate', async (req, res, ctx) => {
    return res(
      ctx.json({
        currentBuild: { id: null, buildStatus: `SUCCESS` },
        latestBuild: { id: null, buildStatus: `SUCCESS` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: 'test'}
      })
    )
  }),
]
