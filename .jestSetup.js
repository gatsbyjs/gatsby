process.env.GATSBY_RECIPES_NO_COLOR = "true"
process.env.GATSBY_SHOULD_TRACK_IMAGE_CDN_URLS = "true"

// Potrace has a dependency on giwrap which has a process.nextTick as a sideEffect which messes up with jest.
jest.mock(`gifwrap`, () => jest.fn())
