module.exports = {
  trackFeatureIsUsed: jest.fn(),
  trackCli: jest.fn(),
  trackError: jest.fn(),
  trackBuildError: jest.fn(),
  setDefaultTags: jest.fn(),
  decorateEvent: jest.fn(),
  setTelemetryEnabled: jest.fn(),
  startBackgroundUpdate: jest.fn(),
  isTrackingEnabled: jest.fn(),
  aggregateStats: jest.fn(),
  addSiteMeasurement: jest.fn(),
  expressMiddleware: jest.fn(),
}
