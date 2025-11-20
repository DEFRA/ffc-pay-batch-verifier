jest.mock('../../../app/verify/success')
jest.mock('../../../app/verify/failure')
jest.mock('../../../app/verify/get-files')
jest.mock('../../../app/verify/validate-glos-files')

const mockSuccess = require('../../../app/verify/success')
const mockFailure = require('../../../app/verify/failure')
const mockGetFiles = require('../../../app/verify/get-files')
const { validateGlosFiles: mockValidateGlosFiles } = require('../../../app/verify/validate-glos-files')

const { SITI_AGRI, GLOS, GENESIS, IMPS } = require('../../../app/constants/file-types')
const validate = require('../../../app/verify/validate')

const PENDING = {
  batchFilename: 'PENDING_TEST_BATCH.dat',
  controlFilename: 'CTL_PENDING_TEST_BATCH.dat',
  checksumFilename: 'PENDING_TEST_BATCH.txt',
  checksumControlFilename: 'CTL_PENDING_TEST_BATCH.txt'
}

const PROCESSED = {
  batchFilename: 'TEST_BATCH.dat',
  controlFilename: 'CTL_TEST_BATCH.dat',
  checksumFilename: 'TEST_BATCH.txt',
  checksumControlFilename: 'CTL_TEST_BATCH.txt'
}

const VALID_CONTENT = 'This is valid content'
const INVALID_CONTENT = 'This is invalid content'
const VALID_HASH = '66782c2a5e08026b7dac0d6dc377cbc478eec6eaa32da3415616806deca338d0'

describe('validate', () => {
  let fileType, pendingFilenames, processedFilenames

  beforeEach(() => {
    jest.resetAllMocks()

    pendingFilenames = { ...PENDING }
    processedFilenames = { ...PROCESSED }
    fileType = SITI_AGRI

    mockGetFiles.mockImplementation(() => [
      { filename: PENDING.controlFilename, content: '' },
      { filename: PENDING.batchFilename, content: VALID_CONTENT },
      { filename: PENDING.checksumControlFilename, content: '' },
      { filename: PENDING.checksumFilename, content: VALID_HASH }
    ])
  })

  test('retrieves pending files', async () => {
    await validate(SITI_AGRI, pendingFilenames, processedFilenames)
    expect(mockGetFiles).toHaveBeenCalledWith(pendingFilenames)
  })

  describe('Glos file validation', () => {
    beforeEach(() => { fileType = GLOS })

    test('calls validateGlosFiles', async () => {
      await validate(fileType, pendingFilenames, processedFilenames)
      expect(mockValidateGlosFiles).toHaveBeenCalled()
    })

    test.each([
      [true, false],
      [false, true]
    ])('calls failure=%p when Glos validation returns %p', async (expectedFailure, validationReturn) => {
      mockValidateGlosFiles.mockReturnValue(validationReturn)
      await validate(fileType, pendingFilenames, processedFilenames)
      if (expectedFailure) {
        expect(mockFailure).toHaveBeenCalled()
      } else {
        expect(mockFailure).not.toHaveBeenCalled()
      }
    })
  })

  describe('Siti Agri validation', () => {
    beforeEach(() => { fileType = SITI_AGRI })

    test('calls success if content matches hash', async () => {
      await validate(fileType, pendingFilenames, processedFilenames)
      expect(mockSuccess).toHaveBeenCalledWith(pendingFilenames, processedFilenames)
    })

    test('calls failure if content does not match hash', async () => {
      mockGetFiles.mockImplementation(() => [
        { filename: PENDING.batchFilename, content: INVALID_CONTENT },
        { filename: PENDING.checksumFilename, content: VALID_HASH }
      ])
      await validate(fileType, pendingFilenames, processedFilenames)
      expect(mockFailure).toHaveBeenCalledWith(pendingFilenames)
    })
  })

  test.each([GENESIS, IMPS])('calls success for file type %s', async (type) => {
    fileType = type
    await validate(type, pendingFilenames, processedFilenames)
    expect(mockSuccess).toHaveBeenCalledWith(pendingFilenames, processedFilenames)
  })
})
