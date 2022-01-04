process.env.GATSBY_RECIPES_NO_COLOR = "true"

// Potrace has a dependency on giwrap which has a process.nextTick as a sideEffect which messes up with jest.
jest.mock(`gifwrap`, () => jest.fn())
