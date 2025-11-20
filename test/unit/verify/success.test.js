jest.mock('../../../app/storage')
const mockStorage = require('../../../app/storage')
const success = require('../../../app/verify/success')

const PENDING = {
  batch: 'PENDING_TEST_BATCH.dat',
  control: 'CTL_PENDING_TEST_BATCH.dat',
  checksum: 'PENDING_TEST_BATCH.txt',
  checksumControl: 'CTL_PENDING_TEST_BATCH.txt'
}

const PROCESSED = {
  batch: 'TEST_BATCH.dat',
  control: 'CTL_TEST_BATCH.dat',
  checksum: 'TEST_BATCH.txt',
  checksumControl: 'CTL_TEST_BATCH.txt'
}

describe('success', () => {
  let pendingFilenames, processedFilenames

  beforeEach(() => {
    jest.resetAllMocks()
    pendingFilenames = { ...PENDING }
    processedFilenames = { ...PROCESSED }
  })

  test.each([
    ['batch', PENDING.batch, PROCESSED.batch],
    ['control', PENDING.control, PROCESSED.control],
    ['checksum', PENDING.checksum, PROCESSED.checksum],
    ['checksumControl', PENDING.checksumControl, PROCESSED.checksumControl]
  ])('renames %s file', async (_, pendingFile, processedFile) => {
    await success(pendingFilenames, processedFilenames)
    expect(mockStorage.renameFile).toHaveBeenCalledWith(pendingFile, processedFile)
  })

  test.each([
    PROCESSED.checksumControl,
    PROCESSED.checksum,
    PROCESSED.control
  ])('archives file %s', async (file) => {
    await success(pendingFilenames, processedFilenames)
    expect(mockStorage.archiveFile).toHaveBeenCalledWith(file)
  })
})
