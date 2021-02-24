import render from "./renderer"

export default async function createPlan(context, cb) {
  try {
    const result = await render(context.recipe, cb, context)
    return result
  } catch (e) {
    throw e
  }
}
