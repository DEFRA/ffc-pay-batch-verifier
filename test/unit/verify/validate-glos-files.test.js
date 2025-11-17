jest.mock('../../../app/verify/get-number-of-glos-invoice-lines')
const { getNumberOfGlosInvoiceLines: mockGetNumberOfGlosInvoiceLines } = require('../../../app/verify/get-number-of-glos-invoice-lines')
const { validateGlosFiles } = require('../../../app/verify/validate-glos-files')

describe('validateGlosFiles', () => {
  let batchFile, controlFile

  beforeEach(() => {
    jest.resetAllMocks()
    batchFile = ''
  })

  test('calls getNumberOfGlosInvoiceLines with batchFile once', () => {
    validateGlosFiles(batchFile, controlFile)
    expect(mockGetNumberOfGlosInvoiceLines).toHaveBeenCalledTimes(1)
    expect(mockGetNumberOfGlosInvoiceLines).toHaveBeenCalledWith(batchFile)
  })

  test.each([
    [7, '7', true],
    [7, '1', false],
    [7, 'abcdefg', false]
  ])('returns %p when batch lines=%i and controlFile="%s"', (lines, control, expected) => {
    controlFile = control
    mockGetNumberOfGlosInvoiceLines.mockReturnValue(lines)
    const result = validateGlosFiles(batchFile, controlFile)
    expect(result).toBe(expected)
  })
})
