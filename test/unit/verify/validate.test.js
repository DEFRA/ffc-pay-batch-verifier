jest.mock('../../../app/verify/success')
const mockSuccess = require('../../../app/verify/success')

jest.mock('../../../app/verify/failure')
const mockFailure = require('../../../app/verify/failure')

jest.mock('../../../app/verify/get-files')
const mockGetFiles = require('../../../app/verify/get-files')

jest.mock('../../../app/verify/validate-glos-files')
const { validateGlosFiles: mockValidateGlosFiles } = require('../../../app/verify/validate-glos-files')

const { SITI_AGRI, GLOS } = require('../../../app/constants/file-types')

const validate = require('../../../app/verify/validate')

const VALID_CONTENT = 'This is valid content'
const INVALID_CONTENT = 'This is invalid content'
const VALID_HASH = '66782c2a5e08026b7dac0d6dc377cbc478eec6eaa32da3415616806deca338d0'

const PENDING_BATCH_BLOB_NAME = 'PENDING_TEST_BATCH.dat'
const PENDING_CTL_BATCH_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.dat'
const PENDING_CHECKSUM_BLOB_NAME = 'PENDING_TEST_BATCH.txt'
const PENDING_CTL_CHECKSUM_BLOB_NAME = 'CTL_PENDING_TEST_BATCH.txt'

const PROCESSED_BATCH_BLOB_NAME = 'TEST_BATCH.dat'
const PROCESSED_CTL_BATCH_BLOB_NAME = 'CTL_TEST_BATCH.dat'
const PROCESSED_CHECKSUM_BLOB_NAME = 'TEST_BATCH.txt'
const PROCESSED_CTL_CHECKSUM_BLOB_NAME = 'CTL_TEST_BATCH.txt'

let fileType
let pendingFilenames
let processedFilenames

describe('validate', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    mockGetFiles.mockImplementation(() => {
      return [
        { filename: PENDING_CTL_BATCH_BLOB_NAME, content: '' },
        { filename: PENDING_BATCH_BLOB_NAME, content: VALID_CONTENT },
        { filename: PENDING_CTL_CHECKSUM_BLOB_NAME, content: '' },
        { filename: PENDING_CHECKSUM_BLOB_NAME, content: VALID_HASH }
      ]
    })

    fileType = SITI_AGRI

    pendingFilenames = {
      controlFilename: PENDING_CTL_BATCH_BLOB_NAME,
      batchFilename: PENDING_BATCH_BLOB_NAME,
      checksumControlFilename: PENDING_CTL_CHECKSUM_BLOB_NAME,
      checksumFilename: PENDING_CHECKSUM_BLOB_NAME
    }

    processedFilenames = {
      controlFilename: PROCESSED_CTL_BATCH_BLOB_NAME,
      batchFilename: PROCESSED_BATCH_BLOB_NAME,
      checksumControlFilename: PROCESSED_CTL_CHECKSUM_BLOB_NAME,
      checksumFilename: PROCESSED_CHECKSUM_BLOB_NAME
    }
  })

  test('should get file content for pending files', async () => {
    await validate(fileType, pendingFilenames, processedFilenames)
    expect(mockGetFiles).toBeCalledWith(pendingFilenames)
  })

  test('should validate Glos file when is Glos file', async () => {
    fileType = GLOS
    await validate(fileType, pendingFilenames, processedFilenames)
    expect(mockValidateGlosFiles).toBeCalled()
  })

  test('should fail validation when Glos validation fails', async () => {
    fileType = GLOS
    mockValidateGlosFiles.mockReturnValue(false)
    await validate(fileType, pendingFilenames, processedFilenames)
    expect(mockFailure).toBeCalled()
  })

  test('should not fail validation when Glos validation passes', async () => {
    fileType = GLOS
    mockValidateGlosFiles.mockReturnValue(true)
    await validate(fileType, pendingFilenames, processedFilenames)
    expect(mockFailure).not.toBeCalled()
  })

  test('should call success when Siti Agri content matches hash', async () => {
    await validate(fileType, pendingFilenames, processedFilenames)
    expect(mockSuccess).toBeCalledWith(pendingFilenames, processedFilenames)
  })

  test('should call failure when Siti Agri content does not match hash', async () => {
    mockGetFiles.mockImplementation(() => {
      return [
        { filename: PENDING_BATCH_BLOB_NAME, content: INVALID_CONTENT },
        { filename: PENDING_CHECKSUM_BLOB_NAME, content: VALID_HASH }
      ]
    })
    await validate(fileType, pendingFilenames, processedFilenames)
    expect(mockFailure).toBeCalledWith(pendingFilenames)
  })
})
