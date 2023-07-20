jest.mock('../../../app/verify/get-number-of-glos-invoice-lines')
const { getNumberOfGlosInvoiceLines: mockGetNumberOfGlosInvoiceLines } = require('../../../app/verify/get-number-of-glos-invoice-lines')

const { validateGlosFiles } = require('../../../app/verify/validate-glos-files')

let batchFile
let controlFile

describe('get files', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should call mockGetNumberOfGlosInvoiceLines', async () => {
    validateGlosFiles(batchFile, controlFile)
    expect(mockGetNumberOfGlosInvoiceLines).toBeCalled()
  })

  test('Should call mockGetNumberOfGlosInvoiceLines once', async () => {
    validateGlosFiles(batchFile, controlFile)
    expect(mockGetNumberOfGlosInvoiceLines).toBeCalledTimes(1)
  })

  test('Should call mockGetNumberOfGlosInvoiceLines with batchFile', async () => {
    validateGlosFiles(batchFile, controlFile)
    expect(mockGetNumberOfGlosInvoiceLines).toBeCalledWith(batchFile)
  })
})
