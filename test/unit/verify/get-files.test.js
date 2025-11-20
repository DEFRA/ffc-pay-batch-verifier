jest.mock('../../../app/storage')
const mockStorage = require('../../../app/storage')
jest.mock('../../../app/retry')
const mockRetry = require('../../../app/retry')

const getFiles = require('../../../app/verify/get-files')

const PENDING_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const PENDING_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.dat'
const PENDING_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const PENDING_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

const FILE_CONTENT = 'file content'

let pendingFilenames

describe('get files', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockStorage.getFile.mockResolvedValue(FILE_CONTENT)
    mockRetry.mockImplementation(fn => fn())

    pendingFilenames = {
      batchFilename: PENDING_BATCH_BLOB_NAME,
      controlFilename: PENDING_CTL_BATCH_BLOB_NAME,
      checksumFilename: PENDING_CHECKSUM_BLOB_NAME,
      checksumControlFilename: PENDING_CTL_CHECKSUM_BLOB_NAME
    }
  })

  test.each([
    [1, PENDING_BATCH_BLOB_NAME],
    [2, PENDING_CTL_BATCH_BLOB_NAME],
    [3, PENDING_CHECKSUM_BLOB_NAME],
    [4, PENDING_CTL_CHECKSUM_BLOB_NAME]
  ])('calls getFile #%i with %s', async (nth, filename) => {
    await getFiles(pendingFilenames)
    expect(mockStorage.getFile).toHaveBeenNthCalledWith(nth, filename)
  })

  test('returns array of filenames and file contents', async () => {
    const result = await getFiles(pendingFilenames)
    expect(result).toEqual([
      { filename: PENDING_BATCH_BLOB_NAME, content: FILE_CONTENT },
      { filename: PENDING_CTL_BATCH_BLOB_NAME, content: FILE_CONTENT },
      { filename: PENDING_CHECKSUM_BLOB_NAME, content: FILE_CONTENT },
      { filename: PENDING_CTL_CHECKSUM_BLOB_NAME, content: FILE_CONTENT }
    ])
  })

  test('retries getting files', async () => {
    await getFiles(pendingFilenames)
    expect(mockRetry).toHaveBeenCalledTimes(4)
  })

  test('throws if any file is not found', async () => {
    mockStorage.getFile.mockRejectedValueOnce(new Error('not found'))
    await expect(getFiles(pendingFilenames)).rejects.toThrow('not found')
  })
})
