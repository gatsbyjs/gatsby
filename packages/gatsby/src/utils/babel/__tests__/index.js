import runner from "@babel/helper-plugin-test-runner"

beforeAll(() => {
  process.env.REPLACE_ME = `env-var-replacement`
})

afterAll(() => {
  delete process.env.REPLACE_ME
})

runner(__dirname)
