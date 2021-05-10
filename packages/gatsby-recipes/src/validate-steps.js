import render from "./renderer"

export default async function validateSteps(steps) {
  const errors = []
  const firstStepPlan = await render(steps[0])

  if (firstStepPlan.length) {
    errors.push({
      step: 0,
      validationError: `Resources should not be placed in the introduction step (0)`,
    })
  }

  return errors
}
