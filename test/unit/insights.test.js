describe('Application Insights', () => {
  const DEFAULT_ENV = process.env
  let applicationInsights

  beforeEach(() => {
    // important to clear the cache when mocking environment variables
    jest.resetModules()
    jest.mock('applicationinsights', () => {
      return {
        setup: jest.fn().mockReturnThis(),
        setAutoCollectDependencies: jest.fn().mockReturnThis(),
        start: jest.fn(),
        defaultClient: {
          context: {
            keys: [],
            tags: []
          }
        }
      }
    })
    applicationInsights = require('applicationinsights')
    process.env = { ...DEFAULT_ENV }
  })

  afterAll(() => {
    process.env = DEFAULT_ENV
  })

  test('does not setup application insights if no connection string present', () => {
    const appInsights = require('../../app/insights')
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = undefined
    appInsights.setup()
    expect(applicationInsights.setup.mock.calls.length).toBe(0)
  })

  test('does setup application insights if connection string present', () => {
    const appInsights = require('../../app/insights')
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'test-key'
    appInsights.setup()
    expect(applicationInsights.setup.mock.calls.length).toBe(1)
  })
})
