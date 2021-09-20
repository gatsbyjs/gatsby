import render from "./renderer"

export default async function createPlan(context, cb) {
  const result = await render(context.recipe, cb, context)
  return result
}
