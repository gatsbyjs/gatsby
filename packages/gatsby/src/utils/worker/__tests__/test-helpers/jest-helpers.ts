export const itWhenLMDB = process.env.GATSBY_EXPERIMENTAL_LMDB_STORE
  ? it
  : it.skip
