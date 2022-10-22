jest.useFakeTimers()
jest.spyOn(global, 'setTimeout')

const config = require('../../app/config/verify')
jest.mock('../../app/config/verify')

jest.mock('../../app/poll/poll-inbound')
const pollInbound = require('../../app/poll/poll-inbound')

const poll = require('../../app/poll')

describe('start polling', () => {
  beforeEach(() => {
    config.pollingInterval = 1000
    config.pollingActive = true
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should call pollInbound once', async () => {
    await poll.start()
    expect(pollInbound).toHaveBeenCalledTimes(1)
  })

  test('should call setTimeout once', async () => {
    await poll.start()
    expect(setTimeout).toHaveBeenCalledTimes(1)
  })

  test('should not throw when pollInbound throws', async () => {
    pollInbound.mockRejectedValue(new Error('Verify issue'))

    const wrapper = async () => {
      await poll.start()
    }

    expect(wrapper).not.toThrow()
  })

  test('should call setTimeout with processing.start and processingConfig.settlementProcessingInterval', async () => {
    await poll.start()
    expect(setTimeout).toHaveBeenCalledWith(poll.start, config.pollingInterval)
  })

  test('should call setTimeout when pollInterval throws', async () => {
    pollInbound.mockRejectedValue(new Error('Verify issue'))
    await poll.start()
    expect(setTimeout).toHaveBeenCalled()
  })

  test('should call setTimeout once when polling is disabled', async () => {
    config.pollingActive = false
    await poll.start()
    expect(setTimeout).toHaveBeenCalledTimes(1)
  })

  test('should not call pollInbound when polling is disabled', async () => {
    config.pollingActive = false
    await poll.start()
    expect(pollInbound).toHaveBeenCalledTimes(0)
  })
})
