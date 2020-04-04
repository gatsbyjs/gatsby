const resources = require(`./resources`)
const SITE_ROOT = process.cwd()
const ctx = { root: SITE_ROOT }

const applyPlan = async plan => {
  const resource = resources[plan.resourceName]

  const result = await Promise.all(
    plan.resource.map(r => resource.create(ctx, r))
  )
}

module.exports = applyPlan
