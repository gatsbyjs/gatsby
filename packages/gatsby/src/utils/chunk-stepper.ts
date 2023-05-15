export function chunkStepper(
  runFn: (count: number) => void,
  config: {
    until: number
    every?: number
  }[]
) {
  if (typeof runFn !== `function`) {
    throw new Error(`You must pass a function to chunkSteppers first argument`)
  }
  if (!Array.isArray(config) || !config.length) {
    throw new Error(
      `You must pass an array of objects to chunkSteppers second argument`
    )
  }

  let currentValues = config[0]
  let counter = 0

  const tick = (fn: (count: number) => void) => {
    if (!currentValues) {
      // we've reached the end of the config
      return
    }

    if (counter++ >= currentValues.until) {
      currentValues = config[config.indexOf(currentValues) + 1]
    }

    if (
      typeof currentValues.every === `number` &&
      counter % currentValues.every !== 0
    ) {
      return fn(counter)
    }
  }

  return { tick }
}
