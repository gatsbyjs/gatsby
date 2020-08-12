import axios from "axios"
import { buildResponsiveSizes } from "../../utils/index"

jest.mock(`axios`)

const reporterMock = jest.fn()

describe(`builds responsive sizes`, () => {
  const imageUrl = `//images.ctfassets.net/rocybtov1ozk/wtrHxeu3zEoEce2MokCSi/73dce36715f16e27cf5ff0d2d97d7dff/quwowooybuqbl6ntboz3.jpg`
  const metadata = {
    width: 800,
    height: 600,
    density: 72,
  }
  const options = {
    maxWidth: 2000,
  }

  beforeEach(() => {
    axios.mockClear()
    axios.mockImplementation(() =>
      Promise.resolve({
        data: `mockedBase64`,
        headers: {
          "content-type": `image/jpeg`,
        },
      })
    )
  })

  test(`proberly calculates responsive values`, async () => {
    const result = await buildResponsiveSizes(
      { metadata, imageUrl, options },
      reporterMock
    )

    expect(result).toMatchSnapshot()
  })
  test(`does not remove search parameters`, async () => {
    const result = await buildResponsiveSizes(
      { metadata, imageUrl: `${imageUrl}?q=70`, options },
      reporterMock
    )

    expect(result.src).toContain(`q=70`)
    expect(result.srcSet).toContain(`q=70`)
    expect(result.webpSrcSet).toContain(`q=70`)
  })
})
