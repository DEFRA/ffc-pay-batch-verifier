jest.mock('../../app/config/verify', () => ({ totalRetries: 1 }))
const retry = require('../../app/retry')

describe('retry', () => {
  let mockFunction

  beforeEach(() => {
    jest.clearAllMocks()
    mockFunction = jest.fn().mockResolvedValue('success')
  })

  test('calls function once if successful', async () => {
    await retry(mockFunction)
    expect(mockFunction).toHaveBeenCalledTimes(1)
  })

  test('throws error if retries exceeded', async () => {
    mockFunction.mockImplementation(() => { throw new Error() })
    await expect(retry(mockFunction)).rejects.toThrow()
  })

  test('retries function call until success', async () => {
    mockFunction.mockRejectedValueOnce('error').mockResolvedValueOnce('success')
    await retry(mockFunction)
    expect(mockFunction).toHaveBeenCalledTimes(2)
  })

  test.each([
    { retries: 1, exponential: false, expectedCalls: 2 },
    { retries: 30, exponential: false, expectedCalls: 31 },
    { retries: 1, exponential: true, expectedCalls: 2 },
    { retries: 30, exponential: true, expectedCalls: 31 }
  ])(
    'retries function call with retries=$retries and exponential=$exponential',
    async ({ retries, exponential, expectedCalls }) => {
      mockFunction.mockRejectedValue('error')
      try { await retry(mockFunction, retries, 0, exponential) } catch {}
      expect(mockFunction).toHaveBeenCalledTimes(expectedCalls)
    }
  )
})
