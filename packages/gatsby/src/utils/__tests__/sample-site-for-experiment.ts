import sampleSiteForExperiment from "../sample-site-for-experiment"

jest.mock(`gatsby-telemetry/lib/repository-id`)
import {
  getRepositoryId,
  IRepositoryId,
} from "gatsby-telemetry/lib/repository-id"
;((getRepositoryId as unknown) as jest.Mock<IRepositoryId>).mockReturnValue({
  repositoryId: `mockId`,
})

describe(`sampleSiteForExperiment`, () => {
  it(`returns true or false depending on if they randomly are bucketed in or not`, () => {
    const experiments = [`a`, `b`, `c`, `d`, `e`, `f`, `h`, `i`]
    experiments.forEach(experiment => {
      expect(sampleSiteForExperiment(experiment, 0)).toBeFalsy()
      expect(sampleSiteForExperiment(experiment, 50)).toMatchSnapshot(
        experiment
      )
      expect(sampleSiteForExperiment(experiment, 100)).toBeTruthy()
    })
  })
})
