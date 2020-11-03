import render from "./renderer"

export default async function createPlan(context, cb) {
  return await render(context.recipe, cb, context)
}
