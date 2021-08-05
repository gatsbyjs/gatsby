import render from "./renderer"

export default function ApplyPlan(context, cb) {
  return render(context.recipe, cb, context, true, true, true)
}
