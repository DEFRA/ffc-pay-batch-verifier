jest.mock('../../../app/storage')
const mockStorage = require('../../../app/storage')
const failure = require('../../../app/verify/failure')

const FILES = {
  batch: 'PENDING_TEST_BATCH.dat',
  control: 'CTL_PENDING_TEST_BATCH.dat',
  checksum: 'PENDING_TEST_BATCH.txt',
  checksumControl: 'CTL_PENDING_TEST_BATCH.txt'
}

describe('failure', () => {
  let pendingFilenames

  beforeEach(() => {
    jest.resetAllMocks()
    pendingFilenames = {
      batchFilename: FILES.batch,
      controlFilename: FILES.control,
      checksumFilename: FILES.checksum,
      checksumControlFilename: FILES.checksumControl
    }
  })

  test.each(Object.values(FILES))('quarantines file %s', async (filename) => {
    await failure(pendingFilenames)
    expect(mockStorage.quarantineFile).toHaveBeenCalledWith(filename)
  })
})
