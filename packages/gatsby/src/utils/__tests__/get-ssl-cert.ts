jest.mock(`fs`, () => {
  const fs = jest.requireActual(`fs`)
  return {
    ...fs,
    readFileSync: jest.fn(file => `${file}::file`),
  }
})
jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panic: jest.fn(),
    info: jest.fn(),
  }
})
jest.mock(`devcert`, () => {
  return {
    certificateFor: jest.fn(),
  }
})

import { certificateFor as getDevCert } from "devcert"
import reporter from "gatsby-cli/lib/reporter"
import { getSslCert, IGetSslCertArgs } from "../get-ssl-cert"

describe(`gets ssl certs`, () => {
  beforeEach(() => {
    // @ts-ignore
    reporter.panic.mockClear()
    // @ts-ignore
    reporter.info.mockClear()
    // @ts-ignore
    getDevCert.mockClear()
  })

  describe(`Custom SSL certificate`, () => {
    it.each([
      { name: ``, directory: ``, certFile: `foo` },
      { name: ``, directory: ``, keyFile: `bar` },
    ])(
      `panic if cert and key are not both included`,
      (args: IGetSslCertArgs): void => {
        getSslCert(args)

        // @ts-ignore
        expect(reporter.panic.mock.calls).toMatchSnapshot()
      }
    )

    it(`loads a cert relative to a directory`, () => {
      expect(
        getSslCert({
          name: `mock-cert`,
          certFile: `foo.crt`,
          keyFile: `foo.key`,
          directory: `/app/directory`,
        })
      ).resolves.toMatchSnapshot()
    })
    it(`loads a cert from absolute paths`, () => {
      expect(
        getSslCert({
          name: `mock-cert`,
          certFile: `/foo.crt`,
          keyFile: `/foo.key`,
          directory: `/app/directory`,
        })
      ).resolves.toMatchSnapshot()
    })
  })
  describe(`automatic SSL certificate`, () => {
    it(`sets up dev cert`, () => {
      getSslCert({ name: `mock-cert`, directory: `` })
      expect(getDevCert).toBeCalledWith(`mock-cert`, {
        getCaPath: true,
        skipCertutilInstall: false,
        ui: {
          getWindowsEncryptionPassword: expect.any(Function),
        },
      })

      // @ts-ignore
      expect(reporter.info.mock.calls).toMatchSnapshot()
    })
    it(`panics if certificate can't be created`, () => {
      // @ts-ignore
      getDevCert.mockImplementation(() => {
        throw new Error(`mock error message`)
      })
      getSslCert({ name: `mock-cert`, directory: `` })
      // @ts-ignore
      expect(reporter.panic.mock.calls).toMatchSnapshot()
    })
  })
})
