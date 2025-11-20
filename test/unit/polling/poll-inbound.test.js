jest.mock('../../../app/storage')
jest.mock('../../../app/verify')

const mockStorage = require('../../../app/storage')
const mockVerify = require('../../../app/verify')
const pollInbound = require('../../../app/polling/poll-inbound')

const FILES = ['CTL_PENDING_TEST_BATCH_1.dat', 'CTL_PENDING_TEST_BATCH_2.dat']

describe('pollInbound', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStorage.getPendingControlFiles.mockResolvedValue(FILES)
    mockVerify.mockResolvedValue()
  })

  test('retrieves pending control files', async () => {
    await pollInbound()
    expect(mockStorage.getPendingControlFiles).toHaveBeenCalled()
  })

  test('verifies each file', async () => {
    await pollInbound()
    expect(mockVerify).toHaveBeenCalledTimes(FILES.length)
    FILES.forEach((file, idx) => {
      expect(mockVerify).toHaveBeenNthCalledWith(idx + 1, file)
    })
  })

  test('continues processing remaining files if one verify fails', async () => {
    mockVerify.mockRejectedValueOnce(new Error('verify failed'))
    await pollInbound()
    expect(mockVerify).toHaveBeenCalledTimes(FILES.length)
  })

  test('throws if unable to retrieve inbound files', async () => {
    mockStorage.getPendingControlFiles.mockRejectedValueOnce(new Error('fetch failed'))
    await expect(pollInbound()).rejects.toThrow('fetch failed')
  })

  test('does nothing if no files are pending', async () => {
    mockStorage.getPendingControlFiles.mockResolvedValue([])
    await pollInbound()
    expect(mockVerify).not.toHaveBeenCalled()
  })
})
