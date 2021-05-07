import { rest } from 'msw'

export const handlers = [
  rest.get('/success', async (req, res, ctx) => {
    return res(
      ctx.json({
        currentBuild: { id: `123`, buildStatus: `SUCCESS` },
        latestBuild: { id: `123`, buildStatus: `SUCCESS` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: 'test'}
      })
    )
  }),
  rest.get('/error', async (req, res, ctx) => {
    return res(
      ctx.json({
        currentBuild: { id: `123`, buildStatus: `ERROR` },
        latestBuild: { id: `123`, buildStatus: `ERROR` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: 'test'}
      })
    )
  }),
  rest.get('/building', async (req, res, ctx) => {
    return res(
      ctx.json({
        currentBuild: { id: `123`, buildStatus: `BUILDING` },
        latestBuild: { id: `123`, buildStatus: `SUCCESS` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: 'test'}
      })
    )
  }),
  rest.get('/uptodate', async (req, res, ctx) => {
    return res(
      ctx.json({
        currentBuild: { id: null, buildStatus: `SUCCESS` },
        latestBuild: { id: null, buildStatus: `SUCCESS` },
        siteInfo: { orgId: `999`, siteId: `111`, sitePrefix: 'test'}
      })
    )
  }),
]
