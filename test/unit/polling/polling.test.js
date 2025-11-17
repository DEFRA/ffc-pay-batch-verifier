jest.useFakeTimers()
jest.spyOn(global, 'setTimeout')

const config = require('../../../app/config/verify')
jest.mock('../../../app/config/verify')

jest.mock('../../../app/polling/poll-inbound')
const pollInbound = require('../../../app/polling/poll-inbound')

const polling = require('../../../app/polling')

describe('polling.start', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    config.pollingInterval = 1000
    config.pollingActive = true
  })

  test('calls pollInbound and schedules next poll', async () => {
    await polling.start()
    expect(pollInbound).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenCalledWith(polling.start, config.pollingInterval)
  })

  test('does not throw if pollInbound fails', async () => {
    pollInbound.mockRejectedValue(new Error('Verify issue'))
    await expect(polling.start()).resolves.not.toThrow()
    expect(setTimeout).toHaveBeenCalled()
  })

  test.each([
    ['disabled polling', false, 0, 1]
  ])(
    'pollingActive=%s: pollInbound calls=%i, setTimeout calls=%i',
    async (_, pollingActive, expectedPolls, expectedTimeouts) => {
      config.pollingActive = pollingActive
      await polling.start()
      expect(pollInbound).toHaveBeenCalledTimes(expectedPolls)
      expect(setTimeout).toHaveBeenCalledTimes(expectedTimeouts)
    }
  )
})
